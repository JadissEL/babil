/**
 * Queue observability metrics (Pipeline Framework / SLO-style signals).
 */

import prisma from '@/lib/prisma';
import { countDeadLetterJobsLast24h } from './job-dead-letter';

const STALE_PENDING_MS = Math.max(
  300_000,
  Number(process.env.INTELLIGENCE_STALE_PENDING_MS || 2 * 60 * 60_000),
);

const RUNNING_STALE_MS = Math.max(
  1_800_000,
  Number(process.env.INTELLIGENCE_RUNNING_STALE_MS || 30 * 60_000),
);

export type IntelligenceQueueMetrics = {
  pending: number;
  running: number;
  runningStale: number;
  jobsCreatedLast24h: number;
  failedLast24h: number;
  succeededLast24h: number;
  oldestPendingAgeMinutes: number | null;
  retrySaturationRatio: number;
  disputedObservations: number;
  pendingObservations: number;
  verifiedObservations: number;
  deadLetterLast24h: number;
};

export async function collectIntelligenceQueueMetrics(): Promise<IntelligenceQueueMetrics> {
  const since24h = new Date(Date.now() - 86_400_000);
  const runningStaleSince = new Date(Date.now() - RUNNING_STALE_MS);
  const [
    pending,
    running,
    runningStale,
    jobsCreatedLast24h,
    failedLast24h,
    succeededLast24h,
    failedWithRetry,
    succeededTotal24h,
    oldestPending,
    disputedObservations,
    pendingObservations,
    verifiedObservations,
  ] = await Promise.all([
    prisma.intelligencePipelineJob.count({ where: { status: 'PENDING' } }),
    prisma.intelligencePipelineJob.count({ where: { status: 'RUNNING' } }),
    prisma.intelligencePipelineJob.count({
      where: { status: 'RUNNING', startedAt: { lt: runningStaleSince } },
    }),
    prisma.intelligencePipelineJob.count({ where: { createdAt: { gte: since24h } } }),
    prisma.intelligencePipelineJob.count({
      where: { status: 'FAILED', finishedAt: { gte: since24h } },
    }),
    prisma.intelligencePipelineJob.count({
      where: { status: 'SUCCEEDED', finishedAt: { gte: since24h } },
    }),
    prisma.intelligencePipelineJob.count({
      where: {
        status: 'FAILED',
        finishedAt: { gte: since24h },
        errorSummary: { contains: 'retry' },
      },
    }),
    prisma.intelligencePipelineJob.count({
      where: { finishedAt: { gte: since24h } },
    }),
    prisma.intelligencePipelineJob.findFirst({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    }),
    prisma.countryObservation.count({ where: { verificationStatus: 'disputed' } }),
    prisma.countryObservation.count({ where: { verificationStatus: 'pending' } }),
    prisma.countryObservation.count({ where: { verificationStatus: 'verified' } }),
  ]);

  const oldestPendingAgeMinutes = oldestPending
    ? Math.round((Date.now() - oldestPending.createdAt.getTime()) / 60_000)
    : null;

  const retrySaturationRatio =
    succeededTotal24h > 0 ? failedWithRetry / succeededTotal24h : failedWithRetry > 0 ? 1 : 0;

  const deadLetterLast24h = await countDeadLetterJobsLast24h();

  return {
    pending,
    running,
    runningStale,
    jobsCreatedLast24h,
    failedLast24h,
    succeededLast24h,
    oldestPendingAgeMinutes,
    retrySaturationRatio: Math.round(retrySaturationRatio * 1000) / 1000,
    disputedObservations,
    pendingObservations,
    verifiedObservations,
    deadLetterLast24h,
  };
}

export function evaluateQueueAlertLevel(
  metrics: IntelligenceQueueMetrics,
): 'ok' | 'warning' | 'critical' {
  if (metrics.deadLetterLast24h >= 5) return 'critical';
  if (metrics.runningStale >= 2) return 'critical';
  if (metrics.oldestPendingAgeMinutes != null && metrics.oldestPendingAgeMinutes > 120) {
    return 'critical';
  }
  if (metrics.runningStale >= 1) return 'warning';
  if (metrics.retrySaturationRatio > 0.4) return 'critical';
  if (metrics.deadLetterLast24h >= 2) return 'warning';
  if (metrics.pending > 100 || metrics.retrySaturationRatio > 0.2) return 'warning';
  if (metrics.disputedObservations > 50) return 'warning';
  return 'ok';
}

export { STALE_PENDING_MS };
