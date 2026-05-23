import { describe, expect, it } from 'vitest';
import { evaluateVolumeAlertLevel, type IntelligenceVolumeSli } from './volume-sli';

function baseVolume(overrides: Partial<IntelligenceVolumeSli>): IntelligenceVolumeSli {
  return {
    windowHours: 24,
    observationsCreated: 40,
    observationsPerHour: 1.6,
    enrichmentRuns: {
      total: 10,
      succeeded: 8,
      failed: 2,
      manifestTriggered: 5,
      manifestSuccessRate: 0.8,
    },
    pipelineJobs: { succeeded: 20, failed: 2, failRate: 0.09 },
    ...overrides,
  };
}

describe('evaluateVolumeAlertLevel', () => {
  it('critical on high pipeline fail rate', () => {
    expect(
      evaluateVolumeAlertLevel(
        baseVolume({
          pipelineJobs: { succeeded: 5, failed: 8, failRate: 0.62 },
        }),
      ),
    ).toBe('critical');
  });

  it('ok on healthy volume', () => {
    expect(evaluateVolumeAlertLevel(baseVolume({}))).toBe('ok');
  });
});
