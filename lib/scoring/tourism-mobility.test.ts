import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { computeTourismMobility100, tourismDifficultyFriendliness01to100 } from '@/lib/scoring/tourism-mobility'

describe('tourismDifficultyFriendliness01to100', () => {
  it('treats easy lower difficulty as more favorable', () => {
    assert.ok(tourismDifficultyFriendliness01to100('Low') > tourismDifficultyFriendliness01to100('High'))
  })
})

describe('computeTourismMobility100', () => {
  it('spreads when official and friction differ', () => {
    const low = computeTourismMobility100({
      full: {
        official_score: 5.2,
        friction_score: 92,
        brutal_reality_score: 5.4,
        acceptance_rate_morocco: '50%',
        confidence_score: 55,
        visa_system: { tourism: { difficulty: 'High' } },
      },
    })
    const high = computeTourismMobility100({
      full: {
        official_score: 9.0,
        friction_score: 12,
        brutal_reality_score: 8.9,
        acceptance_rate_morocco: '88%',
        confidence_score: 78,
        visa_system: { tourism: { difficulty: 'Low' } },
      },
    })
    assert.ok(high - low > 15, `gap ${high - low}`)
  })
})
