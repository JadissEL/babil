import { describe, expect, it } from 'vitest';
import {
  extractFromRestCountriesJson,
  extractFromWorldBankCountryJson,
  isWorldBankManifestLabel,
} from './manifest-json-extract';

describe('manifest-json-extract', () => {
  it('extracts population from REST Countries array', () => {
    const out = extractFromRestCountriesJson([{ population: 1_000_000 }]);
    expect(out).toHaveLength(1);
    expect(out[0]?.value).toBe(1_000_000);
  });

  it('extracts iso2 from World Bank country payload', () => {
    const payload = [
      { page: 1 },
      [{ iso2Code: 'FR', capitalCity: 'Paris', latitude: '48.87', longitude: '2.33' }],
    ];
    const out = extractFromWorldBankCountryJson(payload);
    expect(out.some((x) => x.fieldPath === 'provenance.world_bank.iso2')).toBe(true);
  });

  it('detects World Bank manifest labels', () => {
    expect(isWorldBankManifestLabel('World Bank')).toBe(true);
    expect(isWorldBankManifestLabel('World Bank — indicateurs macro')).toBe(true);
    expect(isWorldBankManifestLabel('OECD')).toBe(false);
  });
});
