import { promises as fs } from 'node:fs'
import path from 'node:path'

import { isSchengenMember } from '@/lib/schengen-members'
import { businessMobilityToScalar01to10 } from '@/lib/scoring/business-mobility'
import { studyMobilityToScalar01to10 } from '@/lib/scoring/study-mobility'
import { tourismMobilityToScalar01to10 } from '@/lib/scoring/tourism-mobility'
import { workMobilityToScalar01to10 } from '@/lib/scoring/work-mobility'

type RawCountry = Record<string, unknown> & {
  country?: string
  region?: string
  official_score?: number | string
}

export type LegacyCountryRecord = {
  id: number
  name: string
  region: string
  schengen_flag: boolean
  tourist_visa_score: number
  study_visa_score: number
  work_visa_score: number
  business_visa_score: number
  appointment_difficulty: string
  full_data: Record<string, unknown>
  comments: unknown[]
}

function mapCountry(raw: RawCountry, index: number): LegacyCountryRecord {
  const full = raw as Record<string, unknown>
  const friction = (raw.friction_analysis as Record<string, unknown>) || {}
  const street = full.street_food as Record<string, unknown> | undefined
  const streetOpp = typeof street?.opportunity === 'string' ? street.opportunity : null

  return {
    id: index + 1,
    name: String(raw.country || `Country ${index + 1}`),
    region: String(raw.region || 'Other'),
    schengen_flag: isSchengenMember(String(raw.country || '')),
    tourist_visa_score: tourismMobilityToScalar01to10({ full }),
    study_visa_score: studyMobilityToScalar01to10({ full }),
    work_visa_score: workMobilityToScalar01to10({ full }),
    business_visa_score: businessMobilityToScalar01to10({
      full,
      streetFoodBusinessAccess: streetOpp,
    }),
    appointment_difficulty: String(friction.risk_level || 'Medium'),
    full_data: raw,
    comments: [],
  }
}

export async function loadFallbackCountries() {
  const filePath = path.join(process.cwd(), 'data', 'countries.json')
  const rawText = await fs.readFile(filePath, 'utf8')
  const parsed = JSON.parse(rawText) as { countries?: RawCountry[] }
  const countries = Array.isArray(parsed.countries) ? parsed.countries : []
  return countries.map(mapCountry)
}
