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
] as const

function isWeakBlock(v: unknown): boolean {
  if (v == null) return true
  if (typeof v !== 'object' || Array.isArray(v)) return false
  return Object.keys(v as Record<string, unknown>).length === 0
}

/**
 * Overlay DB `full_data` on static JSON; keep static rich blocks when the DB version is empty.
 */
export function mergeDisplayedFullData(
  staticFull: Record<string, unknown>,
  dbFull: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...staticFull, ...dbFull }
  for (const key of STATIC_PREFERRED_BLOCKS) {
    if (isWeakBlock(dbFull[key]) && staticFull[key] != null && !isWeakBlock(staticFull[key])) {
      out[key] = staticFull[key]
    }
  }
  return out
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

    const byName = new Map(prismaRows.map((r) => [r.name, r]))

    if (fallback.length === 0) {
      return prismaRows.map((db) => prismaRowToLegacy(db))
    }

    const mergedBase = fallback.map((f) => {
      const db = byName.get(f.name)
      if (!db) return f
      byName.delete(f.name)
      return mergeFallbackRowWithDb(f, db)
    })

    const extras = Array.from(byName.values())
      .map((db) => prismaRowToLegacy(db))
      .sort((a, b) => a.id - b.id)

    const combined = [...mergedBase, ...extras]
    combined.sort((a, b) => a.id - b.id)
    return combined
  } catch {
    return fallback.length > 0 ? fallback : []
  }
}

export { approvedComments as countryApprovedCommentsConfig }
