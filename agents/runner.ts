import 'dotenv/config'
import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import prisma from '../lib/prisma'

type Domain = 'overview' | 'economy' | 'politics' | 'culture' | 'history' | 'current_events'
type TaskStatus = 'queued' | 'running' | 'done' | 'failed'
type QuoteSentiment = 'positive' | 'neutral' | 'negative'

type TravelerQuote = {
  id: string
  text: string
  sentiment: QuoteSentiment
  sourceName: string
  sourceUrl: string
  author?: string
}

type VisitReason = {
  id: string
  title: string
  description: string
  imageUrl: string
  imageAlt: string
}

type ResearchTask = {
  id: string
  country: string
  region: string
  domain: Domain
  query: string
  priority: number
  attempts: number
  nextRunAt: string
  status: TaskStatus
  lastError?: string
}

type AgentState = {
  tasks: ResearchTask[]
  generatedAt: string
}

const STATE_DIR = path.join(process.cwd(), '.agent-state')
const STATE_FILE = path.join(STATE_DIR, 'tasks.json')
const QUOTES_DIR = path.join(process.cwd(), 'data', 'traveler-quotes')
const DOMAINS: Domain[] = ['overview', 'economy', 'politics', 'culture', 'history', 'current_events']
const SCHENGEN_COUNTRIES = new Set([
  'Austria',
  'Belgium',
  'Croatia',
  'Czechia',
  'Denmark',
  'Estonia',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'Hungary',
  'Iceland',
  'Italy',
  'Latvia',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Malta',
  'Netherlands',
  'Norway',
  'Poland',
  'Portugal',
  'Slovakia',
  'Slovenia',
  'Spain',
  'Sweden',
  'Switzerland',
])
const QUERY_SYNONYMS: Record<string, string[]> = {
  gdp: ['gross domestic product', 'economic output'],
  government: ['political system', 'state structure'],
  current: ['latest', 'recent', 'ongoing'],
}

const TICK_MS = Number(process.env.AGENT_TICK_MS || 30_000)
const REFRESH_MS = Number(process.env.AGENT_REFRESH_MS || 6 * 60 * 60 * 1000)
const WORKER_BATCH = Number(process.env.AGENT_WORKER_BATCH || 8)
const TASK_TTL_HOURS = Number(process.env.AGENT_TASK_TTL_HOURS || 72)
const RETRY_BASE_DELAY_MS = Number(process.env.AGENT_RETRY_BASE_DELAY_MS || 10 * 60 * 1000)
const RETRY_MAX_DELAY_MS = Number(process.env.AGENT_RETRY_MAX_DELAY_MS || 6 * 60 * 60 * 1000)
const AGENT_VERBOSE_LEVEL = Number(process.env.AGENT_VERBOSE || 1)

let memoryState: AgentState = { tasks: [], generatedAt: new Date().toISOString() }
let tickInProgress = false
let refreshInProgress = false

