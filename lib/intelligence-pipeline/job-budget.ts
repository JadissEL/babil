/**
 * Budget caps for intelligence jobs (guardrail from plan).
 */

import prisma from '@/lib/prisma';

const MAX_JOBS_PER_DAY = Math.max(
  1,
  Math.floor(Number(process.env.INTELLIGENCE_MAX_JOBS_PER_DAY || 200)),
);

const MAX_MANIFEST_FETCHES_PER_DAY = Math.max(
  0,
  Math.floor(Number(process.env.INTELLIGENCE_MAX_MANIFEST_FETCH_JOBS_PER_DAY || 80)),
);

function startOfUtcDay(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function assertJobBudgetAllows(kind: string): Promise<void> {
  const since = startOfUtcDay();
  const total = await prisma.intelligencePipelineJob.count({
    where: { createdAt: { gte: since } },
  });
  if (total >= MAX_JOBS_PER_DAY) {
    throw new Error(
      `Intelligence job daily cap reached (${MAX_JOBS_PER_DAY}). Set INTELLIGENCE_MAX_JOBS_PER_DAY to raise.`,
    );
  }
  if (kind === 'manifest_fetch') {
    const manifest = await prisma.intelligencePipelineJob.count({
      where: { kind: 'manifest_fetch', createdAt: { gte: since } },
    });
    if (manifest >= MAX_MANIFEST_FETCHES_PER_DAY) {
      throw new Error(`Manifest fetch daily cap reached (${MAX_MANIFEST_FETCHES_PER_DAY}).`);
    }
  }
}

export function maxManifestUrlsPerJob(): number {
  return Math.max(1, Math.floor(Number(process.env.INTELLIGENCE_MAX_MANIFEST_URLS_PER_JOB || 15)));
}

export type JobBudgetSnapshot = {
  maxJobsPerDay: number;
  maxManifestFetchPerDay: number;
  jobsCreatedToday: number;
  manifestFetchCreatedToday: number;
  jobBudgetUtilization: number;
  manifestBudgetUtilization: number;
  remainingJobsToday: number;
  remainingManifestFetchToday: number;
};

export function getJobBudgetSnapshot(counts: {
  jobsCreatedToday: number;
  manifestFetchCreatedToday: number;
}): JobBudgetSnapshot {
  const jobBudgetUtilization =
    Math.round((counts.jobsCreatedToday / MAX_JOBS_PER_DAY) * 1000) / 1000;
  const manifestBudgetUtilization =
    MAX_MANIFEST_FETCHES_PER_DAY > 0
      ? Math.round((counts.manifestFetchCreatedToday / MAX_MANIFEST_FETCHES_PER_DAY) * 1000) / 1000
      : 0;
  return {
    maxJobsPerDay: MAX_JOBS_PER_DAY,
    maxManifestFetchPerDay: MAX_MANIFEST_FETCHES_PER_DAY,
    jobsCreatedToday: counts.jobsCreatedToday,
    manifestFetchCreatedToday: counts.manifestFetchCreatedToday,
    jobBudgetUtilization,
    manifestBudgetUtilization,
    remainingJobsToday: Math.max(0, MAX_JOBS_PER_DAY - counts.jobsCreatedToday),
    remainingManifestFetchToday: Math.max(
      0,
      MAX_MANIFEST_FETCHES_PER_DAY - counts.manifestFetchCreatedToday,
    ),
  };
}
