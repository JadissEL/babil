/**
 * Normalized 0–100 signals derived from enriched country rows.
 * Used by compare objectives (config-driven weights) — keep extraction logic here only.
 */

import type { EnrichedCountryApi } from '@/lib/enrich-country-api'
import { hasCountryPhdStoredData } from '@/lib/country-phd-studies'

export type CompareSignalId =
  | 'tourism'
  | 'study'
  | 'work'
  | 'business'
  | 'friction'
  | 'education'
  | 'phdPresence'
  | 'shortCourses'
  | 'technicalTraining'
  | 'languageStudy'
  | 'streetFood'

function accessScore(access: unknown): number {
  const s = String(access ?? '').toLowerCase()
  if (!s.trim()) return 45
  if (/(eleve|élev|high|facile|strong)/i.test(s)) return 88
  if (/(moyen|medium|modere|modéré)/i.test(s)) return 58
  if (/(bas|low|difficile|limite)/i.test(s)) return 32
  return 50
}

function streetFoodScore(full: Record<string, unknown>): number {
  const sf = full.street_food as Record<string, unknown> | undefined
  if (!sf || typeof sf !== 'object') return 40
  const op = String(sf.opportunity ?? '').toLowerCase()
  if (op.includes('high') || op.includes('élev') || op.includes('eleve')) return 85
  if (op.includes('medium') || op.includes('moyen')) return 55
  if (op.includes('low') || op.includes('bas')) return 30
  return 48
}

/**
 * Pull 0–100 signals for objective-weighted scoring.
 */
export function extractCompareSignals(c: EnrichedCountryApi): Record<CompareSignalId, number> {
  const full = c._full ?? {}
  const edu = full.education_mobility as Record<string, unknown> | undefined

  const lang = edu?.language_study as Record<string, unknown> | undefined
  const tech = edu?.technical_training as Record<string, unknown> | undefined
  const short = edu?.short_courses as Record<string, unknown> | undefined

  const phdOk = hasCountryPhdStoredData(full)

  return {
    tourism: c._visa.tourism,
    study: c._visa.study,
    work: c._visa.work,
    business: c._visa.business,
    friction: c._friction,
    education: c._education,
    phdPresence: phdOk ? 100 : 15,
    shortCourses: short && typeof short === 'object' ? accessScore(short.access) : 25,
    technicalTraining: tech && typeof tech === 'object' ? accessScore(tech.access) : 25,
    languageStudy: lang && typeof lang === 'object' ? accessScore(lang.access) : 25,
    streetFood: streetFoodScore(full),
  }
}
