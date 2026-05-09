/**
 * Derives Prisma 1–10 visa snapshots from full_data using the same mobility models + DB scalar merge as enrich.
 */

import { materializePublicFullDataForApi } from '@/lib/country-full-data-materialize'
import { computeBusinessMobility100 } from '@/lib/scoring/business-mobility'
import { computeStudyMobility100 } from '@/lib/scoring/study-mobility'
import { computeTourismMobility100 } from '@/lib/scoring/tourism-mobility'
import { computeWorkMobility100 } from '@/lib/scoring/work-mobility'
import { mergeModelWithDbScalar01to100 } from '@/lib/scoring/scalar-override'

export type PrismaVisaScalarInput = {
  tourist_visa_score?: unknown
  study_visa_score?: unknown
  work_visa_score?: unknown
  business_visa_score?: unknown
  street_food_business_access?: unknown
}

/** Same 0.05 steps on 1–10 as tourismMobilityToScalar01to10 / seed. */
export function mergedModel100ToStoredScalar01to10(merged100: number): number {
  const x = merged100 / 10
  return Math.min(10, Math.max(1, Math.round(x * 20) / 20))
}

export type MergedVisaScores100 = {
  tourism: number
  study: number
  work: number
  business: number
}

export function mergedVisaScores100WithDb(
  rawFullData: unknown,
  existing: PrismaVisaScalarInput,
): MergedVisaScores100 {
  const full = materializePublicFullDataForApi(rawFullData)
  const street =
    typeof existing.street_food_business_access === 'string'
      ? existing.street_food_business_access
      : null

  return {
    tourism: mergeModelWithDbScalar01to100(
      computeTourismMobility100({ full }),
      existing.tourist_visa_score,
      12,
    ),
    study: mergeModelWithDbScalar01to100(computeStudyMobility100({ full }), existing.study_visa_score, 12),
    work: mergeModelWithDbScalar01to100(computeWorkMobility100({ full }), existing.work_visa_score, 12),
    business: mergeModelWithDbScalar01to100(
      computeBusinessMobility100({ full, streetFoodBusinessAccess: street }),
      existing.business_visa_score,
      12,
    ),
  }
}

export function prismaVisaScalarsFromFullData(
  rawFullData: unknown,
  existing: PrismaVisaScalarInput,
): {
  tourist_visa_score: number
  study_visa_score: number
  work_visa_score: number
  business_visa_score: number
} {
  const m = mergedVisaScores100WithDb(rawFullData, existing)
  return {
    tourist_visa_score: mergedModel100ToStoredScalar01to10(m.tourism),
    study_visa_score: mergedModel100ToStoredScalar01to10(m.study),
    work_visa_score: mergedModel100ToStoredScalar01to10(m.work),
    business_visa_score: mergedModel100ToStoredScalar01to10(m.business),
  }
}
