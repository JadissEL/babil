import type { LegacyCountryRecord } from '@/lib/countries-fallback'

/**
 * Liste « légère » pour `GET /api/countries?light=1` :
 * conserve identité, région, scores scalaires et difficulté RDV ; supprime le JSON `full_data` et les commentaires
 * pour réduire la charge réseau (ex. widgets qui n’ont besoin que de `id` + `name`).
 *
 * Les clients qui filtrent sur `full_data` (explorer, compare, etc.) doivent continuer à appeler sans `light`.
 */
export function toLightCountryListRecord(row: LegacyCountryRecord): LegacyCountryRecord {
  return {
    ...row,
    full_data: {},
    comments: [],
  }
}

export function mapCountriesListToLight(rows: LegacyCountryRecord[]): LegacyCountryRecord[] {
  return rows.map(toLightCountryListRecord)
}
