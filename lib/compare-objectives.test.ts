import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { EnrichedCountryApi } from '@/lib/enrich-country-api'
import { COMPARE_OBJECTIVES, objectiveWeightedScore } from '@/lib/compare-objectives'

function fakeCountry(partial: Partial<EnrichedCountryApi>): EnrichedCountryApi {
  return {
    id: 1,
    name: 'Testland',
    region: 'Europe',
    _full: {},
    _visa: { tourism: 50, study: 50, work: 50, business: 50 },
    _friction: 50,
    _education: 50,
    _finalScore: 50,
    _budgetLevel: 'medium',
    _difficultyLabel: 'Medium',
    _highlightPlace: null,
    _highlightImageUrl: null,
    ...partial,
  } as EnrichedCountryApi
}

describe('objectiveWeightedScore', () => {
  it('returns a score in 0–100', () => {
    const c = fakeCountry({})
    for (const def of Object.values(COMPARE_OBJECTIVES)) {
      const s = objectiveWeightedScore(c, def)
      assert.ok(s >= 0 && s <= 100, def.id)
    }
  })

  it('weights tourism higher for tourism objective vs work objective', () => {
    const c = fakeCountry({
      _visa: { tourism: 90, study: 40, work: 40, business: 40 },
    })
    const t = objectiveWeightedScore(c, COMPARE_OBJECTIVES.tourism)
    const w = objectiveWeightedScore(c, COMPARE_OBJECTIVES.work)
    assert.ok(t > w, 'tourism-weighted score should exceed work-weighted for this profile')
  })
})
