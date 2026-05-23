/**
 * Shared queue drain for IntelligencePipelineJob (used by worker-once, worker-loop, agents runner).
 */

import prisma from '@/lib/prisma';
import { runEnrichmentPipeline } from './run-enrichment-stub';
import {
  materializeApprovedObservations,
  runIntelligenceValidation,
} from '@/lib/intelligence-validation';
import { validateAndMaybeMaterializeCountry } from './post-fetch-pipeline';
import { INTELLIGENCE_JOB_KINDS, type IntelligenceJobPayload } from './job-kinds';
import { runLlmContradictionPassIfBudgeted } from '@/lib/intelligence-validation/contradiction-llm';
import { runManifestFetchJobForCountry } from './manifest-fetch-runner';
import { maybeRequeueFailedJob, parseJobPayload } from './job-retry';
import { recoverStaleIntelligencePipelineJobs } from './stale-job-recovery';
import { runSpecializedManifestJob, runWorldBankMaterializeJob } from './specialized-job-handlers';
import { checkPromotionLaunchGateSample } from '@/lib/intelligence-validation/promotion-safety';
import { logIntelligence } from './intelligence-log';
import { triageDeadLetterJob } from './dlq-triage';

export type IntelligenceJobPayloadLegacy = IntelligenceJobPayload;

async function claimNextPendingJob() {
  await recoverStaleIntelligencePipelineJobs();
  return prisma.$transaction(async (tx) => {
    const job = await tx.intelligencePipelineJob.findFirst({
      where: { status: 'PENDING' },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });
    if (!job) return null;
    await tx.intelligencePipelineJob.update({
      where: { id: job.id },
      data: { status: 'RUNNING', startedAt: new Date() },
    });
    return job;
  });
}

async function processJob(
  job: { id: string; kind: string; payloadJson: string },
  payload: IntelligenceJobPayload,
): Promise<{ status: 'SUCCEEDED' | 'FAILED'; result: unknown; errorSummary?: string }> {
  if (job.kind === INTELLIGENCE_JOB_KINDS.validate_and_materialize) {
    const report = await materializeApprovedObservations({
      countryIds: payload.countryIds,
      limit: payload.worldBankLimit,
    });
    const safety = await checkPromotionLaunchGateSample({ sampleSize: 15 });
    if (!safety.pass) {
      return {
        status: 'FAILED',
        result: { report, promotionSafety: safety },
        errorSummary: `launch_gate_sample_failed:${safety.failed.length}`,
      };
    }
    return { status: 'SUCCEEDED', result: { report, promotionSafety: safety } };
  }

  if (job.kind === INTELLIGENCE_JOB_KINDS.world_bank_materialize) {
    const run = await prisma.enrichmentRun.create({
      data: { status: 'RUNNING', trigger: payload.trigger ?? 'job:world_bank_materialize' },
    });
    const out = await runWorldBankMaterializeJob(payload, run.id);
    await prisma.enrichmentRun.update({
      where: { id: run.id },
      data: {
        status: out.status,
        finishedAt: new Date(),
        errorSummary: out.errorSummary ?? null,
        statsJson: out.result != null ? JSON.stringify(out.result) : null,
      },
    });
    return out;
  }

  if (job.kind === INTELLIGENCE_JOB_KINDS.manifest_fetch && payload.countryId != null) {
    const run = await prisma.enrichmentRun.create({
      data: { status: 'RUNNING', trigger: payload.trigger ?? 'job:manifest_fetch' },
    });
    try {
      const mf = await runManifestFetchJobForCountry({
        countryId: payload.countryId,
        manifestBatchSize: payload.manifestBatchSize,
        runId: run.id,
      });
      const { validated, materialized } = await validateAndMaybeMaterializeCountry(
        payload.countryId,
      );
      await prisma.enrichmentRun.update({
        where: { id: run.id },
        data: {
          status: 'SUCCEEDED',
          finishedAt: new Date(),
          statsJson: JSON.stringify({ ...mf, validated, materialized }),
        },
      });
      return { status: 'SUCCEEDED', result: { ...mf, validated, materialized } };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await prisma.enrichmentRun.update({
        where: { id: run.id },
        data: { status: 'FAILED', finishedAt: new Date(), errorSummary: msg },
      });
      return { status: 'FAILED', result: null, errorSummary: msg };
    }
  }

  if (job.kind === INTELLIGENCE_JOB_KINDS.extract_manifest_batch) {
    const budget =
      payload.llmTokenBudget ?? Number(process.env.AGENT_LLM_TOKEN_BUDGET_PER_TASK || 0);
    const llm = await runLlmContradictionPassIfBudgeted({
      tokenBudget: budget,
      countryIds: payload.countryIds,
    });
    return { status: 'SUCCEEDED', result: { budget, ...llm } };
  }

  if (
    job.kind === INTELLIGENCE_JOB_KINDS.visa_friction ||
    job.kind === INTELLIGENCE_JOB_KINDS.education ||
    job.kind === INTELLIGENCE_JOB_KINDS.travel_signals ||
    job.kind === INTELLIGENCE_JOB_KINDS.news_trends
  ) {
    return runSpecializedManifestJob(job.kind, payload);
  }

  const result = await runEnrichmentPipeline({
    trigger: payload.trigger ?? `job:${job.kind}`,
    worldBank: payload.worldBank,
    materializeEconomy: payload.materializeEconomy,
    worldBankLimit: payload.worldBankLimit,
    stubMultilateralCollectors: payload.stubMultilateralCollectors,
  });

  if (job.kind === INTELLIGENCE_JOB_KINDS.validate_and_materialize || payload.materializeEconomy) {
    await runIntelligenceValidation({ countryIds: payload.countryIds });
  }

  return {
    status: result.status === 'FAILED' ? 'FAILED' : 'SUCCEEDED',
    result,
    errorSummary: result.errorSummary,
  };
}