function id() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function hash(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function inferRegion(raw: string): string {
  const v = String(raw || 'Other')
  if (v === 'Europe') return 'Europe'
  if (v === 'Asia') return 'Asia'
  if (v === 'Africa') return 'Africa'
  if (v === 'Americas') return 'Americas'
  if (v === 'Oceania') return 'Oceania'
  return 'Other'
}

function slugifyCountry(country: string) {
  return country
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function isSchengenCountry(country: string) {
  return SCHENGEN_COUNTRIES.has(country)
}

function domainTemplates(country: string, domain: Domain) {
  const templates: Record<Domain, string[]> = {
    overview: [`${country} population latest`, `${country} capital official source`],
    economy: [`${country} gdp current usd world bank`, `${country} top industries exports`],
    politics: [`${country} government structure`, `${country} politics recent reforms`],
    culture: [`${country} culture society demographics`, `${country} language religion social indicators`],
    history: [`${country} history timeline key events`, `${country} major historical events`],
    current_events: [`${country} latest news developments`, `${country} recent events this year`],
  }
  return templates[domain]
}

function expandQuery(q: string) {
  const out = new Set([q])
  const lower = q.toLowerCase()
  for (const [k, vals] of Object.entries(QUERY_SYNONYMS)) {
    if (!lower.includes(k)) continue
    for (const v of vals) out.add(lower.replace(k, v))
  }
  return Array.from(out)
}

function queryNovelty(query: string, existing: ResearchTask[]) {
  const q = query.toLowerCase()
  const overlap = existing.reduce((acc, t) => (t.query.toLowerCase().includes(q) || q.includes(t.query.toLowerCase()) ? acc + 1 : acc), 0)
  return 1 / (1 + overlap)
}

function generateQueries(country: string, domain: Domain, existing: ResearchTask[], gapHints: string[]) {
  const base = domainTemplates(country, domain)
  const hinted = gapHints.map((h) => `${country} ${h}`)
  const all = [...base, ...hinted].flatMap(expandQuery)
  return Array.from(new Set(all))
    .map((q) => ({ q, score: queryNovelty(q, existing) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((v) => v.q)
}

async function loadState() {
  await fs.mkdir(STATE_DIR, { recursive: true })
  try {
    const raw = await fs.readFile(STATE_FILE, 'utf8')
    memoryState = JSON.parse(raw) as AgentState
  } catch {
    memoryState = { tasks: [], generatedAt: new Date().toISOString() }
  }
}

async function saveState() {
  memoryState.generatedAt = new Date().toISOString()
  await fs.writeFile(STATE_FILE, JSON.stringify(memoryState, null, 2), 'utf8')
}

async function fetchCountriesSeed() {
  const res = await fetch('https://restcountries.com/v3.1/all?fields=name,region')
  if (!res.ok) throw new Error(`restcountries ${res.status}`)
  const data = (await res.json()) as Array<{ name?: { common?: string }; region?: string }>
  return data
    .map((c) => ({ country: String(c.name?.common || '').trim(), region: inferRegion(String(c.region || 'Other')) }))
    .filter((c) => c.country.length > 0)
}

async function enqueueCountryResearch(country: string, region: string) {
  for (const domain of DOMAINS) {
    const queries = generateQueries(country, domain, memoryState.tasks, ['official source', 'latest update'])
    for (const query of queries) {
      memoryState.tasks.push({
        id: id(),
        country,
        region,
        domain,
        query,
        priority: domain === 'current_events' ? 90 : 60,
        attempts: 0,
        nextRunAt: new Date().toISOString(),
        status: 'queued',
      })
    }
  }
}

async function fetchWikipediaSummary(country: string) {
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

async function fetchWorldBankGdp(country: string) {
  const url = `https://api.worldbank.org/v2/country/${encodeURIComponent(country)}/indicator/NY.GDP.MKTP.CD?format=json&per_page=5`
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

function buildTravelReasons(country: string, region: string, wikiExtract?: string | null): VisitReason[] {
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

async function loadVerifiedTravelerQuotes(country: string) {
  const slug = slugifyCountry(country)
  const filePath = path.join(QUOTES_DIR, `${slug}.json`)
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw) as unknown
    const quotes = normalizeQuotes(parsed)
    if (!hasRequiredQuoteDistribution(quotes)) return { quotes: [], status: 'invalid_distribution_or_format' as const }
    return { quotes, status: 'verified' as const }
  } catch {
    return { quotes: [], status: 'collecting' as const }
  }
}

function parseExistingFullData(raw: string | null): Record<string, unknown> {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

async function upsertCountry(task: ResearchTask) {
  const wiki = await fetchWikipediaSummary(task.country)
  const gdp = await fetchWorldBankGdp(task.country)
  const schengen = isSchengenCountry(task.country)
  const quotePack = await loadVerifiedTravelerQuotes(task.country)

  const existing = await prisma.country.findUnique({
    where: { name: task.country },
    select: { full_data: true },
  })

  const existingFullData = parseExistingFullData(existing?.full_data ?? null)

  const fullData = {
    ...existingFullData,
    country: task.country,
    region: task.region,
    official_score: 5.5,
    friction_score: 55,
    acceptance_rate_morocco: '60%',
    _agent: {
      lastTaskId: task.id,
      lastQuery: task.query,
      domain: task.domain,
      updatedAt: new Date().toISOString(),
      sourceHash: hash({ wiki, gdp }),
    },
    overview: wiki,
    economy: gdp,
    travel_reasons: buildTravelReasons(task.country, task.region, typeof wiki?.extract === 'string' ? wiki.extract : null),
    traveler_quotes: quotePack.quotes,
    traveler_quotes_meta: {
      status: quotePack.status,
      required_distribution: '5_positive_3_neutral_2_negative',
      updatedAt: new Date().toISOString(),
      source: quotePack.status === 'verified' ? `file:${slugifyCountry(task.country)}.json` : 'pending_pipeline',
    },
  }

  logVerbose2('upsert payload preview', {
    country: task.country,
    region: task.region,
    schengen,
    quoteStatus: quotePack.status,
    quoteCount: quotePack.quotes.length,
    reasonsCount: Array.isArray(fullData.travel_reasons) ? fullData.travel_reasons.length : 0,
    wikiAvailable: Boolean(wiki?.extract),
    gdpAvailable: Boolean(gdp?.gdp_usd),
  })

  await prisma.country.upsert({
    where: { name: task.country },
    update: {
      region: task.region,
      schengen_flag: schengen,
      tourist_visa_score: 5.5,
      study_visa_score: 5.5,
      work_visa_score: 5.5,
      business_visa_score: 5.5,
      appointment_difficulty: 'Medium',
      full_data: JSON.stringify(fullData),
    },
    create: {
      name: task.country,
      region: task.region,
      schengen_flag: schengen,
      tourist_visa_score: 5.5,
      study_visa_score: 5.5,
      work_visa_score: 5.5,
      business_visa_score: 5.5,
      appointment_difficulty: 'Medium',
      full_data: JSON.stringify(fullData),
    },
  })
}

function nextRetryDelay(attempts: number) {
  const factor = Math.max(0, attempts - 1)
  const delay = RETRY_BASE_DELAY_MS * Math.pow(2, factor)
  return Math.min(delay, RETRY_MAX_DELAY_MS)
}

function summarizeState() {
  const queued = memoryState.tasks.filter((t) => t.status === 'queued').length
  const running = memoryState.tasks.filter((t) => t.status === 'running').length
  const done = memoryState.tasks.filter((t) => t.status === 'done').length
  const failed = memoryState.tasks.filter((t) => t.status === 'failed').length
  return { queued, running, done, failed, total: memoryState.tasks.length }
}

function logVerbose(message: string, data?: Record<string, unknown>) {
  if (AGENT_VERBOSE_LEVEL < 1) return
  if (data) {
    console.log(`[agents:verbose] ${message}`, JSON.stringify(data))
    return
  }
  console.log(`[agents:verbose] ${message}`)
}

function logVerbose2(message: string, data?: Record<string, unknown>) {
  if (AGENT_VERBOSE_LEVEL < 2) return
  if (data) {
    console.log(`[agents:verbose:2] ${message}`, JSON.stringify(data))
    return
  }
  console.log(`[agents:verbose:2] ${message}`)
}

async function runWorkerBatch() {
  const now = Date.now()
  const ttlCutoff = now - TASK_TTL_HOURS * 60 * 60 * 1000

  // Recover any tasks that were running during a previous crash.
  let recoveredRunning = 0
  for (const task of memoryState.tasks) {
    if (task.status === 'running') {
      task.status = 'queued'
      task.nextRunAt = new Date(now).toISOString()
      recoveredRunning += 1
    }
  }
  if (recoveredRunning > 0) {
    logVerbose('recovered running tasks', { count: recoveredRunning })
  }

  // Purge stale done/failed tasks to keep state file bounded.
  const beforePurge = memoryState.tasks.length
  memoryState.tasks = memoryState.tasks.filter((t) => {
    if (t.status === 'queued' || t.status === 'running') return true
    return new Date(t.nextRunAt).getTime() >= ttlCutoff
  })
  const purged = beforePurge - memoryState.tasks.length
  if (purged > 0) {
    logVerbose('purged stale tasks', { purged })
  }

  const runnable = memoryState.tasks
    .filter((t) => t.status === 'queued' && new Date(t.nextRunAt).getTime() <= now)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, WORKER_BATCH)

  logVerbose('batch selected', {
    size: runnable.length,
    topTask: runnable[0]
      ? {
          id: runnable[0].id,
          country: runnable[0].country,
          domain: runnable[0].domain,
          query: runnable[0].query,
        }
      : null,
  })
  logVerbose2('batch sample queries', {
    queries: runnable.slice(0, 3).map((t) => ({
      country: t.country,
      domain: t.domain,
      query: t.query,
    })),
  })

  for (const task of runnable) {
    task.status = 'running'
    task.attempts += 1
    const startedAt = Date.now()
    logVerbose('task start', {
      id: task.id,
      country: task.country,
      domain: task.domain,
      priority: task.priority,
      attempts: task.attempts,
      query: task.query,
    })
    try {
      await upsertCountry(task)
      task.status = 'done'
      logVerbose('task done', {
        id: task.id,
        country: task.country,
        domain: task.domain,
      })
      logVerbose2('task metrics', {
        id: task.id,
        elapsedMs: Date.now() - startedAt,
        query: task.query,
      })
    } catch (error) {
      task.lastError = String((error as Error)?.message || error)
      task.status = task.attempts >= 3 ? 'failed' : 'queued'
      task.nextRunAt = new Date(Date.now() + nextRetryDelay(task.attempts)).toISOString()
      logVerbose('task failed', {
        id: task.id,
        country: task.country,
        domain: task.domain,
        status: task.status,
        nextRunAt: task.nextRunAt,
        error: task.lastError,
      })
      logVerbose2('task failure metrics', {
        id: task.id,
        elapsedMs: Date.now() - startedAt,
        query: task.query,
      })
    }
  }
}

async function scheduleRefresh() {
  const seeds = await fetchCountriesSeed()
  const existingCountries = new Set(
    memoryState.tasks.filter((t) => t.status === 'queued' || t.status === 'running').map((t) => t.country),
  )
  let added = 0
  for (const c of seeds) {
    if (existingCountries.has(c.country)) continue
    await enqueueCountryResearch(c.country, c.region)
    added += 1
  }
  logVerbose('refresh enqueue completed', { addedCountries: added, seeds: seeds.length })
}

async function main() {
  await loadState()
  await scheduleRefresh()
  await saveState()

  console.log(`[agents] running - tick=${TICK_MS}ms refresh=${REFRESH_MS}ms`)

  const tickTimer = setInterval(async () => {
    if (tickInProgress) {
      console.warn('[agents] tick skipped (previous tick still running)')
      return
    }
    tickInProgress = true
    try {
      await runWorkerBatch()
      await saveState()
      const stats = summarizeState()
      console.log(
        `[agents] tick ok queued=${stats.queued} running=${stats.running} done=${stats.done} failed=${stats.failed} total=${stats.total}`,
      )
    } catch (error) {
      console.error('[agents] worker tick failed', error)
    } finally {
      tickInProgress = false
    }
  }, TICK_MS)

  const refreshTimer = setInterval(async () => {
    if (refreshInProgress) {
      console.warn('[agents] refresh skipped (previous refresh still running)')
      return
    }
    refreshInProgress = true
    try {
      await scheduleRefresh()
      await saveState()
      const stats = summarizeState()
      console.log(`[agents] refresh cycle completed total=${stats.total} queued=${stats.queued}`)
    } catch (error) {
      console.error('[agents] refresh cycle failed', error)
    } finally {
      refreshInProgress = false
    }
  }, REFRESH_MS)

  const shutdown = async (signal: string) => {
    console.log(`[agents] received ${signal}, shutting down...`)
    clearInterval(tickTimer)
    clearInterval(refreshTimer)
    try {
      await saveState()
      await prisma.$disconnect()
      console.log('[agents] shutdown complete')
      process.exit(0)
    } catch (error) {
      console.error('[agents] shutdown failed', error)
      process.exit(1)
    }
  }

  process.on('SIGINT', () => {
    void shutdown('SIGINT')
  })
  process.on('SIGTERM', () => {
    void shutdown('SIGTERM')
  })
}

main().catch((error) => {
  console.error('[agents] fatal startup error', error)
  process.exit(1)
})
