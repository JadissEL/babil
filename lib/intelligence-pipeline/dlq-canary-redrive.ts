/**
 * Canary redrive for transient dead-letter jobs (bounded batch).
 */

import prisma from '@/lib/prisma';
import { DEAD_LETTER_PREFIX } from './job-dead-letter';
import { triageDeadLetterJob } from './dlq-triage';
import { parseJobPayload } from './job-retry';

export async function redriveDeadLetterCanary(args?: {
  limit?: number;
  onlyTransient?: boolean;
}): Promise<{ scanned: number; redriven: number; skippedPoison: number }> {
  const limit = Math.min(10, Math.max(1, args?.limit ?? 3));
  const onlyTransient = args?.onlyTransient !== false;

  const rows = await prisma.intelligencePipelineJob.findMany({
    where: {
      status: 'FAILED',
      errorSummary: { startsWith: DEAD_LETTER_PREFIX },
    },
    orderBy: { finishedAt: 'desc' },
    take: 50,
    select: { id: true, kind: true, payloadJson: true, errorSummary: true, priority: true },
  });

  let redriven = 0;
  let skippedPoison = 0;

  for (const job of rows) {
    if (redriven >= limit) break;
    const triage = triageDeadLetterJob(job.errorSummary);
    if (!triage.canRedrive) {
      if (triage.errorClass === 'poison') skippedPoison += 1;
      continue;
    }
    if (onlyTransient && triage.errorClass === 'permanent') continue;

    let payload;
    try {
      payload = parseJobPayload(job.payloadJson);
    } catch {
      skippedPoison += 1;
      continue;
    }

    await prisma.intelligencePipelineJob.update({
      where: { id: job.id },
      data: {
        status: 'PENDING',
        startedAt: null,
        finishedAt: null,
        errorSummary: null,
        resultJson: null,
        priority: Math.max(job.priority ?? 0, 40),
        payloadJson: JSON.stringify({
          ...payload,
          attempt: 0,
          notBefore: undefined,
          trigger: 'canary_redrive',
        }),
      },
    });
    redriven += 1;
  }

  return { scanned: rows.length, redriven, skippedPoison };
}
