/**
 * Fill information models from verified observations only (no hallucination).
 */

import type { ObservationVerificationStatus } from '@prisma/client'

import { canShowClaimOnPublicUI } from '@/lib/intelligence-validation/verification-status'
import {
  VisaModelSchema,
  ScholarshipModelSchema,
  JobOpportunityModelSchema,
  BusinessSetupModelSchema,
  type VisaModel,
  type ScholarshipModel,
  type JobOpportunityModel,
  type BusinessSetupModel,
} from '@/lib/information-models/schemas'

type ObsRow = {
  fieldPath: string
  valueJson: string
  verificationStatus: ObservationVerificationStatus
}

function parseValue(valueJson: string): string | undefined {
  try {
    const j = JSON.parse(valueJson) as { value?: unknown; summary?: string }
    if (typeof j.summary === 'string') return j.summary
    if (j.value != null) return String(j.value)
  } catch {
    /* ignore */
  }
  return undefined
}

function verifiedObs(observations: ObsRow[]): ObsRow[] {
  return observations.filter((o) => canShowClaimOnPublicUI(o.verificationStatus))
}

export function fillVisaModel(
  countryName: string,
  observations: ObsRow[],
): VisaModel | null {
  const obs = verifiedObs(observations)
  const paths = obs.map((o) => o.fieldPath)
  if (obs.length === 0) return null

  const processing = obs.find((o) => o.fieldPath.includes('processing'))?.valueJson
  const difficulty = obs.find((o) => o.fieldPath.includes('difficulty'))?.valueJson

  return VisaModelSchema.parse({
    destinationCountry: countryName,
    processingTime: processing ? parseValue(processing) : undefined,
    difficulty: difficulty ? parseValue(difficulty) : undefined,
    evidenceFieldPaths: paths,
  })
}

export function fillScholarshipModel(
  countryName: string,
  observations: ObsRow[],
): ScholarshipModel | null {
  const obs = verifiedObs(observations).filter((o) => o.fieldPath.includes('education'))
  if (obs.length === 0) return null
  return ScholarshipModelSchema.parse({
    destinationCountry: countryName,
    evidenceFieldPaths: obs.map((o) => o.fieldPath),
  })
}

export function fillJobModel(
  countryName: string,
  observations: ObsRow[],
): JobOpportunityModel | null {
  const obs = verifiedObs(observations).filter(
    (o) => o.fieldPath.includes('work') || o.fieldPath.includes('employment'),
  )
  if (obs.length === 0) return null
  return JobOpportunityModelSchema.parse({
    destinationCountry: countryName,
    evidenceFieldPaths: obs.map((o) => o.fieldPath),
  })
}

export function fillBusinessModel(
  countryName: string,
  observations: ObsRow[],
): BusinessSetupModel | null {
  const obs = verifiedObs(observations).filter((o) => o.fieldPath.includes('business'))
  if (obs.length === 0) return null
  return BusinessSetupModelSchema.parse({
    destinationCountry: countryName,
    evidenceFieldPaths: obs.map((o) => o.fieldPath),
  })
}
