/**
 * Builds the public countries list/detail payload: merges Prisma (runner / seed truth)
 * with static `data/countries.json` as a coverage fallback when a DB row has no counterpart.
 *
 * **Consistency rule for public HTTP responses:** never return raw `parseCountryFullData(prismaRow)`
 * alone. Prefer `buildMergedCountriesList()` / `getMergedCountriesListCached()`, `augmentCountryDetailPayload()`, or
 * `augmentPrismaCountriesForPublicPayload()` with `loadFallbackCountries()` so:
 * - Static JSON is matched by **country name** first (Prisma `id` often ≠ countries.json index).
 * - Null visa columns are backfilled from static.
 * - `full_data.friction_score` is coalesced from `friction_analysis` when missing.
 * Client-side reads should use `materializePublicFullDataForApi` from `@/lib/country-full-data-materialize`.
 */

import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import type { LegacyCountryRecord } from '@/lib/countries-fallback'
import { loadFallbackCountries } from '@/lib/countries-fallback'
import { parseCountryFullData } from '@/lib/country-full-data-json'
import { materializePublicFullDataForApi } from '@/lib/country-full-data-materialize'
import { mergeDisplayedFullData } from '@/lib/merge-displayed-full-data'
import prisma from '@/lib/prisma'
import { dedupeSchengenMembersByCanonicalName, warnIfSchengenCardinalityExceeded } from '@/lib/schengen-duplicate-merge'
import { isSchengenMember } from '@/lib/schengen-members'

/** Match DB row to static JSON even with minor spacing / casing drift. */
export function countryNameMergeKey(name: string): string {
  return name.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase()
}

export { mergeDisplayedFullData } from '@/lib/merge-displayed-full-data'

/** Match static JSON row to a Prisma country: **name first** (IDs often diverge from countries.json order), then id. */
export function findLegacyCountryMatch(
  fallback: LegacyCountryRecord[],
  db: { id: number; name: string },
): LegacyCountryRecord | null {
  const nk = countryNameMergeKey(db.name)
  const byName = fallback.find((f) => countryNameMergeKey(f.name) === nk)
  if (byName) return byName
  return fallback.find((f) => f.id === db.id) ?? null
}

function pickMergedScore(dbVal: unknown, staticVal: unknown): number {
  if (typeof dbVal === 'number' && Number.isFinite(dbVal)) return dbVal
  if (typeof staticVal === 'number' && Number.isFinite(staticVal)) return staticVal
  return 5
}

/**
 * Single-country API: same guarantees as `buildMergedCountriesList` — overlay static `data/countries.json`
 * on DB by **country name**, fill null visa columns from static, coalesce friction score.
 */
export function augmentCountryDetailPayload<T extends Record<string, unknown>>(
  country: T,
  fallback: LegacyCountryRecord[],
): T & { full_data: Record<string, unknown> } {
  const staticRow = findLegacyCountryMatch(fallback, {
    id: country.id as number,
    name: String(country.name ?? ''),
  })

  let full_data = parseCountryFullData(country.full_data)
  if (staticRow) {
    const staticFull =
      staticRow.full_data && typeof staticRow.full_data === 'object' && !Array.isArray(staticRow.full_data)
        ? (staticRow.full_data as Record<string, unknown>)
        : {}
    full_data = materializePublicFullDataForApi(mergeDisplayedFullData(staticFull, full_data))
  } else {
    full_data = materializePublicFullDataForApi(country.full_data)
  }

  const appt =
    typeof country.appointment_difficulty === 'string' && country.appointment_difficulty.trim() !== ''
      ? country.appointment_difficulty
      : staticRow?.appointment_difficulty

  const name = String(country.name ?? '')
  return {
    ...country,
    schengen_flag: isSchengenMember(name),
    tourist_visa_score: pickMergedScore(country.tourist_visa_score, staticRow?.tourist_visa_score),
    study_visa_score: pickMergedScore(country.study_visa_score, staticRow?.study_visa_score),
    work_visa_score: pickMergedScore(country.work_visa_score, staticRow?.work_visa_score),
    business_visa_score: pickMergedScore(country.business_visa_score, staticRow?.business_visa_score),
    appointment_difficulty: appt ?? 'Medium',
    full_data,
  }
}

/** Batch form of `augmentCountryDetailPayload` for `findMany` + `include: { country: true }`. */
export function augmentPrismaCountriesForPublicPayload<T extends Record<string, unknown>>(
  rows: readonly T[],
  fallback: LegacyCountryRecord[],
): Array<T & { full_data: Record<string, unknown> }> {
  return rows.map((row) => augmentCountryDetailPayload(row, fallback))
}

const approvedComments = {
  where: { status: 'APPROVED' as const },
  include: { user: { select: { name: true } } },
  orderBy: { createdAt: 'desc' as const },
} as const

