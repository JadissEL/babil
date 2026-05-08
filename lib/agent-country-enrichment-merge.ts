/**
 * Shared country snapshot merge (Wikipedia, World Bank GDP, traveler quotes).
 * Used by the supervisor runner and the child enrichment shadow path.
 */

import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'

import { prismaVisaScalarsFromFullData } from '@/lib/scoring/prisma-visa-snapshot'
import { syncDrivingRightsIntelIntoFullData } from '@/lib/driving-rights-intel'

export type QuoteSentiment = 'positive' | 'neutral' | 'negative'

export type TravelerQuote = {
  id: string
  text: string
  sentiment: QuoteSentiment
  sourceName: string
  sourceUrl: string
  author?: string
}

export type VisitReason = {
  id: string
  title: string
  description: string
  imageUrl: string
  imageAlt: string
}

export type CountrySnapshot = {
  fullData: Record<string, unknown>
  scalar: {
    tourist_visa_score: number
    study_visa_score: number
    work_visa_score: number
    business_visa_score: number
    appointment_difficulty: string
  }
}

const QUOTES_DIR = path.join(process.cwd(), 'data', 'traveler-quotes')

export function slugifyCountry(country: string) {
  return country
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function fetchWikipediaSummary(country: string) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(country)}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as Record<string, unknown>
  return {
    title: data.title,
    extract: data.extract,
    lastUpdated: data.timestamp || new Date().toISOString(),
    source: 'wikipedia',
  }
}

export async function fetchWorldBankGdp(country: string) {
  const url = `https://api.worldbank.org/v2/country/${encodeURIComponent(
    country,
  )}/indicator/NY.GDP.MKTP.CD?format=json&per_page=5`
  const res = await fetch(url)
  if (!res.ok) return null
  const payload = (await res.json()) as unknown[]
  const rows = Array.isArray(payload?.[1]) ? (payload[1] as Array<Record<string, unknown>>) : []
  const first = rows.find((r) => typeof r.value === 'number')
  return first ? { gdp_usd: first.value, year: first.date, source: 'worldbank' } : null
}

function pickReasonTitle(country: string, idx: number) {
  const templates = [
    'Scenic landscapes worth a full-day trip',
    'Street-food experiences locals actually love',
    'Historic neighborhoods with strong identity',
    'Museums and cultural venues with depth',
    'Coastal views and sunset spots',
    'Markets full of texture, color, and flavor',
    'Authentic local hospitality and social life',
    'Nature routes and outdoor activities',
    'Creative districts and modern city energy',
    'Seasonal events and festival experiences',
  ]
  return `${templates[idx % templates.length]} in ${country}`
}

export function buildTravelReasons(country: string, region: string, wikiExtract?: string | null): VisitReason[] {
  const extract = String(wikiExtract || '').trim()
  const baseDescription = extract
    ? `${extract.slice(0, 180)}...`
    : `${country} in ${region} combines cultural highlights, local daily life, and diverse travel experiences for different trip styles.`

  return Array.from({ length: 30 }, (_, i) => {
    const n = i + 1
    const query = encodeURIComponent(`${country} travel landscape culture food city`)
    return {
      id: `reason_${n}`,
      title: pickReasonTitle(country, i),
      description: baseDescription,
      imageUrl: `https://source.unsplash.com/900x600/?${query}&sig=${n}`,
      imageAlt: `${country} travel highlight ${n}`,
    }
  })
}

function normalizeQuotes(raw: unknown): TravelerQuote[] {
  if (!Array.isArray(raw)) return []
  const out: TravelerQuote[] = []
  raw.forEach((item, idx) => {
    if (!item || typeof item !== 'object') return
    const i = item as Record<string, unknown>
    const text = String(i.text || '').trim()
    const sourceName = String(i.sourceName || '').trim()
    const sourceUrl = String(i.sourceUrl || '').trim()
    const sentiment = String(i.sentiment || '')
      .trim()
      .toLowerCase() as QuoteSentiment
    const author = String(i.author || '').trim()
    if (!text || !sourceName || !sourceUrl) return
    if (sentiment !== 'positive' && sentiment !== 'neutral' && sentiment !== 'negative') return
    out.push({
      id: String(i.id || `quote_${idx + 1}`),
      text,
      sourceName,
      sourceUrl,
      sentiment,
      author: author || undefined,
    })
  })
  return out
}

