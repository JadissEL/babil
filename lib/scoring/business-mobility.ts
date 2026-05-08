/**
 * Centralized business & investment mobility score (0–100).
 *
 * Root issue fixed: Prisma `business_visa_score` was often seeded as a constant (~7.5) because
 * `visa_system.business` exists for almost every row. This module recomputes a weighted composite
 * from structured `full_data` fields (rights, setup, work openness, street food, friction, official
 * scores, acceptance, etc.). Prisma `business_visa_score` is a persisted snapshot; the live UI uses
 * `enrichCountryApiRecord`, which merges this model with DB scalars only when they diverge materially.
 *
 * Method: weighted linear composite of 0–100 sub-scores (interpretable, no fake RNG spread).
 * For stronger statistical models later, swap `computeBusinessMobility100` internals or add
 * cohort normalization in the compare layer without changing call sites.
 */

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v))

function parseMoroccoAcceptance01to100(raw: unknown): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return clamp(raw)
  const s = String(raw ?? '').replace(/%/g, '').trim()
  const n = Number.parseFloat(s)
  return Number.isFinite(n) ? clamp(n) : 52
}

/** Map categorical / free-text labels to 0–100 (higher = better business mobility outlook). */
export function businessRightsTo01to100(raw: unknown): number {
  const t = String(raw ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  if (!t) return 50
  if (/(^|[^a-z])none|aucun|blocked|interdit|no business/.test(t)) return 16
  if (/\btotal\b/.test(t) || /libre/.test(t) || /droit d.?investir/.test(t)) return 86
  if (/excellent|gold|premium|very high/.test(t)) return 90
  if (/high|eleve|elev|strong|favorable|good/.test(t)) return 74
  if (/\bpossible\b/.test(t)) return 54
  if (/medium|moyen|moderate/.test(t)) return 52
  if (/limited|restrict|bas|low|difficile/.test(t)) return 36
  return 50
}

export function businessSetupTo01to100(raw: unknown): number {
  const t = String(raw ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  if (!t) return 48
  if (/streamlined|simple|online|fast|e-visa|digital/.test(t)) return 78
  if (/complex|heavy|lengthy|difficult/.test(t)) return 34
  if (/variable|depends|selon/.test(t)) return 46
  return 52
}

export function businessConditionsClarity01to100(raw: unknown): number {
  const s = String(raw ?? '').trim()
  if (!s) return 48
  if (s.length > 220 && /selon|variable|vérifier|verify|depends/i.test(s)) return 42
  if (/clear|predictable|transparent|standard/i.test(s)) return 64
  return 50
}

export function workAvailabilityTo01to100(raw: unknown): number {
  const t = String(raw ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  if (!t) return 48
  if (/high|open|strong|available/.test(t)) return 76
  if (/moderate|medium|moyen/.test(t)) return 58
  if (/limited|low|restrict/.test(t)) return 38
  return 50
}

export function streetFoodOpportunityTo01to100(raw: unknown): number {
  const t = String(raw ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  if (!t) return 42
  if (/extreme/.test(t)) return 88
  if (/high|eleve|elev/.test(t)) return 78
  if (/medium|moyen/.test(t)) return 52
  if (/low|bas/.test(t)) return 30
  return 46
}

export function streetFoodBusinessAccessColumnTo01to100(raw: unknown): number {
  return streetFoodOpportunityTo01to100(raw)
}

export type BusinessMobilityInputs = {
  full: Record<string, unknown>
  /** Prisma `street_food_business_access` (often mirrors street_food.opportunity) */
  streetFoodBusinessAccess?: string | null
}

/**
 * Returns 0–100 composite business mobility score.
 */
export function computeBusinessMobility100(input: BusinessMobilityInputs): number {
  const { full } = input
  const visa = full.visa_system as Record<string, unknown> | undefined
  const business = visa?.business as Record<string, unknown> | undefined
  const work = visa?.work as Record<string, unknown> | undefined
  const street = full.street_food as Record<string, unknown> | undefined

  const official01 =
    typeof full.official_score === 'number' && Number.isFinite(full.official_score)
      ? clamp(full.official_score * 10)
      : 52
  const brutal01 =
    typeof full.brutal_reality_score === 'number' && Number.isFinite(full.brutal_reality_score)
      ? clamp(full.brutal_reality_score * 10)
      : official01
  const frictionRaw =
    typeof full.friction_score === 'number' && Number.isFinite(full.friction_score) ? full.friction_score : 50
  const frictionEase = clamp(100 - frictionRaw)

  const acceptance = parseMoroccoAcceptance01to100(full.acceptance_rate_morocco)
  const confidence =
    typeof full.confidence_score === 'number' && Number.isFinite(full.confidence_score)
      ? clamp(full.confidence_score)
      : 55

  const cbiBoost = full.cbi_program != null && full.cbi_program !== false ? 12 : 0

  const streetCol = streetFoodBusinessAccessColumnTo01to100(input.streetFoodBusinessAccess)
  const streetJson = streetFoodOpportunityTo01to100(street?.opportunity)
  const streetBlend = clamp((streetCol * 0.55 + streetJson * 0.45) + cbiBoost * 0.35)

  const workOpenness = workAvailabilityTo01to100(work?.availability)

  const wRights = 0.13
  const wSetup = 0.07
  const wCond = 0.05
  const wWork = 0.11
  const wStreet = 0.09
  const wFriction = 0.17
  const wOfficial = 0.2
  const wBrutal = 0.09
  const wAccept = 0.05
  const wConf = 0.04

  let model =
    wRights * businessRightsTo01to100(business?.rights) +
    wSetup * businessSetupTo01to100(business?.setup) +
    wCond * businessConditionsClarity01to100(business?.conditions) +
    wWork * workOpenness +
    wStreet * streetBlend +
    wFriction * frictionEase +
    wOfficial * official01 +
    wBrutal * brutal01 +
    wAccept * acceptance +
    wConf * confidence

  model = clamp(model + Math.min(10, cbiBoost))

  return clamp(model)
}

/** Persisted Prisma field: 1–10 scale (aligned with other visa_score columns). */
export function businessMobilityToScalar01to10(input: BusinessMobilityInputs): number {
  const x = computeBusinessMobility100(input) / 10
  return Math.min(10, Math.max(1, Math.round(x * 20) / 20))
}
