import { describe, expect, it } from 'vitest';
import { intelligenceCoverageFromFullData } from './country-intelligence-coverage-display';

describe('intelligenceCoverageFromFullData', () => {
  it('scores materialized economy paths', () => {
    const cov = intelligenceCoverageFromFullData({
      economy: { gdp_usd: 1e12, population_wb: 67_000_000 },
    });
    expect(cov.materializedCount).toBeGreaterThanOrEqual(2);
    expect(cov.score).toBeGreaterThan(0);
  });
});
