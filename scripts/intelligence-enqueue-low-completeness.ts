/**
 * Enqueue manifest_fetch for lowest intelligence completeness scores.
 * npm run intelligence:enqueue-low-completeness -- --limit 15
 */
import 'dotenv/config';
import prisma from '../lib/prisma';
import { assertProdWritesAllowed } from '../lib/prod-write-guard';
import { listCountryCompletenessScores } from '../lib/intelligence-pipeline/country-completeness';
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
  assertProdWritesAllowed('intelligence:enqueue-low-completeness');
  const limit = argNumber('--limit', 15);
  const lowest = await listCountryCompletenessScores({ limit: limit * 2 });
  lowest.sort((a, b) => a.score - b.score);
  const targets = lowest.slice(0, limit);

  let created = 0;
  for (const row of targets) {
    const payload = {
      trigger: 'enqueue_low_completeness',
      countryId: row.countryId,
      manifestBatchSize: maxManifestUrlsPerJob(),
    };
    const priority = Math.max(35, 100 - row.score);
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

  console.log(
    `[intelligence:enqueue-low-completeness] enqueued ${created} jobs for scores ${targets.map((t) => t.score).join(',')}`,
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
