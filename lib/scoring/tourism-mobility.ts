/**
 * Tourism / visitor visa mobility 0–100 from full_data (reduces over-reliance on a single official_score column).
 */

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v))

function parseMoroccoAcceptance01to100(raw: unknown): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return clamp(raw)
  const s = String(raw ?? '').replace(/%/g, '').trim()
  const n = Number.parseFloat(s)
  return Number.isFinite(n) ? clamp(n) : 52
}

/** Higher = easier / more favorable tourism visa pathway */
export function tourismDifficultyFriendliness01to100(raw: unknown): number {
  const t = String(raw ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  if (!t) return 50
  if (/low|facile|easy|simple|light|waiv|exempt/.test(t)) return 82
  if (/medium|moyen|moderate|standard/.test(t)) return 54
  if (/high|difficile|strict|complex|heavy/.test(t)) return 32
  if (/extreme|very strict/.test(t)) return 18
  return 48
}

export type TourismMobilityInputs = {
  full: Record<string, unknown>
}

export function computeTourismMobility100(input: TourismMobilityInputs): number {
  const { full } = input
  const visa = full.visa_system as Record<string, unknown> | undefined
  const tourism = visa?.tourism as Record<string, unknown> | undefined

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

  const tourFriend = tourismDifficultyFriendliness01to100(tourism?.difficulty)

  const wTour = 0.2
  const wOfficial = 0.26
  const wFriction = 0.2
  const wBrutal = 0.12
  const wAccept = 0.12
  const wConf = 0.1

  return clamp(
    wTour * tourFriend +
      wOfficial * official01 +
      wFriction * frictionEase +
      wBrutal * brutal01 +
      wAccept * acceptance +
      wConf * confidence,
  )
}

export function tourismMobilityToScalar01to10(input: TourismMobilityInputs): number {
  const x = computeTourismMobility100(input) / 10
  return Math.min(10, Math.max(1, Math.round(x * 20) / 20))
}
