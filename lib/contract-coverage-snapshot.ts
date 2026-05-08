/**
 * Snapshot of `buildCompletenessReport` for persistence under `full_data._data_backfill.contractCoverage`.
 */

import { buildCompletenessReport } from '@/lib/country-completeness'
import { isSchengenMember } from '@/lib/schengen-members'

export const DATA_BACKFILL_META_KEY = '_data_backfill' as const

export type ContractCoverageSnapshot = {
  score: number
  coveredFields: number
  totalFields: number
  criticalMissingCount: number
  criticalMissingSample: string[]
  domainScores: Record<string, number>
  computedAt: string
}

export function buildContractCoverageSnapshot(
  row: { name: string; region: string },
  full: Record<string, unknown>,
  scalars: {
    tourist_visa_score: number
    study_visa_score: number
    work_visa_score: number
    business_visa_score: number
  },
  appointmentDifficulty: string,
  computedAt: string,
): ContractCoverageSnapshot {
  const report = buildCompletenessReport({
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
  const domainScores: Record<string, number> = {}
  for (const [k, v] of Object.entries(report.domains)) {
    domainScores[k] = v.score
  }
  return {
    score: report.score,
    coveredFields: report.coveredFields,
    totalFields: report.totalFields,
    criticalMissingCount: report.criticalMissing.length,
    criticalMissingSample: report.criticalMissing.slice(0, 30),
    domainScores,
    computedAt,
  }
}