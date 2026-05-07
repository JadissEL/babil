/**
 * Deep-merge static + DB `full_data` branches for public country payloads.
 * Shared by `countries-prisma-merge` and Schengen duplicate collapsing.
 */

import { normalizeFullDataFriction } from '@/lib/country-full-data-materialize'

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

function isWeakLeaf(v: unknown): boolean {
  if (v === undefined) return true
  if (v === null) return true
  if (typeof v === 'string') return v.trim() === ''
  if (typeof v === 'number') return Number.isNaN(v)
  if (Array.isArray(v)) return v.length === 0
  return false
}

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
