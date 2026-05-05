/**
 * Builds the public countries list/detail payload: merges Prisma (runner / seed truth)
 * with static `data/countries.json` as a coverage fallback when a DB row has no counterpart.
 */

import prisma from '@/lib/prisma'
import type { LegacyCountryRecord } from '@/lib/countries-fallback'
import { loadFallbackCountries } from '@/lib/countries-fallback'
import { parseCountryFullData } from '@/lib/country-full-data-json'

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

  return merged
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
    schengen_flag: db.schengen_flag,
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
    schengen_flag: db.schengen_flag,
    tourist_visa_score: typeof db.tourist_visa_score === 'number' ? db.tourist_visa_score : 5,
    study_visa_score: typeof db.study_visa_score === 'number' ? db.study_visa_score : 5,
    work_visa_score: typeof db.work_visa_score === 'number' ? db.work_visa_score : 5,
    business_visa_score: typeof db.business_visa_score === 'number' ? db.business_visa_score : 5,
    appointment_difficulty: db.appointment_difficulty ?? 'Medium',
    full_data: parseCountryFullData(db.full_data),
    comments: (db.comments as LegacyCountryRecord['comments']) ?? [],
  }
}

/**
 * Prefer DB rows keyed by country name when both exist (runner / seeded data).
 */
export async function buildMergedCountriesList(): Promise<LegacyCountryRecord[]> {
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

export { approvedComments as countryApprovedCommentsConfig }
