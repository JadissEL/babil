import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { mergeAgentProvenanceIntoFullData } from './agent-provenance-full-data'
import { buildCompletenessReport } from './country-completeness'

describe('mergeAgentProvenanceIntoFullData', () => {
  it('fills completeness and manifest; sets updatedAt when absent', () => {
    const report = buildCompletenessReport({
      name: 'X',
      region: 'Europe',
      schengen_flag: false,
      tourist_visa_score: 5,
      study_visa_score: 5,
      work_visa_score: 5,
      business_visa_score: 5,
      appointment_difficulty: 'Low',
      full_data: { official_score: 1, friction_score: 1, acceptance_rate_morocco: '50%' },
    })
    const at = '2026-05-08T12:00:00.000Z'
    const out = mergeAgentProvenanceIntoFullData({ foo: 1 }, report, at)
    const agent = out._agent as Record<string, unknown>
    assert.equal(agent.updatedAt, at)
    const comp = agent.completeness as Record<string, unknown>
    assert.equal(comp.score, report.score)
    assert.ok(agent.coverageManifest && typeof agent.coverageManifest === 'object')
  })

  it('preserves existing _agent.updatedAt', () => {
    const report = buildCompletenessReport({
      name: 'X',
      region: 'Europe',
      schengen_flag: false,
      tourist_visa_score: 5,
      study_visa_score: 5,
      work_visa_score: 5,
      business_visa_score: 5,
      appointment_difficulty: 'Low',
      full_data: {},
    })
    const prevAt = '2025-01-01T00:00:00.000Z'
    const out = mergeAgentProvenanceIntoFullData(
      { _agent: { updatedAt: prevAt, sourceHash: 'abc' } },
      report,
      '2026-05-08T12:00:00.000Z',
    )
    const agent = out._agent as Record<string, unknown>
    assert.equal(agent.updatedAt, prevAt)
    assert.equal(agent.sourceHash, 'abc')
  })
})
