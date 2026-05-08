/**
 * Merge intelligence-contract provenance fields into `full_data._agent` from a live
 * completeness report (backfill / seed), without clobbering a real agent run timestamp.
 */

import { buildCoverageManifest, type CompletenessReport } from '@/lib/country-completeness'

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

/**
 * Writes `coverageManifest`, `completeness`, and `updatedAt` (only when missing) under `_agent`.
 * Preserves existing `_agent.updatedAt` when already set (e.g. enrichment runner).
 */
export function mergeAgentProvenanceIntoFullData(
  full: Record<string, unknown>,
  report: CompletenessReport,
  appliedAt: string,
): Record<string, unknown> {
  const prev = full._agent
  const prevAgent = isRecord(prev) ? { ...prev } : {}
  const keepUpdatedAt =
    typeof prevAgent.updatedAt === 'string' && prevAgent.updatedAt.trim().length > 0

  return {
    ...full,
    _agent: {
      ...prevAgent,
      updatedAt: keepUpdatedAt ? prevAgent.updatedAt : appliedAt,
      completeness: {
        score: report.score,
        coveredFields: report.coveredFields,
        totalFields: report.totalFields,
        refreshedAt: appliedAt,
      },
      coverageManifest: buildCoverageManifest(report),
    },
  }
}
