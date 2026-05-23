/**
 * Execute manifest_fetch pipeline jobs: allowlisted HTTP + observation staging.
 */

import type { ManifestFetchResultItem } from '@/lib/agent-manifest-source-fetch';
import { runManifestUrlFetchBatch } from '@/lib/agent-manifest-source-fetch';
import { loadRunMemory, saveRunMemory } from '@/lib/agent-run-memory';
import { resolveSourceSlugForManifestLabel } from '@/lib/intelligence-manifest-source-bridge';
import { upsertCountryObservation } from './observation-writer';
import {
  extractFromRestCountriesJson,
  extractFromWorldBankCountryJson,
  isWorldBankManifestLabel,
  tryParseJsonBody,
} from './manifest-json-extract';
import { manifestDedupeKey, manifestExcerptFieldPath } from './manifest-field-paths';
import prisma from '@/lib/prisma';
import { logIntelligence } from './intelligence-log';
import { buildManifestFetchLineageFacet } from './openlineage-facet';
import { detectRestCountriesSchemaDrift, detectWorldBankCountrySchemaDrift } from './schema-drift';
import { stampBronzeIngestAt } from './medallion-timestamps';

const EXCERPT_STORE_MAX = 4000;

export type ManifestFetchJobResult = {
  observationsWritten: number;
  fetchesAttempted: number;
  fetchesOk: number;
  country: string;
  countryId: number;
  lineageFacet?: ReturnType<typeof buildManifestFetchLineageFacet> | null;
};

function trimExcerpt(s: string | undefined): string | null {
  if (!s || !s.trim()) return null;
  const t = s.trim();
  return t.length <= EXCERPT_STORE_MAX ? t : `${t.slice(0, EXCERPT_STORE_MAX)}…`;
}

async function resolveSourceId(slug: string): Promise<string | null> {
  const row = await prisma.intelligenceSource.findUnique({
    where: { slug },
    select: { id: true },
  });
  return row?.id ?? null;
}

async function writeManifestObservation(args: {
  countryId: number;
  runId: string | null;
  categoryId: string;
  sourceLabel: string;
  sourceSlug: string;
  sourceId: string;
  url: string;
  item: ManifestFetchResultItem;
  extra?: {
    fieldPath: string;
    valueJson: string;
    valueNumeric: number | null;
    confidence: number;
    verificationStatus: 'pending' | 'estimated';
  };
}): Promise<void> {
  const fieldPath =
    args.extra?.fieldPath ?? manifestExcerptFieldPath(args.categoryId, args.sourceLabel);
  const dedupeKey =
    args.extra != null
      ? `manifest_extract:${args.countryId}:${args.extra.fieldPath}:${args.sourceSlug}`
      : manifestDedupeKey(args.countryId, args.categoryId, args.sourceLabel);

  const valueJson =
    args.extra?.valueJson ??
    JSON.stringify({
      ok: args.item.ok,
      httpStatus: args.item.httpStatus,
      summary: args.item.ok ? 'Manifest fetch snapshot' : (args.item.error ?? 'fetch_failed'),
      fetchedAt: args.item.fetchedAt,
    });

  await upsertCountryObservation({
    countryId: args.countryId,
    fieldPath,
    valueJson,
    valueNumeric: args.extra?.valueNumeric ?? null,
    confidence: args.extra?.confidence ?? 0.45,
    sourceId: args.sourceId,
    runId: args.runId,
    dedupeKey,
    sourceUrl: args.url,
    rawExcerpt: trimExcerpt(args.item.excerpt),
    rawPayload: args.item.excerpt ? JSON.stringify({ excerptLen: args.item.excerpt.length }) : null,
    verificationStatus: args.extra?.verificationStatus,
  });
}

