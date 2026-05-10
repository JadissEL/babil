/**
 * Joins `lib/agent-research-sources.ts` manifest rows with `data/agent-manifest-url-map.json`
 * and performs bounded HTTP GETs per country cycle. URLs must use https and hosts must
 * appear in the map file (allowlist derived at load time).
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import {
  AGENT_RESEARCH_SOURCE_CATEGORIES,
  AGENT_MOROCCO_SOURCE_CATEGORIES,
} from './agent-research-sources'
import { orchestrationSlugForCountry } from './agent-run-memory'
import type { RunMemory, RunMemorySourceIndexEntry } from './agent-run-memory'

const DEFAULT_MAP_REL = path.join('data', 'agent-manifest-url-map.json')
const DEFAULT_PER_CYCLE = Number(process.env.AGENT_MANIFEST_FETCH_PER_CYCLE || 25)
const DEFAULT_BUDGET_MS = Number(process.env.AGENT_MANIFEST_FETCH_BUDGET_MS || 25_000)
const DEFAULT_CONCURRENCY = Math.max(1, Math.floor(Number(process.env.AGENT_MANIFEST_FETCH_CONCURRENCY || 3)))
const DEFAULT_REFETCH_TTL_MS = Number(process.env.AGENT_MANIFEST_REFETCH_TTL_MS || 86_400_000)
const FETCH_TIMEOUT_MS = Math.max(3000, Math.floor(Number(process.env.AGENT_MANIFEST_FETCH_TIMEOUT_MS || 15_000)))
const MAX_BODY_READ = Math.max(50_000, Math.floor(Number(process.env.AGENT_MANIFEST_MAX_BODY_BYTES || 2_000_000)))
const EXCERPT_MAX = Math.max(500, Math.floor(Number(process.env.AGENT_MANIFEST_EXCERPT_CHARS || 12_000)))

export type ManifestUrlMapEntry = {
  categoryId: string
  sourceLabel: string
  method: 'GET'
  urlTemplate: string
  responseKind?: 'json' | 'text'
}

export type ManifestUrlMapFile = {
  version: string
  entries: ManifestUrlMapEntry[]
}

export type ManifestFetchResultItem = {
  categoryId: string
  sourceLabel: string
  url: string
  ok: boolean
  httpStatus?: number
  skipped?: 'ttl' | 'budget' | 'invalid_url'
  error?: string
  fetchedAt: string
  contentType?: string
  excerpt?: string
  /** Server returned 304 and body was not re-read. */
  notModified?: boolean
  etag?: string
}

export type ManifestUrlFetchBatchResult = {
  mapVersion: string | null
  totalFetchable: number
  newCursor: number
  results: ManifestFetchResultItem[]
  skippedReason?: 'no_map_file' | 'no_join_matches'
}

type JoinedRow = {
  categoryId: string
  sourceLabel: string
  urlTemplate: string
  responseKind: 'json' | 'text'
}

function mapPath(): string {
  const override = process.env.AGENT_MANIFEST_MAP_PATH
  if (typeof override === 'string' && override.trim()) return path.resolve(process.cwd(), override.trim())
  return path.join(process.cwd(), DEFAULT_MAP_REL)
}

function applyTemplate(template: string, country: string, region: string, slug: string): string {
  return template
    .replace(/\{country\}/g, country)
    .replace(/\{region\}/g, region)
    .replace(/\{slug\}/g, slug)
    .replace(/\{encodedCountry\}/g, encodeURIComponent(country))
}

function dummyFilledTemplate(template: string): string {
  return applyTemplate(template, 'Exampleland', 'Asia', 'exampleland')
}

