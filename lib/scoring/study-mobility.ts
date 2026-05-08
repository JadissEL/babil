/**
 * Study / long-stay education mobility 0–100 from education_mobility + friction + official signals.
 * Replaces binary seed on technical_training.access_bac only.
 */

import { hasCountryPhdStoredData } from '@/lib/country-phd-studies'

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v))

function parseMoroccoAcceptance01to100(raw: unknown): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return clamp(raw)
  const s = String(raw ?? '').replace(/%/g, '').trim()
  const n = Number.parseFloat(s)
  return Number.isFinite(n) ? clamp(n) : 52
}

/** Aligné sur la logique compare-signals `access` (0–100). */
export function educationAccessTo01to100(access: unknown): number {
  const s = String(access ?? '').toLowerCase()
  if (!s.trim()) return 45
  if (/(eleve|élev|high|facile|strong)/i.test(s)) return 88
  if (/(moyen|medium|modere|modéré)/i.test(s)) return 58
  if (/(bas|low|difficile|limite)/i.test(s)) return 32
  return 50
}

export type StudyMobilityInputs = {
  full: Record<string, unknown>
}

export function computeStudyMobility100(input: StudyMobilityInputs): number {
  const { full } = input
  const edu = full.education_mobility as Record<string, unknown> | undefined
  const lang = edu?.language_study as Record<string, unknown> | undefined
  const tech = edu?.technical_training as Record<string, unknown> | undefined
  const short = edu?.short_courses as Record<string, unknown> | undefined

  const langS = educationAccessTo01to100(lang?.access)
  const techS = educationAccessTo01to100(tech?.access)
  const shortS = educationAccessTo01to100(short?.access)
  const modulesCore = (langS + techS + shortS) / 3

  let bacBonus = 0
  const bacRaw =
    tech && typeof tech === 'object'
      ? String((tech as Record<string, unknown>).access_bac ?? '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
      : ''
  if (/non requis|sans bac|not required|no bac/.test(bacRaw)) bacBonus = 5
  else if (/parfois|sometimes/.test(bacRaw)) bacBonus = 2
  else if (/obligatoire|bac\s*requis|requis pour/.test(bacRaw)) bacBonus = -2

  const modules = clamp(modulesCore + bacBonus)

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

  const phdBoost = hasCountryPhdStoredData(full) ? 10 : 0

  const wMod = 0.38
  const wOfficial = 0.18
  const wFriction = 0.18
  const wBrutal = 0.1
  const wAccept = 0.08
  const wConf = 0.08

  return clamp(
    wMod * modules +
      wOfficial * official01 +
      wFriction * frictionEase +
      wBrutal * brutal01 +
      wAccept * acceptance +
      wConf * confidence +
      phdBoost,
  )
}

export function studyMobilityToScalar01to10(input: StudyMobilityInputs): number {
  const x = computeStudyMobility100(input) / 10
  return Math.min(10, Math.max(1, Math.round(x * 20) / 20))
}
