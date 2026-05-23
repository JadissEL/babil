/**
 * Freshness: re-queue countries whose materialized economy is stale.
 */

import prisma from '@/lib/prisma';
import { parseCountryFullData } from '@/lib/country-full-data-json';
import { listStaleCountryIds } from '@/lib/intelligence-priority';
import { INTELLIGENCE_JOB_KINDS } from '@/lib/intelligence-pipeline/job-kinds';
import { enqueueIntelligenceJob } from '@/lib/intelligence-pipeline/enqueue-intelligence-job';
import { maxManifestUrlsPerJob } from '@/lib/intelligence-pipeline/job-budget';

const STALE_MATERIALIZE_DAYS = Math.max(
  7,
  Math.floor(Number(process.env.INTELLIGENCE_STALE_MATERIALIZE_DAYS || 30)),
);

export async function listCountriesWithStaleMaterialization(limit: number): Promise<number[]> {
  const cutoff = Date.now() - STALE_MATERIALIZE_DAYS * 86_400_000;
  const rows = await prisma.country.findMany({
    select: { id: true, full_data: true },
    take: Math.min(500, limit * 4),
  });
  const stale: number[] = [];
  for (const r of rows) {
    const full = parseCountryFullData(r.full_data);
    const intel = full._intelligence as Record<string, unknown> | undefined;
    const at =
      typeof intel?.economy_materialized_at === 'string'
        ? Date.parse(intel.economy_materialized_at)
        : NaN;
    if (!Number.isFinite(at) || at < cutoff) stale.push(r.id);
    if (stale.length >= limit) break;
  }
  return stale;
}

export async function enqueueFreshnessRefreshJobs(limit = 20): Promise<number> {
  const staleMat = await listCountriesWithStaleMaterialization(limit);
  const staleAgent = await listStaleCountryIds(limit);
  const ids = Array.from(new Set([...staleMat, ...staleAgent.map((s) => s.countryId)])).slice(
    0,
    limit,
  );

  let created = 0;
  for (const countryId of ids) {
    const payload = {
      trigger: 'freshness_requeue',
      countryId,
      manifestBatchSize: maxManifestUrlsPerJob(),
    };
    const priority = staleAgent.find((s) => s.countryId === countryId)?.priority ?? 30;
    const out = await enqueueIntelligenceJob({
      kind: INTELLIGENCE_JOB_KINDS.manifest_fetch,
      payload,
      priority,
    });
    if (!out.created) {
      if (out.reason === 'budget_exceeded') break;
      continue;
    }
    created += 1;
  }
  return created;
}
