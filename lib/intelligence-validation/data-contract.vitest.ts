import { describe, expect, it } from 'vitest';
import { validateObservationDataContract } from './data-contract';

describe('validateObservationDataContract', () => {
  it('accepts materialize path with numeric value', () => {
    const r = validateObservationDataContract({
      fieldPath: 'economy.gdp_usd_current',
      valueJson: JSON.stringify({ value: 1_000_000 }),
      valueNumeric: 1_000_000,
    });
    expect(r.valid).toBe(true);
  });

  it('rejects materialize path without numeric', () => {
    const r = validateObservationDataContract({
      fieldPath: 'general.population_total',
      valueJson: JSON.stringify({ note: 'missing' }),
      valueNumeric: null,
    });
    expect(r.valid).toBe(false);
    expect(r.violations.some((v) => v.code === 'materialize_missing_numeric')).toBe(true);
  });

  it('accepts manifest provenance snapshot', () => {
    const r = validateObservationDataContract({
      fieldPath: 'provenance.manifest.visa.ambassade_france',
      valueJson: JSON.stringify({ ok: true, httpStatus: 200, summary: 'ok' }),
      valueNumeric: null,
    });
    expect(r.valid).toBe(true);
  });
});
