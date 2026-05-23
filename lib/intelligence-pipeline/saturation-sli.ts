/**
 * Saturation SLI: daily job budget utilization (golden signal).
 */

import prisma from '@/lib/prisma';
import { getJobBudgetSnapshot } from './job-budget';

function startOfUtcDay(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export type IntelligenceSaturationSli = {
  maxJobsPerDay: number;
  maxManifestFetchPerDay: number;
  jobsCreatedToday: number;
  manifestFetchCreatedToday: number;
  jobBudgetUtilization: number;
  manifestBudgetUtilization: number;
};

export async function collectIntelligenceSaturationSli(): Promise<IntelligenceSaturationSli> {
  const since = startOfUtcDay();
  const [jobsCreatedToday, manifestFetchCreatedToday] = await Promise.all([
    prisma.intelligencePipelineJob.count({ where: { createdAt: { gte: since } } }),
    prisma.intelligencePipelineJob.count({
      where: { kind: 'manifest_fetch', createdAt: { gte: since } },
    }),
  ]);

  const snap = getJobBudgetSnapshot({
    jobsCreatedToday,
    manifestFetchCreatedToday,
  });
  return {
    maxJobsPerDay: snap.maxJobsPerDay,
    maxManifestFetchPerDay: snap.maxManifestFetchPerDay,
    jobsCreatedToday: snap.jobsCreatedToday,
    manifestFetchCreatedToday: snap.manifestFetchCreatedToday,
    jobBudgetUtilization: snap.jobBudgetUtilization,
    manifestBudgetUtilization: snap.manifestBudgetUtilization,
  };
}

export function evaluateSaturationAlertLevel(
  sli: IntelligenceSaturationSli,
): 'ok' | 'warning' | 'critical' {
  if (sli.jobBudgetUtilization >= 0.95) return 'critical';
  if (sli.manifestBudgetUtilization >= 0.95) return 'critical';
  if (sli.jobBudgetUtilization >= 0.8 || sli.manifestBudgetUtilization >= 0.85) return 'warning';
  return 'ok';
}
