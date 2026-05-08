import { describe, expect, it } from 'vitest'

import { filterPublicCountryInsights, insightRowHasContent } from './country-db-insights'

describe('country-db-insights', () => {
  it('insightRowHasContent ignores whitespace-only strings', () => {
    expect(
      insightRowHasContent({
        id: 1,
        osint_insights: '   ',
        real_world_friction: null,
        community_sentiment: null,
      }),
    ).toBe(false)
    expect(
      insightRowHasContent({
        id: 1,
        osint_insights: 'x',
        real_world_friction: null,
        community_sentiment: null,
      }),
    ).toBe(true)
  })

  it('filterPublicCountryInsights drops invalid and empty rows', () => {
    expect(filterPublicCountryInsights(null)).toEqual([])
    expect(
      filterPublicCountryInsights([
        { id: 'bad', osint_insights: 'ok' },
        { id: 2, osint_insights: '  ' },
        { id: 3, real_world_friction: 'friction' },
      ]),
    ).toEqual([
      {
        id: 3,
        osint_insights: null,
        real_world_friction: 'friction',
        community_sentiment: null,
      },
    ])
  })
})
