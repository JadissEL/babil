import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { filterPublicCountryInsights, insightRowHasContent } from './country-db-insights'

describe('country-db-insights', () => {
  it('insightRowHasContent ignores whitespace-only strings', () => {
    assert.equal(
      insightRowHasContent({
        id: 1,
        osint_insights: '   ',
        real_world_friction: null,
        community_sentiment: null,
      }),
      false,
    )
    assert.equal(
      insightRowHasContent({
        id: 1,
        osint_insights: 'x',
        real_world_friction: null,
        community_sentiment: null,
      }),
      true,
    )
  })

  it('filterPublicCountryInsights drops invalid and empty rows', () => {
    assert.deepEqual(filterPublicCountryInsights(null), [])
    assert.deepEqual(
      filterPublicCountryInsights([
        { id: 'bad', osint_insights: 'ok' },
        { id: 2, osint_insights: '  ' },
        { id: 3, real_world_friction: 'friction' },
      ]),
      [
        {
          id: 3,
          osint_insights: null,
          real_world_friction: 'friction',
          community_sentiment: null,
        },
      ],
    )
  })
})
