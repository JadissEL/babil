/**
 * Upstream API schema drift detection (contract guard on manifest JSON).
 */

export type SchemaDriftReport = {
  source: 'rest_countries' | 'world_bank_country';
  ok: boolean;
  warnings: string[];
};

export function detectRestCountriesSchemaDrift(payload: unknown): SchemaDriftReport {
  const warnings: string[] = [];
  const arr = Array.isArray(payload) ? payload : null;
  if (!arr) {
    return { source: 'rest_countries', ok: false, warnings: ['expected_json_array'] };
  }
  if (arr.length === 0) {
    warnings.push('empty_array');
  }
  const row = arr[0] as Record<string, unknown> | undefined;
  if (row && row.population != null && typeof row.population !== 'number') {
    warnings.push('population_type_changed');
  }
  if (row && !('name' in row) && !('cca2' in row)) {
    warnings.push('missing_name_or_cca2');
  }
  return { source: 'rest_countries', ok: warnings.length === 0, warnings };
}

export function detectWorldBankCountrySchemaDrift(payload: unknown): SchemaDriftReport {
  const warnings: string[] = [];
  const arr = Array.isArray(payload) ? payload : null;
  if (!arr || arr.length < 2) {
    return { source: 'world_bank_country', ok: false, warnings: ['expected_wb_v2_array_pair'] };
  }
  const data = arr[1];
  if (!Array.isArray(data)) {
    return { source: 'world_bank_country', ok: false, warnings: ['missing_data_array'] };
  }
  const row = data[0] as Record<string, unknown> | undefined;
  if (row && row.iso2Code != null && typeof row.iso2Code !== 'string') {
    warnings.push('iso2Code_type_changed');
  }
  return { source: 'world_bank_country', ok: warnings.length === 0, warnings };
}