/** Shape check; `urlTemplate` may be empty (scaffold rows not yet filled). */
function validateEntryShape(e: unknown): e is ManifestUrlMapEntry {
  if (!e || typeof e !== 'object') return false
  const o = e as Record<string, unknown>
  if (o.method !== 'GET') return false
  if (typeof o.categoryId !== 'string' || !o.categoryId.trim()) return false
  if (typeof o.sourceLabel !== 'string' || !o.sourceLabel.trim()) return false
  if (typeof o.urlTemplate !== 'string') return false
  const tpl = o.urlTemplate.trim()
  if (tpl) {
    if (!tpl.includes('https://')) return false
    const bad = tpl.match(/\{([^}]+)\}/g)?.filter((x) => !/^\{(country|region|slug|encodedCountry)\}$/.test(x))
    if (bad && bad.length > 0) return false
  }
  if (o.responseKind !== undefined && o.responseKind !== 'json' && o.responseKind !== 'text') return false
  return true
}

function isFetchableEntry(ent: ManifestUrlMapEntry): boolean {
  const tpl = ent.urlTemplate.trim()
  if (!tpl.includes('https://')) return false
  try {
    const u = new URL(dummyFilledTemplate(tpl))
    return u.protocol === 'https:'
  } catch {
    return false
  }
}

export async function loadManifestUrlMap(): Promise<{
  file: ManifestUrlMapFile
  allowedHosts: Set<string>
} | null> {
  const p = mapPath()
  try {
    const raw = await fs.readFile(p, 'utf8')
    const parsed = JSON.parse(raw) as Partial<ManifestUrlMapFile>
    if (typeof parsed.version !== 'string' || !Array.isArray(parsed.entries)) return null
    const candidates = parsed.entries.filter(validateEntryShape).filter(isFetchableEntry)
    const allowedHosts = new Set<string>()
    const entries: ManifestUrlMapEntry[] = []
    for (const ent of candidates) {
      try {
        const u = new URL(dummyFilledTemplate(ent.urlTemplate))
        if (u.protocol !== 'https:') continue
        allowedHosts.add(u.hostname)
        entries.push(ent)
      } catch {
        /* skip invalid template */
      }
    }
    if (entries.length === 0) return null
    return { file: { version: parsed.version, entries }, allowedHosts }
  } catch {
    return null
  }
}

function buildManifestRows(): { categoryId: string; sourceLabel: string }[] {
  const rows: { categoryId: string; sourceLabel: string }[] = []
  for (const cat of AGENT_RESEARCH_SOURCE_CATEGORIES) {
    for (const sourceLabel of cat.sources) {
      rows.push({ categoryId: cat.id, sourceLabel })
    }
  }
  for (const cat of AGENT_MOROCCO_SOURCE_CATEGORIES) {
    for (const sourceLabel of cat.sources) {
      rows.push({ categoryId: cat.id, sourceLabel })
    }
  }
  return rows
}

function buildJoinList(map: ManifestUrlMapFile): JoinedRow[] {
  const lookup = new Map<string, ManifestUrlMapEntry>()
  for (const e of map.entries) {
    lookup.set(`${e.categoryId}\0${e.sourceLabel}`, e)
  }
  const out: JoinedRow[] = []
  for (const row of buildManifestRows()) {
    const hit = lookup.get(`${row.categoryId}\0${row.sourceLabel}`)
    if (!hit) continue
    out.push({
      categoryId: row.categoryId,
      sourceLabel: row.sourceLabel,
      urlTemplate: hit.urlTemplate,
      responseKind: hit.responseKind === 'text' ? 'text' : 'json',
    })
  }
  return out
}

function memoryKeyForManifestFetch(categoryId: string, sourceLabel: string): string {
  return `manifestFetch:${categoryId}:${sourceLabel}`
}

function parseLastFetchMs(entry: RunMemorySourceIndexEntry | undefined): number {
  if (!entry?.lastFetchedAt) return 0
  const t = Date.parse(entry.lastFetchedAt)
  return Number.isFinite(t) ? t : 0
}

function ensureSourceEntry(mem: RunMemory, key: string): RunMemorySourceIndexEntry {
  const cur = mem.sourcesIndex[key]
  const now = new Date().toISOString()
  if (cur && typeof cur.firstUsedAt === 'string' && Array.isArray(cur.fields))
    return { ...cur, fetchStatus: cur.fetchStatus || 'unknown' }
  return { firstUsedAt: now, fields: [], fetchStatus: 'pending' }
}

