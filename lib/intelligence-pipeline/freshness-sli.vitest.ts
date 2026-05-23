import { describe, expect, it } from 'vitest';
import { evaluateFreshnessAlertLevel, type IntelligenceFreshnessSli } from './freshness-sli';

function baseSli(overrides: Partial<IntelligenceFreshnessSli>): IntelligenceFreshnessSli {
  return {
    staleMaterializeDays: 30,
    countriesSampled: 50,
    materializedFreshCount: 40,
    materializedStaleCount: 10,
    materializedFreshRatio: 0.8,
    oldestMaterializedAgeDays: 5,
    observationFreshness: {
      pathsChecked: 4,
      countriesWithRecentObs: 30,
      oldestObservationAgeHours: 48,
    },
    ...overrides,
  };
}

describe('evaluateFreshnessAlertLevel', () => {
  it('critical when fresh ratio below 0.5 on large sample', () => {
    expect(
      evaluateFreshnessAlertLevel(baseSli({ materializedFreshRatio: 0.4, countriesSampled: 30 })),
    ).toBe('critical');
  });

  it('ok when fresh ratio healthy', () => {
    expect(evaluateFreshnessAlertLevel(baseSli({ materializedFreshRatio: 0.9 }))).toBe('ok');
  });
});
