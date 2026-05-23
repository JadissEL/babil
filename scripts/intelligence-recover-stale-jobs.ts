import 'dotenv/config';

import { recoverStaleIntelligencePipelineJobs } from '../lib/intelligence-pipeline/stale-job-recovery';
import prisma from '../lib/prisma';

async function main() {
  const n = await recoverStaleIntelligencePipelineJobs();
  console.log(`[intelligence:recover-stale-jobs] recovered ${n} jobs`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
