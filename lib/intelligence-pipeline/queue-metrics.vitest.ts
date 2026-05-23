import { describe, expect, it } from 'vitest';
import { evaluateQueueAlertLevel, type IntelligenceQueueMetrics } from './queue-metrics';

function base(overrides: Partial<IntelligenceQueueMetrics> = {}): IntelligenceQueueMetrics {
  return {
    pending: 0,
    running: 0,
    runningStale: 0,
    jobsCreatedLast24h: 0,
    failedLast24h: 0,
    succeededLast24h: 10,
    oldestPendingAgeMinutes: null,
    retrySaturationRatio: 0,
    disputedObservations: 0,
    pendingObservations: 0,
    verifiedObservations: 100,
    deadLetterLast24h: 0,
    ...overrides,
  };
}

describe('evaluateQueueAlertLevel', () => {
  it('returns ok for healthy queue', () => {
    expect(evaluateQueueAlertLevel(base())).toBe('ok');
  });

  it('critical when oldest pending exceeds 120 minutes', () => {
    expect(evaluateQueueAlertLevel(base({ oldestPendingAgeMinutes: 121 }))).toBe('critical');
  });

  it('critical when retry saturation is high', () => {
    expect(evaluateQueueAlertLevel(base({ retrySaturationRatio: 0.5 }))).toBe('critical');
  });

  it('warning when pending backlog is large', () => {
    expect(evaluateQueueAlertLevel(base({ pending: 150 }))).toBe('warning');
  });

  it('critical when dead-letter volume exceeds threshold', () => {
    expect(evaluateQueueAlertLevel(base({ deadLetterLast24h: 5 }))).toBe('critical');
  });
});
