import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { extractFromRestCountriesJson } from './manifest-json-extract';

describe('extractFromRestCountriesJson', () => {
  it('extracts population from first country object', () => {
    const out = extractFromRestCountriesJson([
      { name: { common: 'France' }, population: 67_000_000 },
    ]);
    assert.equal(out.length, 1);
    assert.equal(out[0].value, 67_000_000);
    assert.equal(out[0].fieldPath, 'general.population_total');
  });
});
