import { describe, expect, it } from 'vitest';
import { evaluateLatencyAlertLevel, type IntelligenceLatencySli } from './latency-sli';

describe('evaluateLatencyAlertLevel', () => {
  it('warns when p95 exceeds threshold', () => {
    const sli: IntelligenceLatencySli = {
      sampleCount: 10,
      p50DurationMs: 60_000,
      p95DurationMs: 1_000_000,
      p99DurationMs: 1_200_000,
      maxDurationMs: 1_500_000,
      p95WarnThresholdMs: 900_000,
    };
    expect(evaluateLatencyAlertLevel(sli)).toBe('warning');
  });
});
