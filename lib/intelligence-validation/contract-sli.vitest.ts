import { describe, expect, it } from 'vitest';
import { evaluateContractAlertLevel, type IntelligenceContractSli } from './contract-sli';

describe('evaluateContractAlertLevel', () => {
  it('critical when violation rate exceeds 15%', () => {
    const sli: IntelligenceContractSli = {
      contractVersion: 'v1',
      sampleSize: 100,
      violationCount: 20,
      violationRate: 0.2,
      topViolationCodes: [],
    };
    expect(evaluateContractAlertLevel(sli)).toBe('critical');
  });
});
