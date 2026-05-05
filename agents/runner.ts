import 'dotenv/config'
import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import prisma from '../lib/prisma'
import { CONTRACT_VERSION, COUNTRY_INTELLIGENCE_CONTRACT_V2 } from '../lib/country-intelligence-contract'
import { buildCompletenessReport, buildCoverageManifest } from '../lib/country-completeness'

type TaskStatus = 'queued' | 'running' | 'done' | 'failed'
type QuoteSentiment = 'positive' | 'neutral' | 'negative'
type Domain = 'overview' | 'economy' | 'education' | 'business' | 'driving' | 'community'

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

type CountryTask = {
  id: string
  country: string
  region: string
  domain: Domain
  query: string
  priority: number
  attempts: number
  pass: number
  nextRunAt: string
  status: TaskStatus
  completenessScore: number
  missingCritical: string[]
  lastError?: string
}

type AgentState = {
  tasks: CountryTask[]
  generatedAt: string
  contractVersion: string
}

type CountrySnapshot = {
  fullData: Record<string, unknown>
  scalar: {
    tourist_visa_score: number
    study_visa_score: number
    work_visa_score: number
    business_visa_score: number
    appointment_difficulty: string
  }
}

const STATE_DIR = path.join(process.cwd(), '.agent-state')
const STATE_FILE = path.join(STATE_DIR, 'tasks.json')
const QUOTES_DIR = path.join(process.cwd(), 'data', 'traveler-quotes')
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

const DOMAIN_HINTS: Record<Domain, string[]> = {
  overview: ['country profile overview', 'capital population quick facts'],
  economy: ['gdp latest world bank', 'economic outlook'],
  education: ['education mobility access', 'language and training options'],
  business: ['business setup conditions', 'street food business opportunity'],
  driving: ['driving license conversion rules', 'license restrictions'],
  community: ['traveler quotes verified sources', 'appointment audit lived experience'],
}

const TICK_MS = Number(process.env.AGENT_TICK_MS || 30_000)
const REFRESH_MS = Number(process.env.AGENT_REFRESH_MS || 6 * 60 * 60 * 1000)
const WORKER_BATCH = Number(process.env.AGENT_WORKER_BATCH || 1)
const TASK_TTL_HOURS = Number(process.env.AGENT_TASK_TTL_HOURS || 72)
const RETRY_BASE_DELAY_MS = Number(process.env.AGENT_RETRY_BASE_DELAY_MS || 10 * 60 * 1000)
const RETRY_MAX_DELAY_MS = Number(process.env.AGENT_RETRY_MAX_DELAY_MS || 6 * 60 * 60 * 1000)
const AGENT_VERBOSE_LEVEL = Number(process.env.AGENT_VERBOSE || 1)
const MAX_RECURSION_PASSES = Number(process.env.AGENT_MAX_RECURSION_PASSES || 4)
const COMPLETENESS_TARGET_SCORE = Number(process.env.AGENT_COMPLETENESS_TARGET || 85)

let memoryState: AgentState = {
  tasks: [],
  generatedAt: new Date().toISOString(),
  contractVersion: CONTRACT_VERSION,
}
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

function normalizeDomain(domain: unknown): Domain {
  if (domain === 'economy') return 'economy'
  if (domain === 'education') return 'education'
  if (domain === 'business') return 'business'
  if (domain === 'driving') return 'driving'
  if (domain === 'community') return 'community'
  return 'overview'
}

function isSchengenCountry(country: string) {
  return SCHENGEN_COUNTRIES.has(country)
}

