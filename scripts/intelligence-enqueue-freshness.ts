/**
 * Re-queue countries with stale materialization or agent updates.
 */
import 'dotenv/config';

import prisma from '../lib/prisma';
import { assertProdWritesAllowed } from '../lib/prod-write-guard';
import { enqueueFreshnessRefreshJobs } from '../lib/intelligence-validation/freshness';

async function main() {
  assertProdWritesAllowed('intelligence:enqueue-freshness');
  const limit = Number(process.argv[2]) || 20;
  const n = await enqueueFreshnessRefreshJobs(limit);
  console.log(`[intelligence:enqueue-freshness] created ${n} manifest_fetch jobs`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