export async function drainOneIntelligencePipelineJob(): Promise<boolean> {
  const job = await claimNextPendingJob();
  if (!job) return false;

  let payload: IntelligenceJobPayload;
  try {
    payload = parseJobPayload(job.payloadJson);
    if (payload.notBefore && Date.parse(payload.notBefore) > Date.now()) {
      await prisma.intelligencePipelineJob.update({
        where: { id: job.id },
        data: { status: 'PENDING', startedAt: null },
      });
      return true;
    }
  } catch {
    await prisma.intelligencePipelineJob.update({
      where: { id: job.id },
      data: {
        status: 'FAILED',
        finishedAt: new Date(),
        errorSummary: 'Invalid payloadJson',
      },
    });
    return true;
  }

  const startedMs = job.startedAt?.getTime() ?? Date.now();
  try {
    const out = await processJob(job, payload);
    const durationMs = Date.now() - startedMs;
    const updated = await prisma.intelligencePipelineJob.update({
      where: { id: job.id },
      data: {
        status: out.status,
        finishedAt: new Date(),
        errorSummary: out.errorSummary ?? null,
        resultJson: JSON.stringify(out.result),
      },
    });
    if (out.status === 'SUCCEEDED') {
      logIntelligence('info', 'pipeline_job_succeeded', {
        jobId: job.id,
        kind: job.kind,
        durationMs,
      });
    }
    if (out.status === 'FAILED') {
      logIntelligence('warn', 'pipeline_job_failed', {
        jobId: job.id,
        kind: job.kind,
        durationMs,
        errorSummary: out.errorSummary ?? null,
      });
      const requeued = await maybeRequeueFailedJob(updated);
      if (!requeued && updated.errorSummary?.startsWith('dead_letter:')) {
        const triage = triageDeadLetterJob(updated.errorSummary);
        logIntelligence('error', 'pipeline_job_dead_letter', {
          jobId: job.id,
          kind: job.kind,
          errorClass: triage.errorClass,
          canRedrive: triage.canRedrive,
        });
      }
      return requeued;
    }
    return true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const failedJob = await prisma.intelligencePipelineJob.update({
      where: { id: job.id },
      data: {
        status: 'FAILED',
        finishedAt: new Date(),
        errorSummary: msg,
      },
    });
    const requeued = await maybeRequeueFailedJob(failedJob);
    return requeued;
  }
}

export async function drainIntelligencePipelineJobs(args?: {
  maxJobs?: number;
  sleepMs?: number;
}): Promise<{ processed: number; failed: number; recoveredStale?: number }> {
  const recoveredStale = await recoverStaleIntelligencePipelineJobs();
  const maxJobs = args?.maxJobs ?? 3;
  const sleepMs = args?.sleepMs ?? 0;
  let processed = 0;
  let failed = 0;

  for (let i = 0; i < maxJobs; i++) {
    const pendingBefore = await prisma.intelligencePipelineJob.count({
      where: { status: 'PENDING' },
    });
    if (pendingBefore === 0) break;

    const ok = await drainOneIntelligencePipelineJob();
    processed += 1;
    if (!ok) failed += 1;

    if (sleepMs > 0 && i < maxJobs - 1) {
      await new Promise((r) => setTimeout(r, sleepMs));
    }
  }

  return { processed, failed, recoveredStale };
}
