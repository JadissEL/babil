import { describe, expect, it } from 'vitest';
import type { ContradictionExcerpt } from './contradiction-excerpts';
import { runHeuristicContradictionPass } from './contradiction-heuristic';

describe('runHeuristicContradictionPass', () => {
  it('flags relative numeric divergence on same field', () => {
    const excerpts: ContradictionExcerpt[] = [
      {
        observationId: 'a',
        countryId: 1,
        fieldPath: 'economy.gdp_usd_current',
        excerpt: JSON.stringify({ value: 1_000_000_000 }),
        valueNumeric: 1_000_000_000,
        confidence: 0.7,
      },
      {
        observationId: 'b',
        countryId: 1,
        fieldPath: 'economy.gdp_usd_current',
        excerpt: JSON.stringify({ value: 1_300_000_000 }),
        valueNumeric: 1_300_000_000,
        confidence: 0.65,
      },
    ];
    const r = runHeuristicContradictionPass(excerpts);
    expect(r.conflicts.length).toBeGreaterThan(0);
  });

  it('ignores single-value groups', () => {
    const excerpts: ContradictionExcerpt[] = [
      {
        observationId: 'a',
        countryId: 2,
        fieldPath: 'general.population_total',
        excerpt: '{"value":5000000}',
        valueNumeric: 5_000_000,
        confidence: 0.8,
      },
    ];
    expect(runHeuristicContradictionPass(excerpts).conflicts).toHaveLength(0);
  });
});