function abortSignalForFetch(): AbortSignal {
  const AnyAbort = AbortSignal as typeof AbortSignal & {
    timeout?: (ms: number) => AbortSignal
  }
  if (typeof AnyAbort.timeout === 'function') {
    return AnyAbort.timeout(FETCH_TIMEOUT_MS)
  }
  const ac = new AbortController()
  setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS)
  return ac.signal
}

async function fetchOneUrl(
  url: string,
  allowedHosts: Set<string>,
  opts?: { ifNoneMatch?: string },
): Promise<{
  ok: boolean
  httpStatus?: number
  error?: string
  contentType?: string
  excerpt?: string
  etag?: string
  notModified?: boolean
}> {
  let host: string
  try {
    const u = new URL(url)
    if (u.protocol !== 'https:') return { ok: false, error: 'not_https' }
    host = u.hostname
    if (!allowedHosts.has(host)) return { ok: false, error: 'host_not_allowlisted' }
  } catch {
    return { ok: false, error: 'invalid_url' }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json, text/plain;q=0.9, */*;q=0.1',
  }
  if (opts?.ifNoneMatch?.trim()) {
    headers['If-None-Match'] = opts.ifNoneMatch.trim()
  }

  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: abortSignalForFetch(),
      headers,
    })
    if (res.status === 304) {
      return {
        ok: true,
        httpStatus: 304,
        notModified: true,
        etag: res.headers.get('etag') || undefined,
      }
    }
    const len = res.headers.get('content-length')
    if (len && Number(len) > MAX_BODY_READ) {
      return { ok: false, httpStatus: res.status, error: 'content_length_too_large' }
    }
    const buf = await res.arrayBuffer()
    if (buf.byteLength > MAX_BODY_READ) {
      return { ok: false, httpStatus: res.status, error: 'body_too_large' }
    }
    const text = new TextDecoder('utf8', { fatal: false }).decode(buf)
    const excerpt = text.slice(0, EXCERPT_MAX)
    return {
      ok: res.ok,
      httpStatus: res.status,
      contentType: res.headers.get('content-type') || undefined,
      excerpt,
      etag: res.headers.get('etag') || undefined,
    }
  } catch (err) {
    return { ok: false, error: String((err as Error)?.message || err) }
  }
}

async function runLimitedConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return []
  const results = new Array<R>(items.length)
  let next = 0
  async function worker() {
    for (;;) {
      const i = next++
      if (i >= items.length) break
      results[i] = await fn(items[i], i)
    }
  }
  const n = Math.min(Math.max(1, limit), items.length)
  await Promise.all(Array.from({ length: n }, () => worker()))
  return results
}

export async function runManifestUrlFetchBatch(opts: {
  country: string
  region: string
  memory: RunMemory
  perCycle?: number
  budgetMs?: number
  concurrency?: number
  refetchTtlMs?: number
  logVerbose?: (msg: string, data?: Record<string, unknown>) => void
}): Promise<ManifestUrlFetchBatchResult> {
  const perCycle = opts.perCycle ?? DEFAULT_PER_CYCLE
  const budgetMs = opts.budgetMs ?? DEFAULT_BUDGET_MS
  const concurrency = opts.concurrency ?? DEFAULT_CONCURRENCY
  const refetchTtlMs = opts.refetchTtlMs ?? DEFAULT_REFETCH_TTL_MS
  const started = Date.now()
  const country = opts.country.trim()
  const region = opts.region.trim() || 'Other'
  const slug = orchestrationSlugForCountry(country)

  const loaded = await loadManifestUrlMap()
  if (!loaded) {
    opts.logVerbose?.('manifest_url_fetch_skip', { reason: 'no_map_file', path: mapPath() })
    return {
      mapVersion: null,
      totalFetchable: 0,
      newCursor: opts.memory.manifestFetchCursor ?? 0,
      results: [],
      skippedReason: 'no_map_file',
    }
  }

  const joinList = buildJoinList(loaded.file)
  if (joinList.length === 0) {
    opts.logVerbose?.('manifest_url_fetch_skip', { reason: 'no_join_matches' })
    return {
      mapVersion: loaded.file.version,
      totalFetchable: 0,
      newCursor: typeof opts.memory.manifestFetchCursor === 'number' ? opts.memory.manifestFetchCursor : 0,
      results: [],
      skippedReason: 'no_join_matches',
    }
  }

  let cursor = typeof opts.memory.manifestFetchCursor === 'number' ? opts.memory.manifestFetchCursor : 0
  const L = joinList.length
  if (!Number.isFinite(cursor) || cursor < 0) cursor = 0
  if (L > 0) cursor = cursor % L

  const batchRows: JoinedRow[] = []
  for (let i = 0; i < perCycle; i += 1) {
    batchRows.push(joinList[(cursor + i) % L]!)
  }
  const nextCursor = (cursor + perCycle) % L

  const results: ManifestFetchResultItem[] = await runLimitedConcurrency(
    batchRows,
    concurrency,
    async (row) => {
      if (Date.now() - started > budgetMs) {
        return {
          categoryId: row.categoryId,
          sourceLabel: row.sourceLabel,
          url: '',
          ok: false,
          skipped: 'budget',
          fetchedAt: new Date().toISOString(),
        }
      }
      const url = applyTemplate(row.urlTemplate, country, region, slug)
      let parsed: URL
      try {
        parsed = new URL(url)
      } catch {
        return {
          categoryId: row.categoryId,
          sourceLabel: row.sourceLabel,
          url,
          ok: false,
          skipped: 'invalid_url',
          fetchedAt: new Date().toISOString(),
        }
      }
      if (parsed.protocol !== 'https:' || !loaded.allowedHosts.has(parsed.hostname)) {
        return {
          categoryId: row.categoryId,
          sourceLabel: row.sourceLabel,
          url,
          ok: false,
          error: 'host_not_allowlisted',
          fetchedAt: new Date().toISOString(),
        }
      }
      const key = memoryKeyForManifestFetch(row.categoryId, row.sourceLabel)
      const prev = ensureSourceEntry(opts.memory, key)
      const last = parseLastFetchMs(prev)
      if (refetchTtlMs > 0 && last > 0 && Date.now() - last < refetchTtlMs) {
        return {
          categoryId: row.categoryId,
          sourceLabel: row.sourceLabel,
          url,
          ok: true,
          skipped: 'ttl',
          fetchedAt: new Date().toISOString(),
        }
      }
      const ifNone = typeof prev.etag === 'string' && prev.etag.trim() ? prev.etag.trim() : undefined
      const fr = await fetchOneUrl(url, loaded.allowedHosts, { ifNoneMatch: ifNone })
      const item: ManifestFetchResultItem = {
        categoryId: row.categoryId,
        sourceLabel: row.sourceLabel,
        url,
        ok: fr.ok,
        httpStatus: fr.httpStatus,
        error: fr.error,
        fetchedAt: new Date().toISOString(),
        contentType: fr.contentType,
        excerpt: fr.notModified ? undefined : fr.excerpt,
        notModified: fr.notModified,
        etag: fr.etag,
      }
      const ent = ensureSourceEntry(opts.memory, key)
      ent.lastFetchedAt = item.fetchedAt
      ent.httpStatus = item.httpStatus
      if (fr.ok) {
        ent.fetchStatus = fr.notModified ? 'http_not_modified' : 'http_ok'
      } else {
        ent.fetchStatus = 'http_error'
      }
      if (fr.etag) ent.etag = fr.etag
      opts.memory.sourcesIndex[key] = ent
      return item
    },
  )

  opts.memory.manifestFetchCursor = nextCursor
  opts.memory.manifestUrlMapVersion = loaded.file.version

  return {
    mapVersion: loaded.file.version,
    totalFetchable: joinList.length,
    newCursor: nextCursor,
    results,
  }
}
