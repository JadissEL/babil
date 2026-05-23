/**
 * C.45 — Traite **un** job PENDING de `IntelligencePipelineJob` (worker long-running).
 * Exécuter en boucle côté Render/cron ou `while npm run intelligence:worker-once; do sleep 60; done` en dev.
 *
 * @example
 * npx tsx scripts/intelligence-pipeline-worker-once.ts
 */
import 'dotenv/config';

import prisma from '../lib/prisma';
import { drainOneIntelligencePipelineJob } from '../lib/intelligence-pipeline/worker-drain';

export type { IntelligenceJobPayload } from '../lib/intelligence-pipeline/job-kinds';

async function main() {
  const ok = await drainOneIntelligencePipelineJob();
  if (!ok) {
    const pending = await prisma.intelligencePipelineJob.count({ where: { status: 'PENDING' } });
    if (pending === 0) {
      console.log('[intelligence-pipeline-worker-once] no pending job');
      await prisma.$disconnect();
      return;
    }
    await prisma.$disconnect();
    process.exit(1);
    return;
  }
  console.log('[intelligence-pipeline-worker-once] done');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
