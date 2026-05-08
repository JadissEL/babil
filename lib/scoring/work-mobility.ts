/**
 * Work mobility composite 0–100 (reduces “everyone ~70” when `visa_system.work` exists for all rows).
 */

import { businessRightsTo01to100, workAvailabilityTo01to100 } from '@/lib/scoring/business-mobility'

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v))

export type WorkMobilityInputs = {
  full: Record<string, unknown>
}

export function computeWorkMobility100(input: WorkMobilityInputs): number {
  const visa = input.full.visa_system as Record<string, unknown> | undefined
  const work = visa?.work as Record<string, unknown> | undefined

  const official01 =
    typeof input.full.official_score === 'number' && Number.isFinite(input.full.official_score)
      ? clamp(input.full.official_score * 10)
      : 52
  const frictionRaw =
    typeof input.full.friction_score === 'number' && Number.isFinite(input.full.friction_score)
      ? input.full.friction_score
      : 50
  const frictionEase = clamp(100 - frictionRaw)

  const avail = workAvailabilityTo01to100(work?.availability)
  const rights = businessRightsTo01to100(work?.rights)

  return clamp(avail * 0.42 + rights * 0.28 + official01 * 0.18 + frictionEase * 0.12)
}

export function workMobilityToScalar01to10(input: WorkMobilityInputs): number {
  const x = computeWorkMobility100(input) / 10
  return Math.min(10, Math.max(1, Math.round(x * 20) / 20))
}
