/**
 * Validate observations (consensus, contradictions) and promote approved fields to Country.
 */

import type { ObservationVerificationStatus } from '@prisma/client';
import { stampSilverValidatedAt } from '@/lib/intelligence-pipeline/medallion-timestamps';
import prisma from '@/lib/prisma';
import { materializeEconomyObservationsForCountry } from '@/lib/intelligence-pipeline/materialize-economy-observations';
import { MATERIALIZE_TARGETS } from '@/lib/intelligence-pipeline/taxonomy-v1';
import { buildFieldConsensus, canPromoteField, type RawObservationRow } from './consensus';
import { runFieldExpectations } from './expectations-suite';
import { loadSourceReliabilityScores } from './source-reliability';
import { syncDisputedFieldPathsToCountry } from './sync-country-disputes';
import type { FieldConsensus } from './types';

export type ValidationReport = {
  countriesProcessed: number;
  fieldsValidated: number;
  disputed: number;
  promotable: number;
  materialized: number;
  byCountry: Record<number, { disputedPaths: string[]; promotedPaths: string[] }>;
};

async function loadObservationRows(countryId: number): Promise<RawObservationRow[]> {
  const paths = Object.keys(MATERIALIZE_TARGETS);
  const obs = await prisma.countryObservation.findMany({
    where: { countryId, fieldPath: { in: paths } },
    include: { source: { select: { tier: true, slug: true } } },
    orderBy: { observedAt: 'desc' },
  });
  return obs.map((o) => ({
    id: o.id,
    countryId: o.countryId,
    fieldPath: o.fieldPath,
    valueJson: o.valueJson,
    valueNumeric: o.valueNumeric,
    confidence: o.confidence,
    observedAt: o.observedAt,
    tier: o.source.tier,
    sourceSlug: o.source.slug,
    verificationStatus: o.verificationStatus,
  }));
}

async function reliabilityMap() {
  return loadSourceReliabilityScores();
}

export async function validateAndTagObservationsForCountry(
  countryId: number,
): Promise<{ consensus: FieldConsensus[]; disputedPaths: string[] }> {
  const rows = await loadObservationRows(countryId);
  const relScores = await reliabilityMap();
  const byPath = new Map<string, RawObservationRow[]>();
  for (const r of rows) {
    const list = byPath.get(r.fieldPath) ?? [];
    list.push(r);
    byPath.set(r.fieldPath, list);
  }

  const consensusList: FieldConsensus[] = [];
  const disputedPaths: string[] = [];

  for (const [fieldPath, group] of Array.from(byPath.entries())) {
    const consensus = buildFieldConsensus(countryId, fieldPath, group, {
      sourceReliabilityBySlug: relScores,
    });

    const winnerRow = group.find((g) => g.valueJson === consensus.winningValueJson) ?? group[0];
    const expectationViolations = runFieldExpectations({
      fieldPath,
      valueJson: consensus.winningValueJson,
      valueNumeric: winnerRow?.valueNumeric ?? null,
    });
    if (expectationViolations.length > 0 && !consensus.disputed) {
      consensus.verificationStatus = 'pending';
      consensus.confidence = Math.min(consensus.confidence, 0.45);
    }

    consensusList.push(consensus);
    if (consensus.disputed) disputedPaths.push(fieldPath);

    const status: ObservationVerificationStatus = consensus.verificationStatus;
    await prisma.countryObservation.updateMany({
      where: { id: { in: group.map((g) => g.id) } },
      data: {
        verificationStatus: status,
        sourcesConfirmed: consensus.sourcesConfirmed,
      },
    });
  }

  await syncDisputedFieldPathsToCountry(countryId, disputedPaths);
  await stampSilverValidatedAt(countryId);

  return { consensus: consensusList, disputedPaths };
}

export async function runIntelligenceValidation(args?: {
  countryIds?: number[];
  limit?: number;
}): Promise<ValidationReport> {
  const limit = args?.limit ?? 250;
  const countryIds =
    args?.countryIds ??
    (
      await prisma.country.findMany({
        select: { id: true },
        take: limit,
        orderBy: { id: 'asc' },
      })
    ).map((c) => c.id);

  const report: ValidationReport = {
    countriesProcessed: 0,
    fieldsValidated: 0,
    disputed: 0,
    promotable: 0,
    materialized: 0,
    byCountry: {},
  };

  for (const countryId of countryIds) {
    const { consensus, disputedPaths } = await validateAndTagObservationsForCountry(countryId);
    const promotedPaths = consensus.filter(canPromoteField).map((c) => c.fieldPath);
    report.countriesProcessed += 1;
    report.fieldsValidated += consensus.length;
    report.disputed += disputedPaths.length;
    report.promotable += promotedPaths.length;
    report.byCountry[countryId] = { disputedPaths, promotedPaths };
  }

  return report;
}

export async function materializeApprovedObservations(args?: {
  countryIds?: number[];
  limit?: number;
}): Promise<{ materialized: number; report: ValidationReport }> {
  const report = await runIntelligenceValidation(args);
  const ids = args?.countryIds ?? Object.keys(report.byCountry).map(Number);

  let materialized = 0;
  for (const countryId of ids) {
    const entry = report.byCountry[countryId];
    if (!entry || entry.promotedPaths.length === 0) continue;
    const ok = await materializeEconomyObservationsForCountry(countryId, {
      onlyPromotable: true,
    });
    if (ok) materialized += 1;
  }
  report.materialized = materialized;
  return { materialized, report };
}

export { buildFieldConsensus, canPromoteField } from './consensus';
export {
  canShowClaimOnPublicUI,
  normalizeVerificationStatus,
  publicDisclaimerForStatus,
} from './verification-status';
export { runVerificationPipeline, VERIFICATION_PIPELINE_STEPS } from './verification-pipeline';
export type { FieldConsensus } from './types';
export { materializeEconomyObservationsForCountry } from '@/lib/intelligence-pipeline/materialize-economy-observations';
export { runFieldExpectations, expectationsPass } from './expectations-suite';
