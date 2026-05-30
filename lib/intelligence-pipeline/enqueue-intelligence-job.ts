/**
 * Central enqueue gate: budget caps + pending dedupe + structured log.
 */

import prisma from '@/lib/prisma';
import { logIntelligence } from './intelligence-log';
import { hasPendingJobDuplicate } from './enqueue-guard';
import { assertDiscoveryGateForJob } from './discovery-gate';
import { assertJobBudgetAllows } from './job-budget';
import type { IntelligenceJobPayload } from './job-kinds';

export type EnqueueIntelligenceJobResult =
  | { created: true; jobId: string }
  | { created: false; reason: 'duplicate_pending' }
  | { created: false; reason: 'budget_exceeded'; message: string }
  | { created: false; reason: 'discovery_incomplete' | 'discovery_failed'; status: string };

export async function enqueueIntelligenceJob(args: {
  kind: string;
  payload: IntelligenceJobPayload;
  priority?: number;
}): Promise<EnqueueIntelligenceJobResult> {
  const priority = Number.isFinite(args.priority) ? Math.floor(args.priority!) : 0;

  if (await hasPendingJobDuplicate(args.kind, args.payload)) {
    logIntelligence('info', 'enqueue_skipped_duplicate', { kind: args.kind });
    return { created: false, reason: 'duplicate_pending' };
  }

  const gate = await assertDiscoveryGateForJob({
    kind: args.kind,
    sourceId: args.payload.sourceId,
    sourceSlug: args.payload.sourceSlug,
  });
  if (!gate.allowed) {
    logIntelligence('warn', 'enqueue_discovery_blocked', {
      kind: args.kind,
      reason: gate.reason,
      status: gate.status,
    });
    return { created: false, reason: gate.reason, status: gate.status };
  }

  try {
    await assertJobBudgetAllows(args.kind);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    logIntelligence('warn', 'enqueue_budget_blocked', { kind: args.kind, message });
    return { created: false, reason: 'budget_exceeded', message };
  }

  const job = await prisma.intelligencePipelineJob.create({
    data: {
      kind: args.kind,
      priority,
      payloadJson: JSON.stringify(args.payload),
    },
  });

  logIntelligence('info', 'enqueue_created', {
    jobId: job.id,
    kind: args.kind,
    priority,
    countryId: args.payload.countryId ?? null,
  });

  return { created: true, jobId: job.id };
}
