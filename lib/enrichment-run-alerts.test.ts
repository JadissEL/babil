import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { computeEnrichmentRunAlertLevel, isStuckEnrichmentStatus } from './enrichment-run-alerts'

describe('enrichment-run-alerts (C.42)', () => {
  it('isStuckEnrichmentStatus recognizes PENDING and RUNNING', () => {
    assert.equal(isStuckEnrichmentStatus('PENDING'), true)
    assert.equal(isStuckEnrichmentStatus('RUNNING'), true)
    assert.equal(isStuckEnrichmentStatus('SUCCEEDED'), false)
  })

  it('computeEnrichmentRunAlertLevel returns critical when stale runs exist', () => {
    assert.equal(
      computeEnrichmentRunAlertLevel({
        staleRunCount: 1,
        recentFailedOrPartialCount: 0,
        lastRunStatus: 'SUCCEEDED',
      }),
      'critical',
    )
  })

  it('computeEnrichmentRunAlertLevel returns warning on recent failures', () => {
    assert.equal(
      computeEnrichmentRunAlertLevel({
        staleRunCount: 0,
        recentFailedOrPartialCount: 2,
        lastRunStatus: 'SUCCEEDED',
      }),
      'warning',
    )
  })

  it('computeEnrichmentRunAlertLevel returns warning when last run is FAILED or PARTIAL', () => {
    assert.equal(
      computeEnrichmentRunAlertLevel({
        staleRunCount: 0,
        recentFailedOrPartialCount: 0,
        lastRunStatus: 'FAILED',
      }),
      'warning',
    )
    assert.equal(
      computeEnrichmentRunAlertLevel({
        staleRunCount: 0,
        recentFailedOrPartialCount: 0,
        lastRunStatus: 'PARTIAL',
      }),
      'warning',
    )
  })

  it('computeEnrichmentRunAlertLevel returns ok when clean', () => {
    assert.equal(
      computeEnrichmentRunAlertLevel({
        staleRunCount: 0,
        recentFailedOrPartialCount: 0,
        lastRunStatus: 'SUCCEEDED',
      }),
      'ok',
    )
  })
})
