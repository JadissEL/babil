import { describe, expect, it } from 'vitest';
import { runFieldExpectations } from './expectations-suite';

describe('runFieldExpectations', () => {
  it('rejects impossible unemployment', () => {
    const v = runFieldExpectations({
      fieldPath: 'work.unemployment_rate_pct',
      valueJson: JSON.stringify({ value: 150 }),
      valueNumeric: 150,
    });
    expect(v.some((x) => x.code === 'expect_max')).toBe(true);
  });

  it('accepts plausible population', () => {
    const v = runFieldExpectations({
      fieldPath: 'general.population_total',
      valueJson: JSON.stringify({ value: 10_000_000 }),
      valueNumeric: 10_000_000,
    });
    expect(v).toHaveLength(0);
  });
});
