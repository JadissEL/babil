/**
 * Normalise un pays tel que renvoyé par `GET /api/countries` (full_data déjà objet).
 * Réutilisé par l’Explorer et le comparateur pour garder les mêmes scores.
 */

import { hasCountryPhdStoredData } from '@/lib/country-phd-studies'

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v))

export type BudgetBand = 'low' | 'medium' | 'high'

export type EnrichedCountryApi = Record<string, unknown> & {
  id: number
  name: string
  region: string
  schengen_flag?: boolean
  appointment_difficulty?: string | null
  tourist_visa_score?: number | null
  study_visa_score?: number | null
  work_visa_score?: number | null
  business_visa_score?: number | null
  full_data?: Record<string, unknown>
  _full: Record<string, unknown>
  _visa: { tourism: number; study: number; work: number; business: number }
  _friction: number
  _education: number
  _finalScore: number
  _budgetLevel: BudgetBand
  _difficultyLabel: string
  _highlightPlace: string | null
  _highlightImageUrl: string | null
}

function normalizeHighlightFromFullData(full: Record<string, unknown>) {
  const reasons = Array.isArray(full.travel_reasons) ? full.travel_reasons : []
  const firstReason =
    reasons.length > 0 && reasons[0] && typeof reasons[0] === 'object'
      ? (reasons[0] as Record<string, unknown>)
      : null

  const placeCandidate =
    (typeof firstReason?.title === 'string' && firstReason.title.trim()) ||
    (typeof firstReason?.imageAlt === 'string' && firstReason.imageAlt.trim()) ||
    null

  const imageCandidate =
    (typeof firstReason?.imageUrl === 'string' && firstReason.imageUrl.trim()) || null

  return {
    place: placeCandidate,
    imageUrl: imageCandidate,
  }
}

export function enrichCountryApiRecord(c: Record<string, unknown>): EnrichedCountryApi {
  const full =
    c.full_data && typeof c.full_data === 'object' && !Array.isArray(c.full_data)
      ? (c.full_data as Record<string, unknown>)
      : {}

  const official = typeof full.official_score === 'number' ? full.official_score : 5
  const visa = {
    tourism: clamp(Math.round(((c.tourist_visa_score as number) || official || 5) * 10)),
    study: clamp(Math.round(((c.study_visa_score as number) || 5) * 10)),
    work: clamp(Math.round(((c.work_visa_score as number) || 5) * 10)),
    business: clamp(Math.round(((c.business_visa_score as number) || 5) * 10)),
  }

  const frictionScore = typeof full.friction_score === 'number' ? full.friction_score : 50
  const friction = clamp(100 - frictionScore)

  const edu = full.education_mobility as Record<string, unknown> | undefined
  const educationMobilityBuckets = clamp(
    Math.round(
      ((edu?.language_study ? 1 : 0) +
        (edu?.technical_training ? 1 : 0) +
        (edu?.short_courses ? 1 : 0)) *
        33.33,
    ),
  )
  const phdBonus = hasCountryPhdStoredData(full) ? 10 : 0
  const education = clamp(educationMobilityBuckets + phdBonus)

  const avgVisa = Math.round((visa.tourism + visa.study + visa.work + visa.business) / 4)
  const finalScore = clamp(Math.round(avgVisa * 0.5 + friction * 0.25 + education * 0.25))
  const budgetLevel: BudgetBand = finalScore >= 72 ? 'high' : finalScore >= 52 ? 'medium' : 'low'
  const highlight = normalizeHighlightFromFullData(full)

  return {
    ...c,
    id: c.id as number,
    name: String(c.name),
    region: String(c.region),
    _full: full,
    _visa: visa,
    _friction: friction,
    _education: education,
    _finalScore: finalScore,
    _budgetLevel: budgetLevel,
    _difficultyLabel: String(c.appointment_difficulty || 'Medium'),
    _highlightPlace: highlight.place,
    _highlightImageUrl: highlight.imageUrl,
  } as EnrichedCountryApi
}
