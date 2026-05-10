import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  businessRightsTo01to100,
  computeBusinessMobility100,
} from '@/lib/scoring/business-mobility'
import { mergeModelWithDbScalar01to100 } from '@/lib/scoring/scalar-override'

describe('businessRightsTo01to100', () => {
  it('distinguishes common visa rights labels', () => {
    assert.ok(businessRightsTo01to100('Medium') < businessRightsTo01to100('High'))
    assert.ok(businessRightsTo01to100('Total') > businessRightsTo01to100('Limited'))
  })
})

describe('computeBusinessMobility100', () => {
  it('spreads scores when official_score and friction differ (baseline JSON pattern)', () => {
    const low = computeBusinessMobility100({
      full: {
        official_score: 5.2,
        friction_score: 55,
        brutal_reality_score: 5.5,
        acceptance_rate_morocco: '60%',
        confidence_score: 60,
        visa_system: {
          business: { rights: 'Medium', setup: 'Variable', conditions: 'Selon réglementation locale' },
          work: { availability: 'Limited' },
        },
        street_food: { opportunity: 'Medium' },
      },
      streetFoodBusinessAccess: 'Medium',
    })
    const high = computeBusinessMobility100({
      full: {
        official_score: 9.0,
        friction_score: 15,
        brutal_reality_score: 8.8,
        acceptance_rate_morocco: '85%',
        confidence_score: 72,
        visa_system: {
          business: { rights: 'High', setup: 'Streamlined online', conditions: 'Clear investor pathway' },
          work: { availability: 'High' },
        },
        street_food: { opportunity: 'High' },
      },
      streetFoodBusinessAccess: 'High',
    })
    assert.ok(high - low > 15, `expected meaningful gap, got ${high - low}`)
  })
})

describe('mergeModelWithDbScalar01to100', () => {
  it('ignores near-default DB scalar when close to model', () => {
    const m = 58
    assert.equal(mergeModelWithDbScalar01to100(m, 5.9, 12), m)
  })

  it('blends when scalar diverges materially', () => {
    const out = mergeModelWithDbScalar01to100(50, 9.0, 12)
    assert.ok(out > 50)
  })
})