function mergeFallbackRowWithDb(f: LegacyCountryRecord, db: {
  id: number
  name: string
  region: string
  schengen_flag: boolean
  tourist_visa_score: number | null
  study_visa_score: number | null
  work_visa_score: number | null
  business_visa_score: number | null
  appointment_difficulty: string | null
  full_data: string | null
  comments?: unknown[]
}): LegacyCountryRecord {
  const staticFull =
    f.full_data && typeof f.full_data === 'object' && !Array.isArray(f.full_data)
      ? (f.full_data as Record<string, unknown>)
      : {}
  const dbFull = parseCountryFullData(db.full_data)
  return {
    ...f,
    id: db.id,
    name: db.name,
    region: db.region,
    schengen_flag: isSchengenMember(db.name),
    tourist_visa_score:
      typeof db.tourist_visa_score === 'number' ? db.tourist_visa_score : f.tourist_visa_score,
    study_visa_score:
      typeof db.study_visa_score === 'number' ? db.study_visa_score : f.study_visa_score,
    work_visa_score: typeof db.work_visa_score === 'number' ? db.work_visa_score : f.work_visa_score,
    business_visa_score:
      typeof db.business_visa_score === 'number' ? db.business_visa_score : f.business_visa_score,
    appointment_difficulty: db.appointment_difficulty ?? f.appointment_difficulty,
    full_data: materializePublicFullDataForApi(mergeDisplayedFullData(staticFull, dbFull)),
    comments: (db.comments as LegacyCountryRecord['comments']) ?? [],
  }
}

export function prismaRowToLegacy(
  db: {
    id: number
    name: string
    region: string
    schengen_flag: boolean
    tourist_visa_score: number | null
    study_visa_score: number | null
    work_visa_score: number | null
    business_visa_score: number | null
    appointment_difficulty: string | null
    full_data: string | null
    comments?: unknown[]
  },
): LegacyCountryRecord {
  return {
    id: db.id,
    name: db.name,
    region: db.region,
    schengen_flag: isSchengenMember(db.name),
    tourist_visa_score: typeof db.tourist_visa_score === 'number' ? db.tourist_visa_score : 5,
    study_visa_score: typeof db.study_visa_score === 'number' ? db.study_visa_score : 5,
    work_visa_score: typeof db.work_visa_score === 'number' ? db.work_visa_score : 5,
    business_visa_score: typeof db.business_visa_score === 'number' ? db.business_visa_score : 5,
    appointment_difficulty: db.appointment_difficulty ?? 'Medium',
    full_data: materializePublicFullDataForApi(db.full_data),
    comments: (db.comments as LegacyCountryRecord['comments']) ?? [],
  }
}

async function fetchMergedCountriesListUncached(): Promise<LegacyCountryRecord[]> {
  let fallback: LegacyCountryRecord[] = []
  try {
    fallback = await loadFallbackCountries()
  } catch {
    fallback = []
  }

  try {
    const prismaRows = await prisma.country.findMany({
      include: { comments: approvedComments },
      orderBy: { id: 'asc' },
    })

    if (prismaRows.length === 0) {
      return dedupeSchengenMembersByCanonicalName(fallback)
    }

    const byName = new Map(prismaRows.map((r) => [countryNameMergeKey(r.name), r]))

    if (fallback.length === 0) {
      const onlyDb = prismaRows.map((db) => prismaRowToLegacy(db))
      const deduped = dedupeSchengenMembersByCanonicalName(onlyDb)
      warnIfSchengenCardinalityExceeded(deduped)
      return deduped
    }

    const mergedBase = fallback.map((f) => {
      const key = countryNameMergeKey(f.name)
      const db = byName.get(key)
      if (!db) return f
      byName.delete(key)
      return mergeFallbackRowWithDb(f, db)
    })

    const extras = Array.from(byName.values())
      .map((db) => prismaRowToLegacy(db))
      .sort((a, b) => a.id - b.id)

    const combined = [...mergedBase, ...extras]
    combined.sort((a, b) => a.id - b.id)
    const deduped = dedupeSchengenMembersByCanonicalName(combined)
    warnIfSchengenCardinalityExceeded(deduped)
    return deduped
  } catch (err) {
    console.warn(
      '[buildMergedCountriesList] Prisma failed, using static fallback:',
      err instanceof Error ? err.message : err,
    )
    return fallback.length > 0 ? dedupeSchengenMembersByCanonicalName(fallback) : []
  }
}

/** Invalidate via `revalidateTag` when merged list must drop `unstable_cache` immediately (e.g. admin country PATCH). */
export const MERGED_COUNTRIES_LIST_CACHE_TAG = 'babil-merged-countries-list'

const fetchMergedCountriesListCrossRequest = unstable_cache(
  fetchMergedCountriesListUncached,
  ['babil-merged-countries-list-v1'],
  { revalidate: 120, tags: [MERGED_COUNTRIES_LIST_CACHE_TAG] },
)

/**
 * Prefer DB rows keyed by country name when both exist (runner / seeded data).
 *
 * **D.56 / D.57:** `cache()` dedupes parallel reads during one Server Component render / request;
 * inner `unstable_cache` avoids re-running Prisma + merge for ~120s across Route Handlers and RSC (aligned with `GET /api/countries` edge TTL).
 */
export const getMergedCountriesListCached = cache(fetchMergedCountriesListCrossRequest)

/**
 * Same merged list as `getMergedCountriesListCached` — use this name when parity with older docs/routes is clearer.
 */
export async function buildMergedCountriesList(): Promise<LegacyCountryRecord[]> {
  return getMergedCountriesListCached()
}

export { approvedComments as countryApprovedCommentsConfig }
