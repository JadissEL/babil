/**
 * Low-level parse for `Country.full_data` (JSON string or object).
 *
 * For **consumer-facing reads**, prefer `materializePublicFullData()` from
 * `@/lib/country-full-data-materialize`, or server-side merge via
 * `buildMergedCountriesList()` / `augmentCountryDetailPayload()` so static JSON
 * overlays apply.
 */

export function parseCountryFullData(raw: unknown): Record<string, unknown> {
  if (raw === null || raw === undefined) return {}
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw as Record<string, unknown>
  if (typeof raw !== 'string' || raw.trim().length === 0) return {}
  try {
    const parsed = JSON.parse(raw) as unknown
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
  } catch {
    /* invalid JSON */
  }
  return {}
}
