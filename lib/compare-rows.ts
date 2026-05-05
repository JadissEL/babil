import type { MobilityTier } from '@/components/country/CountryCard'
import { frictionTierFromCountry, isoForCountryName, scoreToMobilityTier } from '@/lib/country-card-mappers'

import type { EnrichedCountryApi } from '@/lib/enrich-country-api'
import { hasCountryPhdStoredData } from '@/lib/country-phd-studies'

export type CompareRow = {
  id: number
  name: string
  code: string
  visaScore: number
  friction: 'Low' | 'Medium' | 'High'
  study: MobilityTier
  business: MobilityTier
  /** `full_data.phd_studies` non vide — voir fiche pays */
  phdStructuredData: boolean
  /** Score composite aligné sur la grille Explorer */
  composite: number
}

export function enrichedToCompareRow(c: EnrichedCountryApi): CompareRow {
  const visaScore = Math.round((c._visa.tourism + c._visa.study + c._visa.work + c._visa.business) / 4)
  return {
    id: c.id,
    name: c.name,
    code: isoForCountryName(c.name),
    visaScore,
    friction: frictionTierFromCountry(c._difficultyLabel, c._full?.friction_score),
    study: scoreToMobilityTier(c._visa.study),
    business: scoreToMobilityTier(c._visa.business),
    phdStructuredData: hasCountryPhdStoredData(c._full),
    composite: c._finalScore,
  }
}
