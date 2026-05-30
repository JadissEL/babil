import { describe, expect, it } from 'vitest'

import {
  canShowClaimOnPublicUI,
  normalizeVerificationStatus,
  publicDisclaimerForStatus,
} from '@/lib/intelligence-validation/verification-status'

describe('verification-status', () => {
  it('maps legacy pending/disputed', () => {
    expect(normalizeVerificationStatus('pending')).toBe('needs_review')
    expect(normalizeVerificationStatus('disputed')).toBe('contradictory')
  })

  it('allows verified and partially_verified on public UI', () => {
    expect(canShowClaimOnPublicUI('verified')).toBe(true)
    expect(canShowClaimOnPublicUI('partially_verified')).toBe(true)
    expect(canShowClaimOnPublicUI('needs_review')).toBe(false)
  })

  it('returns disclaimer for partial/estimated', () => {
    expect(publicDisclaimerForStatus('partially_verified')).toContain('partiellement')
  })
})
