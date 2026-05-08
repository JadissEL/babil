/**
 * Snapshot of `buildCompletenessReport` for persistence under `full_data._data_backfill.contractCoverage`.
 */

import type { CompletenessReport } from '@/lib/country-completeness'
import { buildCompletenessReportForCountryRow } from '@/lib/country-completeness-row'

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

export function buildContractCoverageSnapshotFromReport(
  report: CompletenessReport,
  computedAt: string,
): ContractCoverageSnapshot {
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
  const report = buildCompletenessReportForCountryRow(row, full, scalars, appointmentDifficulty)
  return buildContractCoverageSnapshotFromReport(report, computedAt)
}