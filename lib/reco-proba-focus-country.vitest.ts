import { describe, expect, it } from 'vitest';
import { pinCountryFirst } from '@/lib/reco-proba-focus-country';

describe('pinCountryFirst', () => {
  it('returns the same array when focus is missing or invalid', () => {
    const rows = [{ id: 1 }, { id: 2 }];
    expect(pinCountryFirst(rows, undefined)).toEqual(rows);
    expect(pinCountryFirst(rows, 0)).toEqual(rows);
    expect(pinCountryFirst(rows, -3)).toEqual(rows);
  });

  it('moves the focused id to index 0', () => {
    const rows = [
      { id: 1, n: 'a' },
      { id: 2, n: 'b' },
      { id: 3, n: 'c' },
    ];
    expect(pinCountryFirst(rows, 3).map((r) => r.id)).toEqual([3, 1, 2]);
  });

  it('is a no-op when id is already first or absent', () => {
    const rows = [{ id: 10 }, { id: 20 }];
    expect(pinCountryFirst(rows, 10)).toEqual(rows);
    expect(pinCountryFirst(rows, 99)).toEqual(rows);
  });
});
