/**
 * Recover pipeline jobs stuck in RUNNING (worker crash / deploy mid-job).
 */

import prisma from '@/lib/prisma';

const STALE_RUNNING_MS = Math.max(
  60_000,
  Math.floor(Number(process.env.INTELLIGENCE_STALE_RUNNING_MS || 45 * 60_000)),
);

export async function recoverStaleIntelligencePipelineJobs(): Promise<number> {
  const cutoff = new Date(Date.now() - STALE_RUNNING_MS);
  const stale = await prisma.intelligencePipelineJob.findMany({
    where: {
      status: 'RUNNING',
      startedAt: { lt: cutoff },
    },
    select: { id: true },
    take: 50,
  });
  if (stale.length === 0) return 0;

  await prisma.intelligencePipelineJob.updateMany({
    where: { id: { in: stale.map((s) => s.id) } },
    data: {
      status: 'PENDING',
      startedAt: null,
      errorSummary: 'recovered_from_stale_running',
    },
  });
  return stale.length;
}
