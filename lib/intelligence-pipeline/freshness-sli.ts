/**
 * Data SLA SLIs: freshness + completeness for intelligence materialization.
 * @see https://cloud.google.com/stackdriver/docs/solutions/slo-monitoring/sli-metrics/data-proc-metrics
 */

import { parseCountryFullData } from '@/lib/country-full-data-json';
import prisma from '@/lib/prisma';
import { MATERIALIZE_TARGETS } from './taxonomy-v1';

const STALE_MATERIALIZE_DAYS = Math.max(
  7,
  Math.floor(Number(process.env.INTELLIGENCE_STALE_MATERIALIZE_DAYS || 30)),
);

export type IntelligenceFreshnessSli = {
  staleMaterializeDays: number;
  countriesSampled: number;
  materializedFreshCount: number;
  materializedStaleCount: number;
  materializedFreshRatio: number;
  oldestMaterializedAgeDays: number | null;
  observationFreshness: {
    pathsChecked: number;
    countriesWithRecentObs: number;
    oldestObservationAgeHours: number | null;
  };
};

export async function collectIntelligenceFreshnessSli(args?: {
  countryLimit?: number;
}): Promise<IntelligenceFreshnessSli> {
  const limit = args?.countryLimit ?? 200;
  const cutoff = Date.now() - STALE_MATERIALIZE_DAYS * 86_400_000;
  const paths = Object.keys(MATERIALIZE_TARGETS);

  const countries = await prisma.country.findMany({
    select: { id: true, full_data: true },
    take: limit,
    orderBy: { id: 'asc' },
  });

  let materializedFreshCount = 0;
  let materializedStaleCount = 0;
  let oldestMaterializedMs: number | null = null;

  for (const c of countries) {
    const full = parseCountryFullData(c.full_data);
    const intel = full._intelligence as Record<string, unknown> | undefined;
    const at =
      typeof intel?.economy_materialized_at === 'string'
        ? Date.parse(intel.economy_materialized_at)
        : NaN;
    if (!Number.isFinite(at)) {
      materializedStaleCount += 1;
      continue;
    }
    if (at >= cutoff) materializedFreshCount += 1;
    else materializedStaleCount += 1;
    if (oldestMaterializedMs == null || at < oldestMaterializedMs) oldestMaterializedMs = at;
  }

  const since7d = new Date(Date.now() - 7 * 86_400_000);
  const recentObsCountries = await prisma.countryObservation.groupBy({
    by: ['countryId'],
    where: { fieldPath: { in: paths }, observedAt: { gte: since7d } },
  });

  const oldestObs = await prisma.countryObservation.findFirst({
    where: { fieldPath: { in: paths } },
    orderBy: { observedAt: 'asc' },
    select: { observedAt: true },
  });

  const oldestObservationAgeHours = oldestObs
    ? Math.round((Date.now() - oldestObs.observedAt.getTime()) / 3_600_000)
    : null;

  const denom = materializedFreshCount + materializedStaleCount;
  const materializedFreshRatio = denom > 0 ? materializedFreshCount / denom : 1;

  return {
    staleMaterializeDays: STALE_MATERIALIZE_DAYS,
    countriesSampled: countries.length,
    materializedFreshCount,
    materializedStaleCount,
    materializedFreshRatio: Math.round(materializedFreshRatio * 1000) / 1000,
    oldestMaterializedAgeDays:
      oldestMaterializedMs != null
        ? Math.round((Date.now() - oldestMaterializedMs) / 86_400_000)
        : null,
    observationFreshness: {
      pathsChecked: paths.length,
      countriesWithRecentObs: recentObsCountries.length,
      oldestObservationAgeHours,
    },
  };
}

export function evaluateFreshnessAlertLevel(
  sli: IntelligenceFreshnessSli,
): 'ok' | 'warning' | 'critical' {
  if (sli.materializedFreshRatio < 0.5 && sli.countriesSampled >= 20) return 'critical';
  if (sli.materializedFreshRatio < 0.7) return 'warning';
  if (
    sli.observationFreshness.oldestObservationAgeHours != null &&
    sli.observationFreshness.oldestObservationAgeHours > 24 * 90
  ) {
    return 'warning';
  }
  return 'ok';
}
