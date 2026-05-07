/**
 * Collapse duplicate Schengen country rows after static+Prisma merge (e.g. Allemagne vs Germany).
 * Depends only on merge helpers + schengen identity — no Prisma import (safe for unit tests).
 */

import type { LegacyCountryRecord } from '@/lib/countries-fallback'
import { mergeDisplayedFullData } from '@/lib/merge-displayed-full-data'
import {
  isSchengenMember,
  listSchengenCanonicalEnglish,
  schengenCanonicalEnglishName,
} from '@/lib/schengen-members'

/** Prefer EN canonical row with highest id (Prisma); else highest id in group. */
function pickPrimaryRow(group: LegacyCountryRecord[], canonical: string): LegacyCountryRecord {
  const exactEn = group.filter((r) => r.name === canonical)
  if (exactEn.length > 0) {
    return [...exactEn].sort((a, b) => b.id - a.id)[0]
  }
  return [...group].sort((a, b) => b.id - a.id)[0]
}

function pickScoreFromGroupDesc(
  group: LegacyCountryRecord[],
  key: 'tourist_visa_score' | 'study_visa_score' | 'work_visa_score' | 'business_visa_score',
): number {
  const sorted = [...group].sort((a, b) => b.id - a.id)
  for (const row of sorted) {
    const v = row[key]
    if (typeof v === 'number' && Number.isFinite(v)) return v
  }
  return 5
}

function pickAppointment(group: LegacyCountryRecord[], primary: LegacyCountryRecord): string {
  const sorted = [...group].sort((a, b) => b.id - a.id)
  for (const row of sorted) {
    const a = row.appointment_difficulty
    if (typeof a === 'string' && a.trim() !== '') return a
  }
  return primary.appointment_difficulty
}

function pickRegion(group: LegacyCountryRecord[], primary: LegacyCountryRecord): string {
  const sorted = [...group].sort((a, b) => b.id - a.id)
  for (const row of sorted) {
    const r = row.region
    if (typeof r === 'string' && r.trim() !== '') return r
  }
  return primary.region
}

function asFullDataRecord(row: LegacyCountryRecord): Record<string, unknown> {
  const fd = row.full_data
  if (fd && typeof fd === 'object' && !Array.isArray(fd)) return fd as Record<string, unknown>
  return {}
}

function mergeGroupFullData(group: LegacyCountryRecord[]): Record<string, unknown> {
  const ordered = [...group].sort((a, b) => a.id - b.id)
  let acc = asFullDataRecord(ordered[0])
  for (let i = 1; i < ordered.length; i++) {
    acc = mergeDisplayedFullData(acc, asFullDataRecord(ordered[i]))
  }
  return acc
}

function pickComments(group: LegacyCountryRecord[], primary: LegacyCountryRecord): unknown[] {
  const sorted = [...group].sort((a, b) => b.id - a.id)
  for (const row of sorted) {
    if (Array.isArray(row.comments) && row.comments.length > 0) return row.comments
  }
  return Array.isArray(primary.comments) ? primary.comments : []
}

function mergeSchengenDuplicateGroup(group: LegacyCountryRecord[], canonical: string): LegacyCountryRecord {
  const primary = pickPrimaryRow(group, canonical)
  const full_data = mergeGroupFullData(group)
  return {
    ...primary,
    id: primary.id,
    name: primary.name,
    region: pickRegion(group, primary),
    schengen_flag: true,
    tourist_visa_score: pickScoreFromGroupDesc(group, 'tourist_visa_score'),
    study_visa_score: pickScoreFromGroupDesc(group, 'study_visa_score'),
    work_visa_score: pickScoreFromGroupDesc(group, 'work_visa_score'),
    business_visa_score: pickScoreFromGroupDesc(group, 'business_visa_score'),
    appointment_difficulty: pickAppointment(group, primary),
    full_data,
    comments: pickComments(group, primary),
  }
}

export function dedupeSchengenMembersByCanonicalName(rows: LegacyCountryRecord[]): LegacyCountryRecord[] {
  const nonSchengen: LegacyCountryRecord[] = []
  const buckets = new Map<string, LegacyCountryRecord[]>()

  for (const row of rows) {
    if (!isSchengenMember(row.name)) {
      nonSchengen.push(row)
      continue
    }
    const canon = schengenCanonicalEnglishName(row.name)
    if (!canon) {
      nonSchengen.push(row)
      continue
    }
    const arr = buckets.get(canon) ?? []
    arr.push(row)
    buckets.set(canon, arr)
  }

  const mergedSchengen: LegacyCountryRecord[] = []
  for (const canonical of Array.from(buckets.keys())) {
    const group = buckets.get(canonical)!
    if (group.length === 1) {
      mergedSchengen.push({ ...group[0], schengen_flag: true })
    } else {
      mergedSchengen.push(mergeSchengenDuplicateGroup(group, canonical))
    }
  }

  const out = [...nonSchengen, ...mergedSchengen]
  out.sort((a, b) => a.id - b.id)
  return out
}

export function warnIfSchengenCardinalityExceeded(rows: LegacyCountryRecord[]): void {
  if (process.env.NODE_ENV !== 'development') return
  const sch = rows.filter((r) => isSchengenMember(r.name))
  const max = listSchengenCanonicalEnglish().length
  if (sch.length > max) {
    console.warn(
      `[dedupeSchengen] Expected at most ${max} Schengen member rows, got ${sch.length}. Check data or aliases.`,
    )
  }
}
