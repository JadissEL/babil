/**
 * Exponential backoff re-queue for failed pipeline jobs (idempotent payload key).
 */

import prisma from '@/lib/prisma';
import type { IntelligenceJobPayload } from './job-kinds';
import { markJobDeadLetter } from './job-dead-letter';
import { shouldRetryFailedJob } from './transient-errors';

const MAX_ATTEMPTS = Math.max(
  1,
  Math.floor(Number(process.env.INTELLIGENCE_JOB_MAX_ATTEMPTS || 3)),
);

export function parseJobPayload(raw: string): IntelligenceJobPayload & { attempt?: number } {
  return JSON.parse(raw) as IntelligenceJobPayload & { attempt?: number };
}

export function backoffPriority(attempt: number): number {
  return Math.max(-50, 40 - attempt * 15);
}

/** Re-enqueue failed job if attempts remain; returns true if requeued. */
export async function maybeRequeueFailedJob(job: {
  id: string;
  kind: string;
  payloadJson: string;
  errorSummary: string | null;
}): Promise<boolean> {
  let payload: IntelligenceJobPayload & { attempt?: number };
  try {
    payload = parseJobPayload(job.payloadJson);
  } catch {
    return false;
  }

  if (!shouldRetryFailedJob(job.errorSummary)) {
    await markJobDeadLetter(job);
    return false;
  }

  const attempt = (payload.attempt ?? 0) + 1;
  if (attempt >= MAX_ATTEMPTS) {
    await markJobDeadLetter(job);
    return false;
  }

  const baseDelayMs = Math.min(86_400_000, 60_000 * 2 ** attempt);
  const jitterMs = Math.floor(Math.random() * 0.25 * baseDelayMs);
  const delayMs = baseDelayMs + jitterMs;
  const notBefore = Date.now() + delayMs;

  await prisma.intelligencePipelineJob.update({
    where: { id: job.id },
    data: {
      status: 'PENDING',
      startedAt: null,
      finishedAt: null,
      priority: backoffPriority(attempt),
      errorSummary:
        `retry_scheduled:attempt=${attempt};after=${new Date(notBefore).toISOString()};prev=${job.errorSummary ?? ''}`.slice(
          0,
          500,
        ),
      payloadJson: JSON.stringify({
        ...payload,
        attempt,
        notBefore: new Date(notBefore).toISOString(),
        trigger: payload.trigger ?? 'retry',
      }),
    },
  });

  return true;
}
