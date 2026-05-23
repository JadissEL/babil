/**
 * CI guard: pipeline queue SLO + dead-letter volume.
 *
 * @example
 * npx tsx scripts/check-intelligence-queue-alerts.ts
 * npx tsx scripts/check-intelligence-queue-alerts.ts --fail-on-warning
 */
import 'dotenv/config';
import {
  collectIntelligenceFreshnessSli,
  evaluateFreshnessAlertLevel,
} from '../lib/intelligence-pipeline/freshness-sli';
import {
  collectIntelligenceQueueMetrics,
  evaluateQueueAlertLevel,
} from '../lib/intelligence-pipeline/queue-metrics';
import {
  collectIntelligenceVolumeSli,
  evaluateVolumeAlertLevel,
} from '../lib/intelligence-pipeline/volume-sli';

async function main() {
  const failOnWarning = process.argv.includes('--fail-on-warning');
  const metrics = await collectIntelligenceQueueMetrics();
  const deadLetter24h = metrics.deadLetterLast24h;
  const queueLevel = evaluateQueueAlertLevel(metrics);
  const deadLetterCritical = deadLetter24h >= 5;

  let freshnessLevel: 'ok' | 'warning' | 'critical' = 'ok';
  let volumeLevel: 'ok' | 'warning' | 'critical' = 'ok';
  let freshness = null;
  let volume = null;
  try {
    freshness = await collectIntelligenceFreshnessSli();
    freshnessLevel = evaluateFreshnessAlertLevel(freshness);
    volume = await collectIntelligenceVolumeSli();
    volumeLevel = evaluateVolumeAlertLevel(volume);
  } catch {
    /* DB optional in some CI */
  }

  const level =
    queueLevel === 'critical' || freshnessLevel === 'critical' || volumeLevel === 'critical'
      ? 'critical'
      : queueLevel === 'warning' || freshnessLevel === 'warning' || volumeLevel === 'warning'
        ? 'warning'
        : 'ok';

  const payload = {
    level,
    queueLevel,
    freshnessLevel,
    volumeLevel,
    deadLetter24h,
    deadLetterCritical,
    metrics,
    freshness,
    volume,
  };
  console.log(`[check-intelligence-queue-alerts] ${JSON.stringify(payload)}`);

  if (level === 'critical' || deadLetterCritical) {
    console.error(
      '[check-intelligence-queue-alerts] CRITICAL: queue SLO violated or dead-letter threshold exceeded.',
    );
    process.exitCode = 1;
  } else if (level === 'warning' && failOnWarning) {
    console.error('[check-intelligence-queue-alerts] WARNING (--fail-on-warning).');
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
