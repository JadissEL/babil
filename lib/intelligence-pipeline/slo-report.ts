/**
 * SLO-style pipeline report (RED: rate, errors, duration proxies).
 * @see https://pipelineframework.org/guide/operations/observability/metrics
 */

import prisma from '@/lib/prisma';
import {
  collectIntelligenceFreshnessSli,
  evaluateFreshnessAlertLevel,
  type IntelligenceFreshnessSli,
} from './freshness-sli';
import {
  collectIntelligenceVolumeSli,
  evaluateVolumeAlertLevel,
  type IntelligenceVolumeSli,
} from './volume-sli';
import {
  collectIntelligenceQueueMetrics,
  evaluateQueueAlertLevel,
  type IntelligenceQueueMetrics,
} from './queue-metrics';
import {
  collectIntelligenceLatencySli,
  evaluateLatencyAlertLevel,
  type IntelligenceLatencySli,
} from './latency-sli';
import {
  collectIntelligenceSaturationSli,
  evaluateSaturationAlertLevel,
  type IntelligenceSaturationSli,
} from './saturation-sli';
import {
  collectIntelligenceContractSli,
  evaluateContractAlertLevel,
  type IntelligenceContractSli,
} from '@/lib/intelligence-validation/contract-sli';

export type IntelligenceSloReport = {
  generatedAt: string;
  queue: IntelligenceQueueMetrics;
  alertLevel: 'ok' | 'warning' | 'critical';
  deadLetterLast24h: number;
  observations: {
    total: number;
    verified: number;
    disputed: number;
    pending: number;
  };
  jobsLast24h: {
    succeeded: number;
    failed: number;
    pending: number;
    running: number;
  };
  freshness: IntelligenceFreshnessSli;
  freshnessAlertLevel: 'ok' | 'warning' | 'critical';
  volume: IntelligenceVolumeSli;
  volumeAlertLevel: 'ok' | 'warning' | 'critical';
  latency: IntelligenceLatencySli;
  latencyAlertLevel: 'ok' | 'warning' | 'critical';
  saturation: IntelligenceSaturationSli;
  saturationAlertLevel: 'ok' | 'warning' | 'critical';
  contract: IntelligenceContractSli;
  contractAlertLevel: 'ok' | 'warning' | 'critical';
  sloHints: string[];
};

export async function buildIntelligenceSloReport(): Promise<IntelligenceSloReport> {
  const since24h = new Date(Date.now() - 86_400_000);
  const [
    queue,
    freshness,
    volume,
    latency,
    saturation,
    contract,
    obsTotal,
    obsVerified,
    obsDisputed,
    obsPending,
    succeeded,
    failed,
    pending,
    running,
  ] = await Promise.all([
    collectIntelligenceQueueMetrics(),
    collectIntelligenceFreshnessSli(),
    collectIntelligenceVolumeSli(),
    collectIntelligenceLatencySli(),
    collectIntelligenceSaturationSli(),
    collectIntelligenceContractSli(),
    prisma.countryObservation.count(),
    prisma.countryObservation.count({ where: { verificationStatus: 'verified' } }),
    prisma.countryObservation.count({ where: { verificationStatus: 'disputed' } }),
    prisma.countryObservation.count({ where: { verificationStatus: 'pending' } }),
    prisma.intelligencePipelineJob.count({
      where: { status: 'SUCCEEDED', finishedAt: { gte: since24h } },
    }),
    prisma.intelligencePipelineJob.count({
      where: { status: 'FAILED', finishedAt: { gte: since24h } },
    }),
    prisma.intelligencePipelineJob.count({ where: { status: 'PENDING' } }),
    prisma.intelligencePipelineJob.count({ where: { status: 'RUNNING' } }),
  ]);

  const queueAlert = evaluateQueueAlertLevel(queue);
  const freshnessAlert = evaluateFreshnessAlertLevel(freshness);
  const volumeAlert = evaluateVolumeAlertLevel(volume);
  const latencyAlert = evaluateLatencyAlertLevel(latency);
  const saturationAlert = evaluateSaturationAlertLevel(saturation);
  const contractAlert = evaluateContractAlertLevel(contract);
  const alertLevel: IntelligenceSloReport['alertLevel'] =
    queueAlert === 'critical' ||
    freshnessAlert === 'critical' ||
    volumeAlert === 'critical' ||
    latencyAlert === 'critical' ||
    saturationAlert === 'critical' ||
    contractAlert === 'critical'
      ? 'critical'
      : queueAlert === 'warning' ||
          freshnessAlert === 'warning' ||
          volumeAlert === 'warning' ||
          latencyAlert === 'warning' ||
          saturationAlert === 'warning' ||
          contractAlert === 'warning'
        ? 'warning'
        : 'ok';
  const deadLetterLast24h = queue.deadLetterLast24h;
  const sloHints: string[] = [];

  if (queue.oldestPendingAgeMinutes != null && queue.oldestPendingAgeMinutes > 60) {
    sloHints.push(`oldest_pending_minutes=${queue.oldestPendingAgeMinutes}`);
  }
  if (deadLetterLast24h > 0) sloHints.push(`dead_letter_24h=${deadLetterLast24h}`);
  if (queue.retrySaturationRatio > 0.15) {
    sloHints.push(`retry_saturation=${queue.retrySaturationRatio}`);
  }
  const failRate = succeeded + failed > 0 ? failed / (succeeded + failed) : 0;
  if (failRate > 0.2) sloHints.push(`job_fail_rate_24h=${Math.round(failRate * 1000) / 1000}`);
  if (freshness.materializedFreshRatio < 0.85) {
    sloHints.push(`materialized_fresh_ratio=${freshness.materializedFreshRatio}`);
  }
  if (volume.pipelineJobs.failRate > 0.15) {
    sloHints.push(`pipeline_fail_rate_24h=${volume.pipelineJobs.failRate}`);
  }
  if (volume.observationsCreated === 0 && volume.enrichmentRuns.total > 0) {
    sloHints.push('zero_observations_24h');
  }
  if (queue.runningStale > 0) sloHints.push(`running_stale=${queue.runningStale}`);
  if (latency.p95DurationMs != null && latencyAlert !== 'ok') {
    sloHints.push(`job_p95_ms=${latency.p95DurationMs}`);
  }
  if (saturation.jobBudgetUtilization >= 0.8) {
    sloHints.push(`job_budget_util=${saturation.jobBudgetUtilization}`);
  }
  if (contract.violationRate >= 0.05) {
    sloHints.push(`contract_violation_rate=${contract.violationRate}`);
  }

  return {
    generatedAt: new Date().toISOString(),
    queue,
    alertLevel,
    deadLetterLast24h,
    observations: {
      total: obsTotal,
      verified: obsVerified,
      disputed: obsDisputed,
      pending: obsPending,
    },
    jobsLast24h: { succeeded, failed, pending, running },
    freshness,
    freshnessAlertLevel: freshnessAlert,
    volume,
    volumeAlertLevel: volumeAlert,
    latency,
    latencyAlertLevel: latencyAlert,
    saturation,
    saturationAlertLevel: saturationAlert,
    contract,
    contractAlertLevel: contractAlert,
    sloHints,
  };
}
