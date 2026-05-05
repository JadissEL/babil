/**
 * Offline: read `.agent-state/supervisor-metrics/events.jsonl` and emit
 * `patterns.v{n}.json` under `.agent-state/child-agent/` (deterministic aggregates only).
 *
 * Usage: `npm run agent:extract-patterns`
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'

const METRICS_FILE = path.join(process.cwd(), '.agent-state', 'supervisor-metrics', 'events.jsonl')
const CHILD_DIR = path.join(process.cwd(), '.agent-state', 'child-agent')

type LineEvent = {
  kind?: string
  country?: string
  score?: number
  criticalMissingCount?: number
  gatePassed?: boolean
  passCount?: number
  elapsedMs?: number
  childShadow?: {
    childScore: number
    supervisorScore: number
    scoreDelta: number
    timeDeltaMs: number
  } | null
}

async function nextPatternsVersion(): Promise<number> {
  await fs.mkdir(CHILD_DIR, { recursive: true })
  const names = await fs.readdir(CHILD_DIR).catch(() => [] as string[])
  let max = 0
  for (const n of names) {
    const m = /^patterns\.v(\d+)\.json$/.exec(n)
    if (m) max = Math.max(max, Number(m[1]))
  }
  return max + 1
}

async function main() {
  let raw = ''
  try {
    raw = await fs.readFile(METRICS_FILE, 'utf8')
  } catch {
    console.error(`[agent:extract-patterns] missing metrics file: ${METRICS_FILE}`)
    process.exit(1)
  }

  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean)
  const events: LineEvent[] = []
  for (const line of lines) {
    try {
      events.push(JSON.parse(line) as LineEvent)
    } catch {
      /* skip corrupt */
    }
  }

  const completed = events.filter((e) => e.kind === 'supervisor_task_complete')
  const criticalHistogram: Record<string, number> = {}
  let stagnationHints = 0
  let shadowBetterScore = 0
  let shadowFaster = 0

  for (const e of completed) {
    if (e.childShadow && e.childShadow.scoreDelta > 0) shadowBetterScore += 1
    if (e.childShadow && e.childShadow.timeDeltaMs > 0) shadowFaster += 1
    if (
      typeof e.passCount === 'number' &&
      e.passCount >= 3 &&
      typeof e.score === 'number' &&
      e.score < 70
    ) {
      stagnationHints += 1
    }
  }

  const byCountry = new Map<string, LineEvent[]>()
  for (const e of completed) {
    const c = typeof e.country === 'string' ? e.country : ''
    if (!c) continue
    const arr = byCountry.get(c) ?? []
    arr.push(e)
    byCountry.set(c, arr)
  }

  for (const [, arr] of Array.from(byCountry.entries())) {
    if (arr.length < 2) continue
    const last = arr[arr.length - 1]
    const prev = arr[arr.length - 2]
    if (
      typeof last.score === 'number' &&
      typeof prev.score === 'number' &&
      last.score <= prev.score &&
      (last.criticalMissingCount ?? 0) > 0
    ) {
      criticalHistogram['_stagnation_or_plateau'] = (criticalHistogram['_stagnation_or_plateau'] ?? 0) + 1
    }
  }

  const topByCritical = Array.from(byCountry.entries())
    .map(([country, arr]) => ({
      country,
      maxCritical: Math.max(...arr.map((x: LineEvent) => x.criticalMissingCount ?? 0)),
    }))
    .sort((a, b) => b.maxCritical - a.maxCritical)
    .slice(0, 20)

  const v = await nextPatternsVersion()
  const out = {
    generatedAt: new Date().toISOString(),
    sourceLines: lines.length,
    eventsUsed: completed.length,
    aggregates: {
      shadowChildHigherScoreCount: shadowBetterScore,
      shadowChildFasterCount: shadowFaster,
      highPassLowScoreCycles: stagnationHints,
      criticalHistogram,
    },
    topCountriesByMaxCriticalMissing: topByCritical,
    notes:
      'Derived only from supervisor metrics JSONL. Use with conservative thresholds before promoting child policy.',
  }

  const outPath = path.join(CHILD_DIR, `patterns.v${v}.json`)
  await fs.mkdir(CHILD_DIR, { recursive: true })
  await fs.writeFile(outPath, `${JSON.stringify(out, null, 2)}\n`, 'utf8')
  const latestPath = path.join(CHILD_DIR, 'patterns.latest.json')
  await fs.writeFile(latestPath, `${JSON.stringify(out, null, 2)}\n`, 'utf8')
  console.log(`[agent:extract-patterns] wrote ${outPath} and patterns.latest.json`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
