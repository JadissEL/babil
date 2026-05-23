/**
 * Enqueue intelligence jobs for stale / low launch-gate countries.
 * Run: npm run intelligence:enqueue-stale -- --limit 20
 */
import 'dotenv/config';

import prisma from '../lib/prisma';
import { assertProdWritesAllowed } from '../lib/prod-write-guard';
import { listStaleCountryIds } from '../lib/intelligence-priority';
import { enqueueIntelligenceJob } from '../lib/intelligence-pipeline/enqueue-intelligence-job';
import { maxManifestUrlsPerJob } from '../lib/intelligence-pipeline/job-budget';
import { INTELLIGENCE_JOB_KINDS } from '../lib/intelligence-pipeline/job-kinds';

function argNumber(name: string, fallback: number): number {
  const i = process.argv.indexOf(name);
  if (i === -1 || i + 1 >= process.argv.length) return fallback;
  const n = Number(process.argv[i + 1]);
  return Number.isFinite(n) ? n : fallback;
}

async function main() {
  assertProdWritesAllowed('intelligence:enqueue-stale');
  const limit = argNumber('--limit', 15);
  const stale = await listStaleCountryIds(limit);

  let created = 0;
  for (const row of stale) {
    const payload = {
      trigger: 'enqueue_stale',
      countryId: row.countryId,
      manifestBatchSize: maxManifestUrlsPerJob(),
    };
    const out = await enqueueIntelligenceJob({
      kind: INTELLIGENCE_JOB_KINDS.manifest_fetch,
      payload,
      priority: row.priority,
    });
    if (!out.created) {
      if (out.reason === 'budget_exceeded') {
        console.warn(`[intelligence:enqueue-stale] budget stop: ${out.message}`);
        break;
      }
      continue;
    }
    created += 1;
  }

  console.log(`[intelligence:enqueue-stale] enqueued ${created} manifest_fetch jobs`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
