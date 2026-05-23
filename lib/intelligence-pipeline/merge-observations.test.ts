import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  compareObservationPrecedence,
  nestedObjectFromWinners,
  pickWinningValueJsonByPath,
  setDeep,
} from './merge-observations';

describe('compareObservationPrecedence', () => {
  it('prefers tier A over B when newer B is lower tier', () => {
    const a = {
      fieldPath: 'x',
      valueJson: '"a"',
      confidence: 0.5,
      observedAt: new Date('2020-01-01'),
      tier: 'TIER_A_OFFICIAL' as const,
    };
    const b = {
      fieldPath: 'x',
      valueJson: '"b"',
      confidence: 0.99,
      observedAt: new Date('2026-01-01'),
      tier: 'TIER_C_CURATED' as const,
    };
    assert.ok(compareObservationPrecedence(a, b) < 0);
  });
});

describe('pickWinningValueJsonByPath', () => {
  it('keeps first winner per path after sort', () => {
    const winners = pickWinningValueJsonByPath([
      {
        fieldPath: 'general.population',
        valueJson: '100',
        confidence: 0.5,
        observedAt: new Date('2020-01-01'),
        tier: 'TIER_C_CURATED',
      },
      {
        fieldPath: 'general.population',
        valueJson: '200',
        confidence: 0.5,
        observedAt: new Date('2025-01-01'),
        tier: 'TIER_A_OFFICIAL',
      },
    ]);
    assert.equal(winners.get('general.population'), '200');
  });
});

describe('nestedObjectFromWinners', () => {
  it('merges dotted paths', () => {
    const m = new Map([
      ['general.population', '33000000'],
      ['general.capital', '"Rabat"'],
    ]);
    const obj = nestedObjectFromWinners(m);
    assert.deepEqual(obj, { general: { population: 33000000, capital: 'Rabat' } });
  });
});

describe('setDeep', () => {
  it('creates intermediate objects', () => {
    const o: Record<string, unknown> = {};
    setDeep(o, 'a.b.c', 1);
    assert.deepEqual(o, { a: { b: { c: 1 } } });
  });
});
