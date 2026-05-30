/**
 * 10-step verification pipeline (orchestration over existing consensus + reliability).
 */

import type { ObservationVerificationStatus } from '@prisma/client'

import type { IntelligenceSourceTier } from '@prisma/client'

import { buildFieldConsensus, type RawObservationRow } from '@/lib/intelligence-validation/consensus'
import type {
  VerificationPipelineStep,
  VerificationStepOutcome,
} from '@/lib/intelligence-validation/verification-status'
import { normalizeVerificationStatus } from '@/lib/intelligence-validation/verification-status'

export type ObservationForVerification = {
  id: string
  fieldPath: string
  valueNumeric: number | null
  confidence: number
  observedAt: Date
  verificationStatus: ObservationVerificationStatus
  sourceUrl: string | null
  rawExcerpt: string | null
  source: { slug: string; tier: string; trustScore?: number | null }
}

const STEPS: VerificationPipelineStep[] = [
  'extract',
  'corroboration',
  'contradiction',
  'freshness',
  'authority',
  'confidence',
  'evidence',
  'references',
  'status',
]

export function runVerificationPipeline(
  observations: ObservationForVerification[],
): { steps: VerificationStepOutcome[]; finalStatus: ObservationVerificationStatus } {
  const steps: VerificationStepOutcome[] = []

  steps.push({
    step: 'extract',
    passed: observations.length > 0,
    detail: observations.length ? `${observations.length} observation(s)` : 'no observations',
  })

  const countryId = 0
  const fieldPath = observations[0]?.fieldPath ?? 'unknown'
  const rows: RawObservationRow[] = observations.map((o) => ({
    id: o.id,
    countryId,
    fieldPath: o.fieldPath,
    valueJson: '{}',
    valueNumeric: o.valueNumeric,
    confidence: o.confidence,
    observedAt: o.observedAt,
    tier: o.source.tier as IntelligenceSourceTier,
    verificationStatus: o.verificationStatus,
  }))
  const consensus = buildFieldConsensus(countryId, fieldPath, rows)

  steps.push({
    step: 'corroboration',
    passed: observations.length >= 2 || observations.some((o) => o.source.tier === 'TIER_A_OFFICIAL'),
    detail: `sources=${observations.length}`,
  })

  steps.push({
    step: 'contradiction',
    passed: !consensus.disputed,
    detail: consensus.disputed ? 'numeric disagreement' : 'ok',
  })

  const newest = observations.reduce((a, b) => (a.observedAt > b.observedAt ? a : b))
  const ageDays = (Date.now() - newest.observedAt.getTime()) / 86_400_000
  steps.push({
    step: 'freshness',
    passed: ageDays < 365 * 2,
    detail: `age_days=${Math.floor(ageDays)}`,
  })

  function tierScore(tier: string): number {
    if (tier === 'TIER_A_OFFICIAL') return 1
    if (tier === 'TIER_B_MULTILATERAL') return 0.82
    return 0.55
  }
  const maxRel = Math.max(...observations.map((o) => tierScore(o.source.tier)))
  steps.push({
    step: 'authority',
    passed: maxRel >= 0.6,
    detail: `max_reliability=${maxRel.toFixed(2)}`,
  })

  steps.push({
    step: 'confidence',
    passed: consensus.confidence >= 0.55,
    detail: `confidence=${consensus.confidence.toFixed(2)}`,
  })

  const hasEvidence = observations.some((o) => o.rawExcerpt || o.sourceUrl)
  steps.push({
    step: 'evidence',
    passed: hasEvidence,
    detail: hasEvidence ? 'excerpt or url present' : 'missing evidence',
  })

  steps.push({
    step: 'references',
    passed: observations.some((o) => o.sourceUrl),
    detail: observations.filter((o) => o.sourceUrl).length + ' urls',
  })

  let finalStatus: ObservationVerificationStatus = normalizeVerificationStatus(consensus.verificationStatus)
  if (consensus.disputed) finalStatus = 'contradictory'
  else if (ageDays > 365 * 2) finalStatus = 'outdated'
  else if (consensus.confidence >= 0.8 && !consensus.disputed) finalStatus = 'verified'
  else if (consensus.confidence >= 0.55) finalStatus = 'partially_verified'
  else finalStatus = 'needs_review'

  steps.push({
    step: 'status',
    passed: finalStatus === 'verified' || finalStatus === 'partially_verified',
    detail: finalStatus,
  })

  return { steps, finalStatus }
}

export { STEPS as VERIFICATION_PIPELINE_STEPS }
