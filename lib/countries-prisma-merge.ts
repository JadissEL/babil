/**
 * Builds the public countries list/detail payload: merges Prisma (runner / seed truth)
 * with static `data/countries.json` as a coverage fallback when a DB row has no counterpart.
 *
 * **Consistency rule for public HTTP responses:** never return raw `parseCountryFullData(prismaRow)`
 * alone. Prefer `buildMergedCountriesList()`, `augmentCountryDetailPayload()`, or
 * `augmentPrismaCountriesForPublicPayload()` with `loadFallbackCountries()` so:
 * - Static JSON is matched by **country name** first (Prisma `id` often ≠ countries.json index).
 * - Null visa columns are backfilled from static.
 * - `full_data.friction_score` is coalesced from `friction_analysis` when missing.
 * Client-side reads should use `materializePublicFullData` from `@/lib/country-full-data-materialize`.
 */

import { cache } from 'react'

import prisma from '@/lib/prisma'
import type { LegacyCountryRecord } from '@/lib/countries-fallback'
import { loadFallbackCountries } from '@/lib/countries-fallback'
import { parseCountryFullData } from '@/lib/country-full-data-json'
import { materializePublicFullData, normalizeFullDataFriction } from '@/lib/country-full-data-materialize'
import { isSchengenMember } from '@/lib/schengen-members'

/** Subtrees the runner snapshot often omits; keep enriched JSON baseline when DB block is absent/empty */
const STATIC_PREFERRED_BLOCKS = [
  'education_mobility',
  'visa_system',
  'friction_analysis',
  'appointment_audit',
  'street_food',
  'driving_license',
  'morocco_insights',
  'phd_studies',
  'morocco_research_pack',
  'travel_reasons',
  'traveler_quotes',
] as const

/** Match DB row to static JSON even with minor spacing / casing drift. */
export function countryNameMergeKey(name: string): string {
  return name.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase()
}

function isWeakBlock(v: unknown): boolean {
  if (v == null) return true
  if (typeof v !== 'object' || Array.isArray(v)) return false
  return Object.keys(v as Record<string, unknown>).length === 0
}

function isPlainRecord(v: unknown): v is Record<string, unknown> {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return false
  const proto = Object.getPrototypeOf(v)
  return proto === Object.prototype || proto === null
}

/** Empty / missing leaves the static branch can replace. */
function isWeakLeaf(v: unknown): boolean {
  if (v === undefined) return true
  if (v === null) return true
  if (typeof v === 'string') return v.trim() === ''
  if (typeof v === 'number') return Number.isNaN(v)
  if (Array.isArray(v)) return v.length === 0
  return false
}

/**
 * Deep-merge static + DB branches: DB wins when it has real data; otherwise keep static.
 * Avoids `{ ...static, ...db }` wiping rich static subtrees when DB only sent a partial object.
 */
function mergeFullDataBranches(
  staticBranch: Record<string, unknown>,
  dbBranch: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  const keyOrderSeen: Record<string, true> = {}
  const keys: string[] = []
  for (const k of Object.keys(staticBranch)) {
    if (!keyOrderSeen[k]) {
      keyOrderSeen[k] = true
      keys.push(k)
    }
  }
  for (const k of Object.keys(dbBranch)) {
    if (!keyOrderSeen[k]) {
      keyOrderSeen[k] = true
      keys.push(k)
    }
  }

  for (const k of keys) {
    const sv = staticBranch[k]
    const dv = dbBranch[k]

    if (isPlainRecord(sv) && isPlainRecord(dv)) {
      const inner = mergeFullDataBranches(sv, dv)
      if (isWeakBlock(inner) && !isWeakBlock(sv)) {
        out[k] = sv
      } else {
        out[k] = inner
      }
      continue
    }

    if (Array.isArray(dv) && dv.length > 0) {
      out[k] = dv
      continue
    }
    if (Array.isArray(sv) && sv.length > 0) {
      out[k] = sv
      continue
    }
    if (Array.isArray(dv) || Array.isArray(sv)) {
      out[k] = Array.isArray(dv) ? dv : sv
      continue
    }

    if (!isWeakLeaf(dv)) {
      out[k] = dv
    } else if (!isWeakLeaf(sv)) {
      out[k] = sv
    } else {
      out[k] = dv !== undefined ? dv : sv
    }
  }

  return out
}

/**
 * Overlay DB `full_data` on static JSON; deep-merge objects; keep static rich blocks when DB is empty.
 */
export function mergeDisplayedFullData(
  staticFull: Record<string, unknown>,
  dbFull: Record<string, unknown>,
): Record<string, unknown> {
  const merged = mergeFullDataBranches(staticFull, dbFull)

  for (const key of STATIC_PREFERRED_BLOCKS) {
    if (isWeakBlock(merged[key]) && staticFull[key] != null && !isWeakBlock(staticFull[key])) {
      merged[key] = staticFull[key]
    }
  }

  return normalizeFullDataFriction(merged)
}

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
    full_data = mergeDisplayedFullData(staticFull, full_data)
  } else {
    full_data = materializePublicFullData(country.full_data)
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
    full_data: mergeDisplayedFullData(staticFull, dbFull),
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
    full_data: materializePublicFullData(db.full_data),
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
      return fallback
    }

    const byName = new Map(prismaRows.map((r) => [countryNameMergeKey(r.name), r]))

    if (fallback.length === 0) {
      return prismaRows.map((db) => prismaRowToLegacy(db))
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
    return combined
  } catch (err) {
    console.warn(
      '[buildMergedCountriesList] Prisma failed, using static fallback:',
      err instanceof Error ? err.message : err,
    )
    return fallback.length > 0 ? fallback : []
  }
}

/**
 * Prefer DB rows keyed by country name when both exist (runner / seeded data).
 * Use `getMergedCountriesListCached` in Server Components when the same render loads the list twice.
 */
export async function buildMergedCountriesList(): Promise<LegacyCountryRecord[]> {
  return fetchMergedCountriesListUncached()
}

export const getMergedCountriesListCached = cache(fetchMergedCountriesListUncached)

export { approvedComments as countryApprovedCommentsConfig }