async function loadState() {
  await fs.mkdir(STATE_DIR, { recursive: true })
  try {
    const raw = await fs.readFile(STATE_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Partial<AgentState>
    const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : []
    memoryState = {
      tasks: tasks.map((task) => ({
        id: String(task.id || id()),
        country: String(task.country || ''),
        region: String(task.region || 'Other'),
        domain: normalizeDomain(task.domain),
        query: String(task.query || 'country-first-completion-loop'),
        priority: Number(task.priority || 50),
        attempts: Number(task.attempts || 0),
        pass: Number(task.pass || 0),
        nextRunAt: String(task.nextRunAt || new Date().toISOString()),
        status:
          task.status === 'running' || task.status === 'done' || task.status === 'failed'
            ? task.status
            : 'queued',
        completenessScore: Number(task.completenessScore || 0),
        missingCritical: Array.isArray(task.missingCritical)
          ? task.missingCritical.map((v) => String(v))
          : [],
        lastError: task.lastError ? String(task.lastError) : undefined,
      })),
      generatedAt:
        typeof parsed.generatedAt === 'string' ? parsed.generatedAt : new Date().toISOString(),
      contractVersion:
        typeof parsed.contractVersion === 'string' ? parsed.contractVersion : CONTRACT_VERSION,
    }
  } catch {
    memoryState = {
      tasks: [],
      generatedAt: new Date().toISOString(),
      contractVersion: CONTRACT_VERSION,
    }
  }
}

async function saveState() {
  memoryState.generatedAt = new Date().toISOString()
  memoryState.contractVersion = CONTRACT_VERSION
  await fs.writeFile(STATE_FILE, JSON.stringify(memoryState, null, 2), 'utf8')
}

async function fetchCountriesSeed() {
  const res = await fetch('https://restcountries.com/v3.1/all?fields=name,region')
  if (!res.ok) throw new Error(`restcountries ${res.status}`)
  const data = (await res.json()) as Array<{ name?: { common?: string }; region?: string }>
  return data
    .map((c) => ({
      country: String(c.name?.common || '').trim(),
      region: inferRegion(String(c.region || 'Other')),
    }))
    .filter((c) => c.country.length > 0)
}

function getTaskByCountry(country: string) {
  return memoryState.tasks.find((t) => t.country === country && t.status !== 'failed')
}

function enqueueCountry(country: string, region: string) {
  memoryState.tasks.push({
    id: id(),
    country,
    region,
    domain: 'overview',
    query: 'country-first-completion-loop',
    priority: 100,
    attempts: 0,
    pass: 0,
    nextRunAt: new Date().toISOString(),
    status: 'queued',
    completenessScore: 0,
    missingCritical: [],
  })
}

function parseExistingFullData(raw: string | null): Record<string, unknown> {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {}
  } catch {
    return {}
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

async function loadVerifiedTravelerQuotes(country: string) {
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

function resolveAdaptiveQuery(country: string, missingCritical: string[]) {
  const hints = Object.entries(DOMAIN_HINTS)
    .filter(([domain]) =>
      missingCritical.some((field) => field.startsWith(`${domain}_`) || field.includes(domain)),
    )
    .flatMap(([, values]) => values)
  const normalizedHints = hints.length > 0 ? hints : ['country intelligence evidence']
  return `${country} :: ${normalizedHints.slice(0, 3).join(' | ')}`
}

function mergeCountryData(
  country: string,
  region: string,
  existing: Record<string, unknown>,
  wiki: Awaited<ReturnType<typeof fetchWikipediaSummary>>,
  gdp: Awaited<ReturnType<typeof fetchWorldBankGdp>>,
  quotes: Awaited<ReturnType<typeof loadVerifiedTravelerQuotes>>,
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

  return {
    fullData: merged,
    scalar: {
      tourist_visa_score: 5.5,
      study_visa_score: 5.5,
      work_visa_score: 5.5,
      business_visa_score: 5.5,
      appointment_difficulty: 'Medium',
    },
  }
}

function buildCompletenessPayload(snapshot: CountrySnapshot, task: CountryTask, sourceHash: string) {
  const countryPayload = {
    name: task.country,
    region: task.region,
    schengen_flag: isSchengenCountry(task.country),
    tourist_visa_score: snapshot.scalar.tourist_visa_score,
    study_visa_score: snapshot.scalar.study_visa_score,
    work_visa_score: snapshot.scalar.work_visa_score,
    business_visa_score: snapshot.scalar.business_visa_score,
    appointment_difficulty: snapshot.scalar.appointment_difficulty,
    full_data: snapshot.fullData,
  }
  const report = buildCompletenessReport(countryPayload)
  const coverageManifest = buildCoverageManifest(report)

  return {
    report,
    coverageManifest,
    _agent: {
      lastTaskId: task.id,
      lastQuery: task.query,
      domain: task.domain,
      updatedAt: new Date().toISOString(),
      sourceHash,
      contractVersion: CONTRACT_VERSION,
      completeness: {
        score: report.score,
        coveredFields: report.coveredFields,
        totalFields: report.totalFields,
        criticalMissing: report.criticalMissing,
        domains: report.domains,
      },
      coverageManifest,
      recursion: {
        pass: task.pass,
        maxPasses: MAX_RECURSION_PASSES,
      },
      nextResearchHints: resolveAdaptiveQuery(task.country, report.criticalMissing),
    },
  }
}

async function processCountryTask(task: CountryTask) {
  const schengen = isSchengenCountry(task.country)
  const existing = await prisma.country.findUnique({
    where: { name: task.country },
    select: { full_data: true },
  })

  let snapshot: CountrySnapshot = {
    fullData: parseExistingFullData(existing?.full_data ?? null),
    scalar: {
      tourist_visa_score: 5.5,
      study_visa_score: 5.5,
      work_visa_score: 5.5,
      business_visa_score: 5.5,
      appointment_difficulty: 'Medium',
    },
  }

  let bestScore = -1
  let sourceHash = ''
  let reportPayload = buildCompletenessPayload(snapshot, task, hash({}))

  for (let pass = 1; pass <= MAX_RECURSION_PASSES; pass += 1) {
    task.pass = pass
    task.domain = pass === 1 ? 'overview' : 'community'
    task.query = resolveAdaptiveQuery(task.country, reportPayload.report.criticalMissing)

    const wiki = await fetchWikipediaSummary(task.country)
    const gdp = await fetchWorldBankGdp(task.country)
    const quotes = await loadVerifiedTravelerQuotes(task.country)
    sourceHash = hash({ wiki, gdp, quoteStatus: quotes.status })

    snapshot = mergeCountryData(task.country, task.region, snapshot.fullData, wiki, gdp, quotes)
    reportPayload = buildCompletenessPayload(snapshot, task, sourceHash)

    logVerbose2('country pass metrics', {
      country: task.country,
      pass,
      score: reportPayload.report.score,
      criticalMissing: reportPayload.report.criticalMissing.length,
    })

    if (reportPayload.report.score <= bestScore) break
    bestScore = reportPayload.report.score

    if (
      reportPayload.report.score >= COMPLETENESS_TARGET_SCORE &&
      reportPayload.report.criticalMissing.length === 0
    ) {
      break
    }
  }

  const fullData = {
    ...snapshot.fullData,
    _agent: reportPayload._agent,
  }

  logVerbose2('upsert payload preview', {
    country: task.country,
    schengen,
    completeness: reportPayload.report.score,
    criticalMissing: reportPayload.report.criticalMissing.length,
    contractFields: COUNTRY_INTELLIGENCE_CONTRACT_V2.length,
  })

  await prisma.country.upsert({
    where: { name: task.country },
    update: {
      region: task.region,
      schengen_flag: schengen,
      tourist_visa_score: snapshot.scalar.tourist_visa_score,
      study_visa_score: snapshot.scalar.study_visa_score,
      work_visa_score: snapshot.scalar.work_visa_score,
      business_visa_score: snapshot.scalar.business_visa_score,
      appointment_difficulty: snapshot.scalar.appointment_difficulty,
      full_data: JSON.stringify(fullData),
    },
    create: {
      name: task.country,
      region: task.region,
      schengen_flag: schengen,
      tourist_visa_score: snapshot.scalar.tourist_visa_score,
      study_visa_score: snapshot.scalar.study_visa_score,
      work_visa_score: snapshot.scalar.work_visa_score,
      business_visa_score: snapshot.scalar.business_visa_score,
      appointment_difficulty: snapshot.scalar.appointment_difficulty,
      full_data: JSON.stringify(fullData),
    },
  })

  return {
    score: reportPayload.report.score,
    criticalMissing: reportPayload.report.criticalMissing,
  }
}

async function runWorkerBatch() {
  const now = Date.now()
  const ttlCutoff = now - TASK_TTL_HOURS * 60 * 60 * 1000

  let recoveredRunning = 0
  for (const task of memoryState.tasks) {
    if (task.status === 'running') {
      task.status = 'queued'
      task.nextRunAt = new Date(now).toISOString()
      recoveredRunning += 1
    }
  }
  if (recoveredRunning > 0) logVerbose('recovered running tasks', { count: recoveredRunning })

  const beforePurge = memoryState.tasks.length
  memoryState.tasks = memoryState.tasks.filter((t) => {
    if (t.status === 'queued' || t.status === 'running') return true
    return new Date(t.nextRunAt).getTime() >= ttlCutoff
  })
  const purged = beforePurge - memoryState.tasks.length
  if (purged > 0) logVerbose('purged stale tasks', { purged })

  const runnable = memoryState.tasks
    .filter((t) => t.status === 'queued' && new Date(t.nextRunAt).getTime() <= now)
    .sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority
      if (a.completenessScore !== b.completenessScore)
        return a.completenessScore - b.completenessScore
      return a.country.localeCompare(b.country)
    })
    .slice(0, WORKER_BATCH)

  logVerbose('batch selected', {
    size: runnable.length,
    topTask: runnable[0]
      ? {
          id: runnable[0].id,
          country: runnable[0].country,
          score: runnable[0].completenessScore,
          missingCritical: runnable[0].missingCritical.length,
        }
      : null,
  })

  for (const task of runnable) {
    task.status = 'running'
    task.attempts += 1
    const startedAt = Date.now()

    logVerbose('country cycle start', {
      id: task.id,
      country: task.country,
      attempts: task.attempts,
      currentScore: task.completenessScore,
      missingCritical: task.missingCritical.length,
    })

    try {
      const result = await processCountryTask(task)
      task.completenessScore = result.score
      task.missingCritical = result.criticalMissing
      task.priority =
        result.criticalMissing.length > 0
          ? 1000 + (100 - Math.min(100, result.score))
          : Math.max(10, 100 - result.score)
      task.query = resolveAdaptiveQuery(task.country, result.criticalMissing)

      if (
        result.score >= COMPLETENESS_TARGET_SCORE &&
        result.criticalMissing.length === 0
      ) {
        task.status = 'done'
        task.nextRunAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      } else {
        task.status = 'queued'
        task.nextRunAt = new Date(Date.now() + nextRetryDelay(task.attempts)).toISOString()
      }

      logVerbose('country cycle result', {
        id: task.id,
        country: task.country,
        score: result.score,
        missingCritical: result.criticalMissing.length,
        status: task.status,
      })
      logVerbose2('country cycle timings', {
        id: task.id,
        elapsedMs: Date.now() - startedAt,
      })
    } catch (error) {
      task.lastError = String((error as Error)?.message || error)
      task.status = task.attempts >= 3 ? 'failed' : 'queued'
      task.nextRunAt = new Date(Date.now() + nextRetryDelay(task.attempts)).toISOString()
      logVerbose('country cycle failed', {
        id: task.id,
        country: task.country,
        status: task.status,
        error: task.lastError,
      })
    }
  }
}

async function scheduleRefresh() {
  const seeds = await fetchCountriesSeed()
  let added = 0
  for (const seed of seeds) {
    if (getTaskByCountry(seed.country)) continue
    enqueueCountry(seed.country, seed.region)
    added += 1
  }
  logVerbose('refresh enqueue completed', { addedCountries: added, seeds: seeds.length })
}

async function main() {
  await loadState()
  await scheduleRefresh()
  await saveState()

  console.log(
    `[agents] running - tick=${TICK_MS}ms refresh=${REFRESH_MS}ms contract=${CONTRACT_VERSION}`,
  )

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
