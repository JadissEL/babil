import { promises as fs } from 'node:fs'
import path from 'node:path'

import { isSchengenMember } from '@/lib/schengen-members'

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

function toNum(v: unknown, fallback = 0) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function mapCountry(raw: RawCountry, index: number): LegacyCountryRecord {
  const full = raw
  const official = toNum(raw.official_score, 5)
  const edu = (raw.education_mobility as Record<string, unknown>) || {}
  const training = (edu.technical_training as Record<string, unknown>) || {}
  const visaSystem = (raw.visa_system as Record<string, unknown>) || {}
  const friction = (raw.friction_analysis as Record<string, unknown>) || {}

  return {
    id: index + 1,
    name: String(raw.country || `Country ${index + 1}`),
    region: String(raw.region || 'Other'),
    schengen_flag: isSchengenMember(String(raw.country || '')),
    tourist_visa_score: official,
    study_visa_score: training.access_bac ? 8 : 5,
    work_visa_score: visaSystem.work ? 7 : 4,
    business_visa_score: visaSystem.business ? 7.5 : 4.5,
    appointment_difficulty: String(friction.risk_level || 'Medium'),
    full_data: full,
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
