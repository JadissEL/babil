import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  computeProbabilityTopDrivers,
  computeRecommendationTopDrivers,
  formatScoreDriversFrench,
} from './score-driver-explain'

describe('score-driver-explain', () => {
  it('computeRecommendationTopDrivers picks largest absolute pillar deltas', () => {
    const drivers = computeRecommendationTopDrivers({
      visa: 80,
      friction: 50,
      goalMatch: 50,
      risk: 50,
    })
    assert.equal(drivers.length, 3)
    assert.equal(drivers[0]?.key, 'visa')
    assert.ok(Math.abs(drivers[0]!.deltaPoints) >= Math.abs(drivers[1]!.deltaPoints))
  })

  it('computeProbabilityTopDrivers aligns with route weights', () => {
    const drivers = computeProbabilityTopDrivers({
      finance: 90,
      profession: 50,
      social: 50,
      countryContext: 50,
      appointmentEase: 50,
      riskImmigration: 50,
    })
    assert.equal(drivers[0]?.key, 'finance')
    assert.equal(drivers[0]?.deltaPoints, 8)
  })

  it('formatScoreDriversFrench signs positive contributions', () => {
    const lines = formatScoreDriversFrench(computeRecommendationTopDrivers({
      visa: 60,
      friction: 50,
      goalMatch: 50,
      risk: 50,
    }))
    assert.ok(lines[0]?.includes('+'))
  })
})
