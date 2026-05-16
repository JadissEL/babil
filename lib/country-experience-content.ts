import { travelAmbienceImageForSeed } from '@/lib/travel-fallback-images'

export type VisitReason = {
  id: string
  title: string
  description: string
  imageUrl: string
  imageAlt: string
}

export type QuoteSentiment = 'positive' | 'neutral' | 'negative'

export type TravelerQuote = {
  id: string
  text: string
  sentiment: QuoteSentiment
  sourceName: string
  sourceUrl: string
  author?: string
}

type FullDataLike = {
  travel_reasons?: unknown
  traveler_quotes?: unknown
}

const REASON_TEMPLATES = [
  'Sunrise views that reset your energy',
  'A local market full of color and aromas',
  'Street-food discoveries in lively neighborhoods',
  'Historic districts that feel like open-air museums',
  'A regional dish worth planning a trip for',
  'A day trip into dramatic natural landscapes',
  'Golden-hour walks in iconic city streets',
  'Craft traditions you can watch up close',
  'Festivals that reveal the country spirit',
  'Coffee and tea rituals with local character',
  'Coastal escapes with unforgettable sunsets',
  'Mountain routes with panoramic viewpoints',
  'Museums with world-class storytelling',
  'Nightlife scenes with authentic local rhythm',
  'Small towns with timeless architecture',
  'Train journeys with cinematic scenery',
  'Handmade products from local artisans',
  'Family-friendly parks and cultural spaces',
  'Photography spots at every corner',
  'Cultural performances and live music nights',
  'Nature reserves for peaceful slow travel',
  'Design-forward cafes and creative districts',
  'Riverfront or waterfront evening ambiance',
  'Hidden neighborhoods beyond classic guides',
  'Warm hospitality and memorable conversations',
  'Seasonal experiences unique to this destination',
  'Road-trip loops through diverse landscapes',
  'Traditional sweets and bakery culture',
  'Wellness moments in calm scenic settings',
  'A blend of old-world charm and modern energy',
]

function normalizeReasons(raw: unknown): VisitReason[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item, idx) => {
      if (!item || typeof item !== 'object') return null
      const i = item as Record<string, unknown>
      const title = String(i.title || '').trim()
      const description = String(i.description || '').trim()
      const imageUrl = String(i.imageUrl || '').trim()
      const imageAlt = String(i.imageAlt || '').trim()
      if (!title || !description || !imageUrl) return null
      return {
        id: String(i.id || `reason_${idx + 1}`),
        title,
        description,
        imageUrl,
        imageAlt: imageAlt || title,
      } satisfies VisitReason
    })
    .filter((v): v is VisitReason => Boolean(v))
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
    const sentiment = String(i.sentiment || '').trim().toLowerCase() as QuoteSentiment
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

function fallbackReasons(countryName: string): VisitReason[] {
  return REASON_TEMPLATES.map((title, idx) => {
    const n = idx + 1
    return {
      id: `reason_${n}`,
      title,
      description: `${countryName} offers a strong blend of culture, daily life, and memorable experiences around this theme. This is designed to help users discover practical, enjoyable ideas while planning a trip.`,
      imageUrl: travelAmbienceImageForSeed(`${countryName}:${n}`),
      imageAlt: `${countryName} travel experience ${n}`,
    }
  })
}

export function buildCountryExperienceContent(countryName: string, fullData: FullDataLike) {
  const reasons = normalizeReasons(fullData.travel_reasons)
  const quotes = normalizeQuotes(fullData.traveler_quotes)

  return {
    reasons: reasons.length >= 30 ? reasons.slice(0, 30) : fallbackReasons(countryName),
    quotes: hasRequiredQuoteDistribution(quotes) ? quotes : [],
    hasVerifiedQuotes: hasRequiredQuoteDistribution(quotes),
  }
}
