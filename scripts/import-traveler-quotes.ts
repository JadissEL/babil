import 'dotenv/config'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import prisma from '../lib/prisma'

type QuoteSentiment = 'positive' | 'neutral' | 'negative'

type TravelerQuote = {
  id: string
  text: string
  sentiment: QuoteSentiment
  sourceName: string
  sourceUrl: string
  author?: string
}

const QUOTES_DIR = path.join(process.cwd(), 'data', 'traveler-quotes')
const DRY_RUN = process.argv.includes('--dry-run')

function countrySlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function parseFullData(raw: string | null) {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {}
  } catch {
    return {}
  }
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

function hasRequiredDistribution(quotes: TravelerQuote[]) {
  if (quotes.length !== 10) return false
  const positive = quotes.filter((q) => q.sentiment === 'positive').length
  const neutral = quotes.filter((q) => q.sentiment === 'neutral').length
  const negative = quotes.filter((q) => q.sentiment === 'negative').length
  return positive === 5 && neutral === 3 && negative === 2
}

async function importCountryQuotes(countryId: number, countryName: string) {
  const slug = countrySlug(countryName)
  const filePath = path.join(QUOTES_DIR, `${slug}.json`)

  let quotes: TravelerQuote[] = []
  let status: 'verified' | 'collecting' | 'invalid_distribution_or_format' = 'collecting'

  try {
    const raw = await fs.readFile(filePath, 'utf8')
    quotes = normalizeQuotes(JSON.parse(raw))
    status = hasRequiredDistribution(quotes) ? 'verified' : 'invalid_distribution_or_format'
    if (status !== 'verified') quotes = []
  } catch {
    status = 'collecting'
    quotes = []
  }

  const current = await prisma.country.findUnique({
    where: { id: countryId },
    select: { full_data: true },
  })
  const fullData = parseFullData(current?.full_data ?? null)
  const next = {
    ...fullData,
    traveler_quotes: quotes,
    traveler_quotes_meta: {
      status,
      required_distribution: '5_positive_3_neutral_2_negative',
      updatedAt: new Date().toISOString(),
      source: status === 'verified' ? `file:${slug}.json` : 'pending_pipeline',
    },
  }

  if (!DRY_RUN) {
    await prisma.country.update({
      where: { id: countryId },
      data: { full_data: JSON.stringify(next) },
    })
  }

  return { countryName, status, count: quotes.length }
}

async function main() {
  const countries = await prisma.country.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  const results = []
  for (const c of countries) {
    results.push(await importCountryQuotes(c.id, c.name))
  }

  const summary = {
    total: results.length,
    verified: results.filter((r) => r.status === 'verified').length,
    collecting: results.filter((r) => r.status === 'collecting').length,
    invalid: results.filter((r) => r.status === 'invalid_distribution_or_format').length,
  }

  console.log(`[quotes-import] dryRun=${DRY_RUN} total=${summary.total} verified=${summary.verified} collecting=${summary.collecting} invalid=${summary.invalid}`)
}

main()
  .catch((error) => {
    console.error('[quotes-import] failed', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
