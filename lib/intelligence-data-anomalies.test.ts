import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  analyzeEconomyIndicatorsAnomalies,
  detectSharpNumericJump,
  observationPairToJumpAnomaly,
  parseDataQualityAnomaliesPayload,
} from './intelligence-data-anomalies'

describe('intelligence-data-anomalies (B.32)', () => {
  it('flags GDP per capita inconsistent with GDP / population', () => {
    const a = analyzeEconomyIndicatorsAnomalies({
      population_wb: 10_000_000,
      gdp_usd: 100_000_000_000,
      gdp_per_capita_usd: 50_000,
    })
    assert.ok(a.some((x) => x.code === 'economy_gdp_pop_capita_mismatch'))
  })

  it('returns empty when economy missing', () => {
    assert.equal(analyzeEconomyIndicatorsAnomalies(undefined).length, 0)
  })

  it('skips heuristics when World Bank GDP series is explicitly unavailable', () => {
    const a = analyzeEconomyIndicatorsAnomalies({
      gdp_wb_series_unavailable: true,
      population_wb: 100,
      gdp_usd: 1e12,
      gdp_per_capita_usd: 50_000,
    })
    assert.equal(a.length, 0)
  })

  it('detectSharpNumericJump respects threshold', () => {
    assert.equal(detectSharpNumericJump(100, 40, 2.4), true)
    assert.equal(detectSharpNumericJump(100, 50, 2.4), false)
  })

  it('observationPairToJumpAnomaly maps field path to code', () => {
    const an = observationPairToJumpAnomaly('economy.gdp', 'PIB', [
      { valueNumeric: 100, valueJson: '{}' },
      { valueNumeric: 30, valueJson: '{}' },
    ])
    assert.ok(an)
    assert.equal(an!.code, 'observation_jump_economy_gdp')
  })

  it('parseDataQualityAnomaliesPayload filters invalid entries', () => {
    assert.deepEqual(parseDataQualityAnomaliesPayload(null), [])
    assert.equal(parseDataQualityAnomaliesPayload([{ code: 'x' }]).length, 0)
    const p = parseDataQualityAnomaliesPayload([{ code: 'a', messageFr: 'b' }])
    assert.equal(p.length, 1)
    assert.equal(p[0]!.code, 'a')
  })
})
