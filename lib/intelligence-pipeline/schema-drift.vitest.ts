import { describe, expect, it } from 'vitest';
import { detectRestCountriesSchemaDrift, detectWorldBankCountrySchemaDrift } from './schema-drift';

describe('schema drift', () => {
  it('detects REST population type change', () => {
    const r = detectRestCountriesSchemaDrift([{ population: 'big' }]);
    expect(r.ok).toBe(false);
    expect(r.warnings).toContain('population_type_changed');
  });

  it('accepts valid World Bank pair', () => {
    const r = detectWorldBankCountrySchemaDrift([
      { page: 1 },
      [{ iso2Code: 'FR', capitalCity: 'Paris' }],
    ]);
    expect(r.ok).toBe(true);
  });
});
