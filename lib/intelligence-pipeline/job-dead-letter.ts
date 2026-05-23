/**
 * Dead-letter semantics when retry budget is exhausted (no schema migration — prefix in errorSummary).
 */

import prisma from '@/lib/prisma';
import { parseJobPayload } from './job-retry';

const MAX_ATTEMPTS = Math.max(
  1,
  Math.floor(Number(process.env.INTELLIGENCE_JOB_MAX_ATTEMPTS || 3)),
);

export const DEAD_LETTER_PREFIX = 'dead_letter:';

export function isDeadLetterJob(errorSummary: string | null | undefined): boolean {
  return typeof errorSummary === 'string' && errorSummary.startsWith(DEAD_LETTER_PREFIX);
}

/** Mark job as terminal dead-letter after retries exhausted. */
export async function markJobDeadLetter(job: {
  id: string;
  kind: string;
  payloadJson: string;
  errorSummary: string | null;
}): Promise<void> {
  let attempt = MAX_ATTEMPTS;
  try {
    const payload = parseJobPayload(job.payloadJson);
    attempt = payload.attempt ?? MAX_ATTEMPTS;
  } catch {
    /* keep default */
  }

  await prisma.intelligencePipelineJob.update({
    where: { id: job.id },
    data: {
      status: 'FAILED',
      finishedAt: new Date(),
      errorSummary:
        `${DEAD_LETTER_PREFIX}attempts=${attempt};kind=${job.kind};prev=${(job.errorSummary ?? '').slice(0, 200)}`.slice(
          0,
          500,
        ),
    },
  });
}

export async function countDeadLetterJobsLast24h(): Promise<number> {
  const since = new Date(Date.now() - 86_400_000);
  return prisma.intelligencePipelineJob.count({
    where: {
      status: 'FAILED',
      finishedAt: { gte: since },
      errorSummary: { startsWith: DEAD_LETTER_PREFIX },
    },
  });
}
