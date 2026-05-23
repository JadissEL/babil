import { describe, expect, it } from 'vitest';
import { evaluateSaturationAlertLevel, type IntelligenceSaturationSli } from './saturation-sli';

describe('evaluateSaturationAlertLevel', () => {
  it('critical near daily cap', () => {
    const sli: IntelligenceSaturationSli = {
      maxJobsPerDay: 200,
      maxManifestFetchPerDay: 80,
      jobsCreatedToday: 195,
      manifestFetchCreatedToday: 78,
      jobBudgetUtilization: 0.975,
      manifestBudgetUtilization: 0.975,
    };
    expect(evaluateSaturationAlertLevel(sli)).toBe('critical');
  });
});
