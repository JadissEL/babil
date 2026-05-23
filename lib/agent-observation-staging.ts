/**
 * Stage agent-sourced numeric facts as CountryObservation before Country promotion.
 */

import { resolveSourceSlugForManifestLabel } from '@/lib/intelligence-manifest-source-bridge';
import { upsertCountryObservation } from '@/lib/intelligence-pipeline/observation-writer';
import {
  FIELD_ECONOMY_GDP_USD_CURRENT,
  FIELD_GENERAL_POPULATION_TOTAL,
} from '@/lib/intelligence-pipeline/taxonomy-v1';
import prisma from '@/lib/prisma';

async function sourceIdForSlug(slug: string): Promise<string | null> {
  const row = await prisma.intelligenceSource.findUnique({ where: { slug }, select: { id: true } });
  return row?.id ?? null;
}

export async function stageAgentEconomyFromFullData(args: {
  countryId: number;
  fullData: Record<string, unknown>;
  sourceLabel?: string;
}): Promise<number> {
  const economy = args.fullData.economy as Record<string, unknown> | undefined;
  if (!economy || typeof economy !== 'object') return 0;

  const slug = resolveSourceSlugForManifestLabel(args.sourceLabel ?? 'World Bank');
  const sourceId = await sourceIdForSlug(slug);
  if (!sourceId) return 0;

  let written = 0;
  const gdp = economy.gdp_usd;
  if (typeof gdp === 'number' && Number.isFinite(gdp)) {
    await upsertCountryObservation({
      countryId: args.countryId,
      fieldPath: FIELD_ECONOMY_GDP_USD_CURRENT,
      valueJson: JSON.stringify({ value: gdp, unit: 'USD', source: 'agent_enrichment' }),
      valueNumeric: gdp,
      unit: 'USD',
      confidence: 0.72,
      sourceId,
      dedupeKey: `agent:${args.countryId}:${FIELD_ECONOMY_GDP_USD_CURRENT}`,
      verificationStatus: 'estimated',
    });
    written += 1;
  }

  const pop = economy.population_wb;
  if (typeof pop === 'number' && Number.isFinite(pop)) {
    await upsertCountryObservation({
      countryId: args.countryId,
      fieldPath: FIELD_GENERAL_POPULATION_TOTAL,
      valueJson: JSON.stringify({ value: pop, source: 'agent_enrichment' }),
      valueNumeric: pop,
      confidence: 0.7,
      sourceId,
      dedupeKey: `agent:${args.countryId}:${FIELD_GENERAL_POPULATION_TOTAL}`,
      verificationStatus: 'estimated',
    });
    written += 1;
  }

  return written;
}
