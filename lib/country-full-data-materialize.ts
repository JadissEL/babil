/**
 * Parsed `full_data` plus friction coalescence and **driving_rights v1** materialization from legacy
 * `driving_license` when needed — **no Prisma**, safe for client bundles.
 * Prefer `augmentCountryDetailPayload` / `buildMergedCountriesList` on the server when possible;
 * use **`materializePublicFullDataForApi`** for **HTTP / client-facing** payloads (retire `_data_changelog`).
 * Use `materializePublicFullData` when persisting en base après avoir éventuellement appendé au journal interne.
 */

import { parseCountryFullData } from '@/lib/country-full-data-json'
import { syncDrivingRightsIntelIntoFullData } from '@/lib/driving-rights-intel'
import { stripFullDataChangelog } from '@/lib/full-data-changelog'
import { isSchengenMember } from '@/lib/schengen-members'

function frictionTopLevelWeak(v: unknown): boolean {
  if (v === undefined || v === null) return true
  if (typeof v === 'number') return Number.isNaN(v)
  return false
}

/** Promote `friction_analysis.friction_score` to top-level `friction_score` when missing. */
export function normalizeFullDataFriction(full: Record<string, unknown>): Record<string, unknown> {
  if (!frictionTopLevelWeak(full.friction_score)) return full
  const fa = full.friction_analysis
  if (!fa || typeof fa !== 'object' || Array.isArray(fa)) return full
  const nested = (fa as Record<string, unknown>).friction_score
  if (typeof nested !== 'number' || !Number.isFinite(nested)) return full
  return { ...full, friction_score: nested }
}

/**
 * Parse stored `full_data` (JSON string or plain object) and normalize fields used across UI/API.
 */
export function materializePublicFullData(raw: unknown): Record<string, unknown> {
  const parsed = parseCountryFullData(raw)
  return syncDrivingRightsIntelIntoFullData(normalizeFullDataFriction(parsed))
}

/**
 * Même traitement que `materializePublicFullData`, puis suppression de `_data_changelog`
 * (réservé DB / audit — ne doit pas fuiter vers clients publics).
 */
export function materializePublicFullDataForApi(raw: unknown): Record<string, unknown> {
  return stripFullDataChangelog(materializePublicFullData(raw))
}

/**
 * Writes canonical `schengen_flag` at the top level of stored `full_data` so JSON matches
 * Prisma + explorer rules (`lib/schengen-members`), independent of stale dataset flags.
 */
export function attachCanonicalSchengenFlag(
  full: Record<string, unknown>,
  countryName: string,
): Record<string, unknown> {
  return { ...full, schengen_flag: isSchengenMember(countryName) }
}

/** One row from `GET /api/countries` or `GET /api/countries/[id]` — guarantees `full_data` is parsed + friction-normalized. */
export function materializeCountryApiRow<T extends Record<string, unknown>>(row: T): T & { full_data: Record<string, unknown> } {
  return { ...row, full_data: materializePublicFullDataForApi(row.full_data ?? null) }
}

/** Client-side defense after `fetch('/api/countries')` — handles non-array payloads and string `full_data`. */
export function normalizeCountriesApiListResponse(data: unknown): Record<string, unknown>[] {
  if (!Array.isArray(data)) return []
  return data.map((row) =>
    materializeCountryApiRow(
      row !== null && typeof row === 'object' && !Array.isArray(row) ? (row as Record<string, unknown>) : {},
    ),
  )
}
