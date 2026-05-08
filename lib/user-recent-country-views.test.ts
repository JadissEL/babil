import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { recentViewedCountryIdsFromHistory } from './user-recent-country-views'

describe('recentViewedCountryIdsFromHistory', () => {
  it('returns unique country ids in recency order for VIEW_COUNTRY only', () => {
    const ids = recentViewedCountryIdsFromHistory(
      [
        { type: 'VIEW_COUNTRY', payload: { countryId: 5 } },
        { type: 'OTHER', payload: { countryId: 99 } },
        { type: 'VIEW_COUNTRY', payload: { countryId: 12 } },
        { type: 'VIEW_COUNTRY', payload: { countryId: 5 } },
        { type: 'VIEW_COUNTRY', payload: { countryId: '3' } },
      ],
      10,
    )
    assert.deepEqual(ids, [5, 12, 3])
  })

  it('respects max', () => {
    const ids = recentViewedCountryIdsFromHistory(
      [
        { type: 'VIEW_COUNTRY', payload: { countryId: 1 } },
        { type: 'VIEW_COUNTRY', payload: { countryId: 2 } },
        { type: 'VIEW_COUNTRY', payload: { countryId: 3 } },
      ],
      2,
    )
    assert.deepEqual(ids, [1, 2])
  })

  it('ignores invalid payloads', () => {
    const ids = recentViewedCountryIdsFromHistory(
      [{ type: 'VIEW_COUNTRY', payload: null }, { type: 'VIEW_COUNTRY', payload: {} }],
      5,
    )
    assert.deepEqual(ids, [])
  })
})