function hasRequiredQuoteDistribution(quotes: TravelerQuote[]) {
  if (quotes.length !== 10) return false
  const positive = quotes.filter((q) => q.sentiment === 'positive').length
  const neutral = quotes.filter((q) => q.sentiment === 'neutral').length
  const negative = quotes.filter((q) => q.sentiment === 'negative').length
  return positive === 5 && neutral === 3 && negative === 2
}

export async function loadVerifiedTravelerQuotes(country: string) {
  const slug = slugifyCountry(country)
  const filePath = path.join(QUOTES_DIR, `${slug}.json`)
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw) as unknown
    const quotes = normalizeQuotes(parsed)
    if (!hasRequiredQuoteDistribution(quotes))
      return { quotes: [], status: 'invalid_distribution_or_format' as const }
    return { quotes, status: 'verified' as const }
  } catch {
    return { quotes: [], status: 'collecting' as const }
  }
}

export function mergeCountryData(
  country: string,
  region: string,
  existing: Record<string, unknown>,
  wiki: Awaited<ReturnType<typeof fetchWikipediaSummary>>,
  gdp: Awaited<ReturnType<typeof fetchWorldBankGdp>>,
  quotes: Awaited<ReturnType<typeof loadVerifiedTravelerQuotes>>,
  preserveScalar?: CountrySnapshot['scalar'],
): CountrySnapshot {
  const merged = {
    ...existing,
    country,
    region,
    official_score:
      typeof existing.official_score === 'number' ? existing.official_score : 5.5,
    friction_score:
      typeof existing.friction_score === 'number' ? existing.friction_score : 55,
    acceptance_rate_morocco:
      typeof existing.acceptance_rate_morocco === 'string'
        ? existing.acceptance_rate_morocco
        : '60%',
    overview: wiki ?? existing.overview ?? null,
    economy: gdp ?? existing.economy ?? null,
    travel_reasons: Array.isArray(existing.travel_reasons)
      ? existing.travel_reasons
      : buildTravelReasons(country, region, typeof wiki?.extract === 'string' ? wiki.extract : null),
    traveler_quotes: quotes.quotes.length > 0 ? quotes.quotes : existing.traveler_quotes ?? [],
    traveler_quotes_meta: {
      status: quotes.status,
      required_distribution: '5_positive_3_neutral_2_negative',
      updatedAt: new Date().toISOString(),
      source:
        quotes.status === 'verified'
          ? `file:${slugifyCountry(country)}.json`
          : 'pending_pipeline',
    },
  } as Record<string, unknown>

  const mergedWithDriving = syncDrivingRightsIntelIntoFullData(merged)

  const appointment_difficulty =
    preserveScalar &&
    typeof preserveScalar.appointment_difficulty === 'string' &&
    preserveScalar.appointment_difficulty.trim()
      ? preserveScalar.appointment_difficulty.trim()
      : 'Medium'

  const visaScalars = prismaVisaScalarsFromFullData(mergedWithDriving, {
    tourist_visa_score: preserveScalar?.tourist_visa_score,
    study_visa_score: preserveScalar?.study_visa_score,
    work_visa_score: preserveScalar?.work_visa_score,
    business_visa_score: preserveScalar?.business_visa_score,
    street_food_business_access: mergedWithDriving.street_food_business_access,
  })

  return {
    fullData: mergedWithDriving,
    scalar: {
      ...visaScalars,
      appointment_difficulty,
    },
  }
}

export function hashEnrichmentInputs(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}
