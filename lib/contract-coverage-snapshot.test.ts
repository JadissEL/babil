import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildContractCoverageSnapshot } from './contract-coverage-snapshot'

describe('buildContractCoverageSnapshot', () => {
  it('returns score and domainScores for a minimal payload', () => {
    const full = {
      official_score: 40,
      friction_score: 30,
      acceptance_rate_morocco: '50%',
      driving_license: {
        status: 'X',
        duration: '',
        conversion_possible: false,
        conversion_details: '',
      },
    } as Record<string, unknown>
    const snap = buildContractCoverageSnapshot(
      { name: 'Testland', region: 'Europe' },
      full,
      { tourist_visa_score: 5, study_visa_score: 5, work_visa_score: 5, business_visa_score: 5 },
      'Medium',
      '2026-05-08T00:00:00.000Z',
    )
    assert.equal(typeof snap.score, 'number')
    assert.ok(snap.score >= 0 && snap.score <= 100)
    assert.equal(typeof snap.criticalMissingCount, 'number')
    assert.ok(typeof snap.domainScores === 'object' && snap.domainScores !== null)
  })
})