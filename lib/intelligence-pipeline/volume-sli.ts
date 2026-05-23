/**
 * Volume SLI: ingest throughput and manifest fetch success rate (24h window).
 */

import prisma from '@/lib/prisma';

export type IntelligenceVolumeSli = {
  windowHours: number;
  observationsCreated: number;
  observationsPerHour: number;
  enrichmentRuns: {
    total: number;
    succeeded: number;
    failed: number;
    manifestTriggered: number;
    manifestSuccessRate: number | null;
  };
  pipelineJobs: {
    succeeded: number;
    failed: number;
    failRate: number;
  };
};

export async function collectIntelligenceVolumeSli(): Promise<IntelligenceVolumeSli> {
  const since24h = new Date(Date.now() - 86_400_000);

  const [observationsCreated, runs, jobsSucceeded, jobsFailed] = await Promise.all([
    prisma.countryObservation.count({ where: { observedAt: { gte: since24h } } }),
    prisma.enrichmentRun.findMany({
      where: { startedAt: { gte: since24h } },
      select: { status: true, trigger: true },
    }),
    prisma.intelligencePipelineJob.count({
      where: { status: 'SUCCEEDED', finishedAt: { gte: since24h } },
    }),
    prisma.intelligencePipelineJob.count({
      where: { status: 'FAILED', finishedAt: { gte: since24h } },
    }),
  ]);

  const manifestRuns = runs.filter(
    (r) => r.trigger?.includes('manifest') || r.trigger?.includes('job:'),
  );
  const manifestSucceeded = manifestRuns.filter((r) => r.status === 'SUCCEEDED').length;
  const manifestFailed = manifestRuns.filter((r) => r.status === 'FAILED').length;
  const manifestDenom = manifestSucceeded + manifestFailed;

  const jobDenom = jobsSucceeded + jobsFailed;

  return {
    windowHours: 24,
    observationsCreated,
    observationsPerHour: Math.round((observationsCreated / 24) * 10) / 10,
    enrichmentRuns: {
      total: runs.length,
      succeeded: runs.filter((r) => r.status === 'SUCCEEDED').length,
      failed: runs.filter((r) => r.status === 'FAILED' || r.status === 'PARTIAL').length,
      manifestTriggered: manifestRuns.length,
      manifestSuccessRate:
        manifestDenom > 0 ? Math.round((manifestSucceeded / manifestDenom) * 1000) / 1000 : null,
    },
    pipelineJobs: {
      succeeded: jobsSucceeded,
      failed: jobsFailed,
      failRate: jobDenom > 0 ? Math.round((jobsFailed / jobDenom) * 1000) / 1000 : 0,
    },
  };
}

export function evaluateVolumeAlertLevel(
  volume: IntelligenceVolumeSli,
): 'ok' | 'warning' | 'critical' {
  if (volume.pipelineJobs.failRate > 0.35 && volume.pipelineJobs.failed >= 5) return 'critical';
  if (
    volume.enrichmentRuns.manifestSuccessRate != null &&
    volume.enrichmentRuns.manifestSuccessRate < 0.5 &&
    volume.enrichmentRuns.manifestTriggered >= 3
  ) {
    return 'critical';
  }
  if (volume.pipelineJobs.failRate > 0.2) return 'warning';
  if (volume.observationsCreated === 0 && volume.enrichmentRuns.total > 0) return 'warning';
  return 'ok';
}
