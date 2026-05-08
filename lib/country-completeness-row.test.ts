import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildCompletenessReportForCountryRow } from './country-completeness-row'

describe('buildCompletenessReportForCountryRow', () => {
  it('returns a bounded score for a minimal full_data', () => {
    const report = buildCompletenessReportForCountryRow(
      { name: 'Testland', region: 'Europe' },
      { official_score: 1, friction_score: 1, acceptance_rate_morocco: 'x' },
      { tourist_visa_score: 5, study_visa_score: 5, work_visa_score: 5, business_visa_score: 5 },
      'Low',
    )
    assert.equal(typeof report.score, 'number')
    assert.ok(report.score >= 0 && report.score <= 100)
    assert.ok(report.totalFields > 0)
  })
})
