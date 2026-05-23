/**
 * Deterministic structured extract from allowlisted JSON APIs (no LLM).
 */

import { FIELD_GENERAL_POPULATION_TOTAL } from './taxonomy-v1';

export type ManifestJsonExtract = {
  fieldPath: string;
  value: number;
  unit: string;
  confidence: number;
  summary: string;
};

/** REST Countries v3 — first match in array response. */
export function extractFromRestCountriesJson(payload: unknown): ManifestJsonExtract[] {
  const arr = Array.isArray(payload) ? payload : [];
  const row = arr[0] as Record<string, unknown> | undefined;
  if (!row) return [];

  const out: ManifestJsonExtract[] = [];
  const pop = row.population;
  if (typeof pop === 'number' && Number.isFinite(pop) && pop > 0) {
    out.push({
      fieldPath: FIELD_GENERAL_POPULATION_TOTAL,
      value: pop,
      unit: 'persons',
      confidence: 0.68,
      summary: `Population from REST Countries (${pop.toLocaleString('en-US')})`,
    });
  }
  return out;
}

/** World Bank API v2 /country/{id} — metadata + country row (iso2, capital, coords). */
export function extractFromWorldBankCountryJson(payload: unknown): ManifestJsonExtract[] {
  const arr = Array.isArray(payload) ? payload : [];
  const data = arr[1];
  if (!Array.isArray(data) || data.length === 0) return [];
  const row = data[0] as Record<string, unknown>;
  const iso2 = typeof row.iso2Code === 'string' ? row.iso2Code : null;
  const capital = typeof row.capitalCity === 'string' ? row.capitalCity : null;
  const out: ManifestJsonExtract[] = [];
  if (iso2) {
    out.push({
      fieldPath: 'provenance.world_bank.iso2',
      value: 0,
      unit: 'code',
      confidence: 0.75,
      summary: `World Bank country ISO2 ${iso2}${capital ? ` (capital ${capital})` : ''}`,
    });
  }
  const lat = row.latitude;
  const lon = row.longitude;
  if (typeof lat === 'string' && typeof lon === 'string') {
    const latN = Number(lat);
    const lonN = Number(lon);
    if (Number.isFinite(latN) && Number.isFinite(lonN)) {
      out.push({
        fieldPath: 'geography.capital_coordinates_approx',
        value: latN,
        unit: 'lat',
        confidence: 0.55,
        summary: `WB capital coords ~${latN},${lonN}`,
      });
    }
  }
  return out;
}

export function isWorldBankManifestLabel(label: string): boolean {
  return label === 'World Bank' || label.startsWith('World Bank —');
}

export function tryParseJsonBody(text: string): unknown | null {
  const t = text.trim();
  if (!t.startsWith('{') && !t.startsWith('[')) return null;
  try {
    return JSON.parse(t) as unknown;
  } catch {
    return null;
  }
}