export async function runManifestFetchJobForCountry(args: {
  countryId: number;
  manifestBatchSize?: number;
  runId?: string;
  categoryIds?: string[];
}): Promise<ManifestFetchJobResult> {
  const country = await prisma.country.findUnique({
    where: { id: args.countryId },
    select: { id: true, name: true, region: true },
  });
  if (!country) {
    throw new Error(`Country id=${args.countryId} not found`);
  }

  const mem = await loadRunMemory(country.name);
  const batch = await runManifestUrlFetchBatch({
    country: country.name,
    region: country.region,
    memory: mem,
    perCycle: args.manifestBatchSize ?? 12,
    categoryIds: args.categoryIds,
    logVerbose: () => {},
  });
  await saveRunMemory(mem);

  let observationsWritten = 0;
  const fetchesOk = batch.results.filter((r) => r.ok && r.excerpt).length;
  const observationFieldPaths: string[] = [];
  const sourceUrls: string[] = [];

  for (const item of batch.results) {
    if (!item.ok && !item.excerpt) continue;
    const slug = resolveSourceSlugForManifestLabel(item.sourceLabel);
    const sourceId = await resolveSourceId(slug);
    if (!sourceId) continue;

    const fieldPath = manifestExcerptFieldPath(item.categoryId, item.sourceLabel);
    sourceUrls.push(item.url);
    observationFieldPaths.push(fieldPath);

    await writeManifestObservation({
      countryId: country.id,
      runId: args.runId ?? null,
      categoryId: item.categoryId,
      sourceLabel: item.sourceLabel,
      sourceSlug: slug,
      sourceId,
      url: item.url,
      item,
    });
    observationsWritten += 1;

    if (item.sourceLabel === 'REST Countries API' && item.excerpt) {
      const parsed = tryParseJsonBody(item.excerpt);
      if (parsed) {
        const drift = detectRestCountriesSchemaDrift(parsed);
        if (!drift.ok) {
          logIntelligence('warn', 'rest_countries_schema_drift', {
            countryId: country.id,
            warnings: drift.warnings,
          });
        }
        for (const ext of extractFromRestCountriesJson(parsed)) {
          await writeManifestObservation({
            countryId: country.id,
            runId: args.runId ?? null,
            categoryId: item.categoryId,
            sourceLabel: item.sourceLabel,
            sourceSlug: slug,
            sourceId,
            url: item.url,
            item,
            extra: {
              fieldPath: ext.fieldPath,
              valueJson: JSON.stringify({
                value: ext.value,
                summary: ext.summary,
                source: 'restcountries_api',
              }),
              valueNumeric: ext.value,
              confidence: ext.confidence,
              verificationStatus: 'estimated',
            },
          });
          observationsWritten += 1;
          observationFieldPaths.push(ext.fieldPath);
        }
      }
    }

    if (isWorldBankManifestLabel(item.sourceLabel) && item.excerpt) {
      const parsed = tryParseJsonBody(item.excerpt);
      if (parsed) {
        const drift = detectWorldBankCountrySchemaDrift(parsed);
        if (!drift.ok) {
          logIntelligence('warn', 'world_bank_schema_drift', {
            countryId: country.id,
            warnings: drift.warnings,
          });
        }
        for (const ext of extractFromWorldBankCountryJson(parsed)) {
          await writeManifestObservation({
            countryId: country.id,
            runId: args.runId ?? null,
            categoryId: item.categoryId,
            sourceLabel: item.sourceLabel,
            sourceSlug: slug,
            sourceId,
            url: item.url,
            item,
            extra: {
              fieldPath: ext.fieldPath,
              valueJson: JSON.stringify({
                value: ext.value,
                summary: ext.summary,
                source: 'world_bank_api_v2',
              }),
              valueNumeric: ext.value > 0 ? ext.value : null,
              confidence: ext.confidence,
              verificationStatus: 'estimated',
            },
          });
          observationsWritten += 1;
          observationFieldPaths.push(ext.fieldPath);
        }
      }
    }
  }

  const lineageFacet =
    args.runId != null
      ? buildManifestFetchLineageFacet({
          runId: args.runId,
          jobKind: 'manifest_fetch',
          countryId: country.id,
          countryName: country.name,
          sourceUrls,
          observationFieldPaths,
        })
      : null;

  if (args.runId && lineageFacet) {
    await prisma.enrichmentRun.update({
      where: { id: args.runId },
      data: {
        statsJson: JSON.stringify({
          lineageFacet,
          observationsWritten,
          fetchesAttempted: batch.results.length,
          fetchesOk,
        }),
      },
    });
  }

  if (observationsWritten > 0) {
    await stampBronzeIngestAt(country.id);
  }

  return {
    observationsWritten,
    fetchesAttempted: batch.results.length,
    fetchesOk,
    country: country.name,
    countryId: country.id,
    lineageFacet,
  };
}
