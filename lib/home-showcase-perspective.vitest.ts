import { describe, expect, it } from 'vitest'
import type { CountryGridItem } from '@/components/country/CountryGrid'
import { applyPerspectiveToShowcaseItems } from '@/lib/home-showcase-perspective'

const sampleItems: CountryGridItem[] = [
  {
    id: 'a',
    name: 'France',
    code: 'fr',
    score: 80,
    visaScore: 75,
    friction: 'Medium',
    study: 'Strong',
    business: 'Medium',
    tourism: 'Medium',
    work: 'Medium',
    visaBreakdown: { tourism: 90, study: 50, work: 60, business: 55 },
  },
  {
    id: 'b',
    name: 'Japan',
    code: 'jp',
    score: 85,
    visaScore: 70,
    friction: 'Low',
    study: 'Medium',
    business: 'Weak',
    tourism: 'Weak',
    work: 'Weak',
    visaBreakdown: { tourism: 40, study: 70, work: 65, business: 50 },
  },
]

describe('applyPerspectiveToShowcaseItems', () => {
  it('ranks by tourism score when primary is tourism', () => {
    const mapped = applyPerspectiveToShowcaseItems(sampleItems, 'tourism')
    expect(mapped[0]?.name).toBe('France')
    expect(mapped[0]?.score).toBe(90)
    expect(mapped[0]?.primaryFocus).toBe('tourism')
    expect(mapped[0]?.showSecondaryMobility).toBe(false)
  })

  it('returns items unchanged without primary slug', () => {
    const mapped = applyPerspectiveToShowcaseItems(sampleItems, null)
    expect(mapped[0]?.name).toBe('France')
    expect(mapped[0]?.primaryFocus).toBeUndefined()
  })
})
