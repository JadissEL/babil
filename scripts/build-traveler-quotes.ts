import 'dotenv/config'
import { promises as fs } from 'node:fs'
import path from 'node:path'

type QuoteSentiment = 'positive' | 'neutral' | 'negative'

type TravelerQuote = {
  id: string
  text: string
  sentiment: QuoteSentiment
  sourceName: string
  sourceUrl: string
  author?: string
}

type SourceEntry = {
  sourceName: string
  sourceUrl: string
  snippets?: string[]
  author?: string
}

type CountrySourceFile = {
  country: string
  sources: SourceEntry[]
}

const SOURCES_DIR = path.join(process.cwd(), 'data', 'traveler-quote-sources')
const OUT_DIR = path.join(process.cwd(), 'data', 'traveler-quotes')
const SENTENCE_MIN = 60
const SENTENCE_MAX = 280

function slugifyCountry(country: string) {
  return country
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= SENTENCE_MIN && s.length <= SENTENCE_MAX)
}

function sentimentForSentence(sentence: string): QuoteSentiment {
  const v = sentence.toLowerCase()
  const negativeHints = ['expensive', 'crowded', 'difficult', 'bad', 'worst', 'disappointed', 'overrated']
  const positiveHints = ['amazing', 'beautiful', 'loved', 'friendly', 'great', 'excellent', 'incredible', 'wonderful']
  if (negativeHints.some((h) => v.includes(h))) return 'negative'
  if (positiveHints.some((h) => v.includes(h))) return 'positive'
  return 'neutral'
}

function pickWithDistribution(quotes: TravelerQuote[]) {
  const positive = quotes.filter((q) => q.sentiment === 'positive').slice(0, 5)
  const neutral = quotes.filter((q) => q.sentiment === 'neutral').slice(0, 3)
  const negative = quotes.filter((q) => q.sentiment === 'negative').slice(0, 2)
  if (positive.length < 5 || neutral.length < 3 || negative.length < 2) return []
  return [...positive, ...neutral, ...negative].map((q, i) => ({ ...q, id: `quote_${i + 1}` }))
}

async function extractSentencesFromSource(source: SourceEntry) {
  const out: TravelerQuote[] = []

  if (Array.isArray(source.snippets)) {
    for (const snippet of source.snippets) {
      const text = String(snippet || '').trim()
      if (!text) continue
      out.push({
        id: '',
        text,
        sourceName: source.sourceName,
        sourceUrl: source.sourceUrl,
        sentiment: sentimentForSentence(text),
        author: source.author,
      })
    }
  }

  try {
    const res = await fetch(source.sourceUrl)
    if (!res.ok) return out
    const html = await res.text()
    const plain = stripHtml(html)
    const sentences = splitSentences(plain)
    for (const sentence of sentences.slice(0, 40)) {
      out.push({
        id: '',
        text: sentence,
        sourceName: source.sourceName,
        sourceUrl: source.sourceUrl,
        sentiment: sentimentForSentence(sentence),
        author: source.author,
      })
    }
  } catch {
    // Keep snippet-only quotes if URL fetch fails.
  }

  return out
}

async function buildCountryQuotes(filePath: string) {
  const raw = await fs.readFile(filePath, 'utf8')
  const parsed = JSON.parse(raw) as CountrySourceFile
  const country = String(parsed.country || '').trim()
  const sources = Array.isArray(parsed.sources) ? parsed.sources : []
  if (!country || sources.length === 0) return null

  const collected: TravelerQuote[] = []
  for (const source of sources) {
    if (!source || !source.sourceName || !source.sourceUrl) continue
    const extracted = await extractSentencesFromSource(source)
    collected.push(...extracted)
  }

  const dedup = new Map<string, TravelerQuote>()
  for (const q of collected) {
    const key = q.text.toLowerCase()
    if (!dedup.has(key)) dedup.set(key, q)
  }
  const uniqueQuotes = Array.from(dedup.values())
  const selected = pickWithDistribution(uniqueQuotes)
  if (selected.length !== 10) return { country, status: 'insufficient_quotes' as const, count: selected.length }

  await fs.mkdir(OUT_DIR, { recursive: true })
  const slug = slugifyCountry(country)
  const outPath = path.join(OUT_DIR, `${slug}.json`)
  await fs.writeFile(outPath, JSON.stringify(selected, null, 2), 'utf8')
  return { country, status: 'built' as const, count: selected.length }
}

async function main() {
  await fs.mkdir(SOURCES_DIR, { recursive: true })
  const files = (await fs.readdir(SOURCES_DIR)).filter((f) => f.endsWith('.json'))
  if (files.length === 0) {
    console.log('[quotes-build] no source files found')
    return
  }

  const results = []
  for (const f of files) {
    const built = await buildCountryQuotes(path.join(SOURCES_DIR, f))
    if (built) results.push(built)
  }

  const builtCount = results.filter((r) => r.status === 'built').length
  const insufficient = results.filter((r) => r.status === 'insufficient_quotes').length
  console.log(`[quotes-build] countries=${results.length} built=${builtCount} insufficient=${insufficient}`)
}

main().catch((error) => {
  console.error('[quotes-build] failed', error)
  process.exit(1)
})
