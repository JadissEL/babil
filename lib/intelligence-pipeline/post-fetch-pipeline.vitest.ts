import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/intelligence-validation', () => ({
  validateAndTagObservationsForCountry: vi.fn(async () => ({ tagged: 1 })),
  materializeEconomyObservationsForCountry: vi.fn(async () => true),
}));

import {
  materializeEconomyObservationsForCountry,
  validateAndTagObservationsForCountry,
} from '@/lib/intelligence-validation';
import { validateAndMaybeMaterializeCountry } from './post-fetch-pipeline';

describe('validateAndMaybeMaterializeCountry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.INTELLIGENCE_AUTO_MATERIALIZE_AFTER_FETCH;
  });

  afterEach(() => {
    delete process.env.INTELLIGENCE_AUTO_MATERIALIZE_AFTER_FETCH;
  });

  it('materializes by default after validate', async () => {
    const out = await validateAndMaybeMaterializeCountry(42);
    expect(validateAndTagObservationsForCountry).toHaveBeenCalledWith(42);
    expect(materializeEconomyObservationsForCountry).toHaveBeenCalledWith(42, {
      onlyPromotable: true,
    });
    expect(out.materialized).toBe(true);
  });

  it('skips materialize when env is 0', async () => {
    process.env.INTELLIGENCE_AUTO_MATERIALIZE_AFTER_FETCH = '0';
    const out = await validateAndMaybeMaterializeCountry(7);
    expect(materializeEconomyObservationsForCountry).not.toHaveBeenCalled();
    expect(out.materialized).toBe(false);
  });
});
