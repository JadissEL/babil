/**
 * Latency SLI: job duration percentiles (golden signal proxy for batch pipelines).
 */

import prisma from '@/lib/prisma';

const DEFAULT_P95_WARN_MS = Math.max(
  60_000,
  Number(process.env.INTELLIGENCE_JOB_P95_WARN_MS || 900_000),
);

function percentile(sortedMs: number[], p: number): number | null {
  if (sortedMs.length === 0) return null;
  const idx = Math.min(sortedMs.length - 1, Math.ceil((p / 100) * sortedMs.length) - 1);
  return sortedMs[Math.max(0, idx)] ?? null;
}

export type IntelligenceLatencySli = {
  sampleCount: number;
  p50DurationMs: number | null;
  p95DurationMs: number | null;
  p99DurationMs: number | null;
  maxDurationMs: number | null;
  p95WarnThresholdMs: number;
};

export async function collectIntelligenceLatencySli(
  windowHours = 24,
): Promise<IntelligenceLatencySli> {
  const since = new Date(Date.now() - windowHours * 3_600_000);
  const finished = await prisma.intelligencePipelineJob.findMany({
    where: {
      status: { in: ['SUCCEEDED', 'FAILED'] },
      startedAt: { not: null },
      finishedAt: { gte: since },
    },
    select: { startedAt: true, finishedAt: true },
    take: 500,
    orderBy: { finishedAt: 'desc' },
  });

  const durations = finished
    .filter((j) => j.startedAt && j.finishedAt)
    .map((j) => j.finishedAt!.getTime() - j.startedAt!.getTime())
    .filter((ms) => ms >= 0 && ms < 86_400_000)
    .sort((a, b) => a - b);

  return {
    sampleCount: durations.length,
    p50DurationMs: percentile(durations, 50),
    p95DurationMs: percentile(durations, 95),
    p99DurationMs: percentile(durations, 99),
    maxDurationMs: durations.length > 0 ? durations[durations.length - 1]! : null,
    p95WarnThresholdMs: DEFAULT_P95_WARN_MS,
  };
}

export function evaluateLatencyAlertLevel(
  sli: IntelligenceLatencySli,
): 'ok' | 'warning' | 'critical' {
  if (sli.sampleCount < 3) return 'ok';
  const p95 = sli.p95DurationMs;
  if (p95 == null) return 'ok';
  if (p95 >= sli.p95WarnThresholdMs * 2) return 'critical';
  if (p95 >= sli.p95WarnThresholdMs) return 'warning';
  return 'ok';
}
