import fs from 'node:fs'
import path from 'node:path'

import type { ScrapeRunManifest, ScrapeSourceResult } from '@/lib/datafile/scraper/types'
import { datafileRootFromCwd } from '@/lib/datafile/load-master-list'

export function scrapeRunsRoot(cwd = process.cwd()): string {
  return path.join(datafileRootFromCwd(cwd), 'scrape-runs')
}

export function runDirForId(runId: string, cwd = process.cwd()): string {
  return path.join(scrapeRunsRoot(cwd), runId)
}

export function ensureRunDir(runId: string, cwd = process.cwd()): string {
  const dir = runDirForId(runId, cwd)
  fs.mkdirSync(path.join(dir, 'sources'), { recursive: true })
  return dir
}

export function writeSourceResult(
  runId: string,
  result: ScrapeSourceResult,
  cwd = process.cwd(),
): void {
  const dir = ensureRunDir(runId, cwd)
  const p = path.join(dir, 'sources', `${result.sourceId}.json`)
  fs.writeFileSync(p, JSON.stringify(result, null, 2), 'utf8')
}

export function readSourceResultIfExists(
  runId: string,
  sourceId: string,
  cwd = process.cwd(),
): ScrapeSourceResult | null {
  const p = path.join(runDirForId(runId, cwd), 'sources', `${sourceId}.json`)
  if (!fs.existsSync(p)) return null
  return JSON.parse(fs.readFileSync(p, 'utf8')) as ScrapeSourceResult
}

export function writeRunManifest(manifest: ScrapeRunManifest, cwd = process.cwd()): void {
  const dir = ensureRunDir(manifest.runId, cwd)
  fs.writeFileSync(path.join(dir, 'run.json'), JSON.stringify(manifest, null, 2), 'utf8')
}

export function listSourceResultIds(runId: string, cwd = process.cwd()): string[] {
  const dir = path.join(runDirForId(runId, cwd), 'sources')
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
}

export function readAllSourceResults(runId: string, cwd = process.cwd()): ScrapeSourceResult[] {
  return listSourceResultIds(runId, cwd)
    .map((id) => readSourceResultIfExists(runId, id, cwd))
    .filter((r): r is ScrapeSourceResult => r != null)
}

export function readRunManifestIfExists(
  runId: string,
  cwd = process.cwd(),
): ScrapeRunManifest | null {
  const p = path.join(runDirForId(runId, cwd), 'run.json')
  if (!fs.existsSync(p)) return null
  return JSON.parse(fs.readFileSync(p, 'utf8')) as ScrapeRunManifest
}

/** Recompute aggregate stats from all per-source JSON in a run folder. */
export function recomputeRunStatsFromDisk(
  runId: string,
  sourcesTotal: number,
  cwd = process.cwd(),
): ScrapeRunManifest['stats'] {
  const results = readAllSourceResults(runId, cwd)
  return {
    sourcesTotal,
    sourcesAttempted: results.length,
    sourcesComplete: results.filter((r) => r.status === 'complete').length,
    sourcesSkipped: results.filter((r) => r.status === 'skipped').length,
    sourcesFailed: results.filter((r) => r.status === 'failed').length,
    pagesScraped: results.reduce((sum, r) => sum + (r.pagesScraped ?? 0), 0),
  }
}
