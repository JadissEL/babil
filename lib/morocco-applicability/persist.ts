/**
 * Persist Morocco applicability decisions as bronze observations (morocco_applicability.*).
 */

import { upsertCountryObservation } from '@/lib/intelligence-pipeline/observation-writer'
import type { MoroccoApplicabilityResult } from '@/lib/morocco-applicability/types'

export async function persistMoroccoApplicabilityObservation(args: {
  countryId: number
  sourceId: string
  runId?: string | null
  result: MoroccoApplicabilityResult
}): Promise<void> {
  const { result } = args
  await upsertCountryObservation({
    countryId: args.countryId,
    sourceId: args.sourceId,
    runId: args.runId,
    fieldPath: result.fieldPath,
    valueJson: JSON.stringify({
      value: result.decision,
      summary: result.rationale,
      case: result.case,
      scope: result.scope,
      evidenceObservationIds: result.evidenceObservationIds,
    }),
    confidence: result.decision === 'review' ? 0.45 : 0.72,
    verificationStatus: result.decision === 'review' ? 'needs_review' : 'partially_verified',
    sourceUrl: null,
    rawExcerpt: result.rationale,
    dedupeKey: `ma_applicability:${args.countryId}:${result.fieldPath}`,
  })
}
