/**
 * Build `CompletenessReport` for a DB country row + materialized `full_data` blob.
 * Shared by contract coverage snapshots and `_agent` provenance merges.
 */

import { buildCompletenessReport, type CompletenessReport } from '@/lib/country-completeness'
import { isSchengenMember } from '@/lib/schengen-members'

export type CountryRowScalars = {
  tourist_visa_score: number
  study_visa_score: number
  work_visa_score: number
  business_visa_score: number
}

export function buildCompletenessReportForCountryRow(
  row: { name: string; region: string },
  full: Record<string, unknown>,
  scalars: CountryRowScalars,
  appointmentDifficulty: string,
): CompletenessReport {
  return buildCompletenessReport({
    name: row.name,
    region: row.region,
    schengen_flag: isSchengenMember(row.name),
    tourist_visa_score: scalars.tourist_visa_score,
    study_visa_score: scalars.study_visa_score,
    work_visa_score: scalars.work_visa_score,
    business_visa_score: scalars.business_visa_score,
    appointment_difficulty: appointmentDifficulty,
    full_data: full,
  })
}
