/**
 * Extended verification statuses + public display rules.
 */

import type { ObservationVerificationStatus } from '@prisma/client'

/** Statuses safe for public UI (with optional disclaimer). */
const PUBLIC_STATUSES: ObservationVerificationStatus[] = [
  'verified',
  'partially_verified',
  'estimated',
]

export const PUBLIC_VERIFICATION_STATUSES: ReadonlySet<ObservationVerificationStatus> =
  new Set(PUBLIC_STATUSES)

export function normalizeVerificationStatus(
  status: ObservationVerificationStatus,
): ObservationVerificationStatus {
  if (status === 'pending') return 'needs_review'
  if (status === 'disputed') return 'contradictory'
  return status
}

export function canShowClaimOnPublicUI(status: ObservationVerificationStatus): boolean {
  const n = normalizeVerificationStatus(status)
  return PUBLIC_VERIFICATION_STATUSES.has(n)
}

export function publicDisclaimerForStatus(status: ObservationVerificationStatus): string | null {
  const n = normalizeVerificationStatus(status)
  if (n === 'partially_verified') return 'Information partiellement vérifiée — confirmation en cours.'
  if (n === 'estimated') return 'Estimation basée sur sources indirectes.'
  return null
}

export type VerificationPipelineStep =
  | 'extract'
  | 'corroboration'
  | 'contradiction'
  | 'freshness'
  | 'authority'
  | 'confidence'
  | 'evidence'
  | 'references'
  | 'status'

export type VerificationStepOutcome = {
  step: VerificationPipelineStep
  passed: boolean
  detail?: string
}
