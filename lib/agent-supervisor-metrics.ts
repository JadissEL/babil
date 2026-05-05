/**
 * Append-only supervisor metrics for evolution / child-agent analysis.
 * Path: `.agent-state/supervisor-metrics/events.jsonl`
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'

export const SUPERVISOR_METRICS_DIR = path.join(process.cwd(), '.agent-state', 'supervisor-metrics')
export const SUPERVISOR_EVENTS_FILE = path.join(SUPERVISOR_METRICS_DIR, 'events.jsonl')

const MAX_FILE_BYTES = Number(process.env.AGENT_SUPERVISOR_METRICS_MAX_BYTES || 50 * 1024 * 1024)

export type SupervisorMetricEvent = {
  kind: 'supervisor_task_complete'
  at: string
  contractVersion: string
  agentRole: 'supervisor'
  country: string
  taskId: string
  score: number
  criticalMissingCount: number
  gatePassed: boolean
  passCount: number
  elapsedMs: number
  childVersion: string
  childShadow?: {
    childScore: number
    supervisorScore: number
    childElapsedMs: number
    supervisorElapsedMs: number
    /** childScore - supervisorScore */
    scoreDelta: number
    /** supervisorElapsedMs - childElapsedMs (positive = child faster) */
    timeDeltaMs: number
    childPassesUsed: number
  } | null
}

async function trimFileIfHuge(filePath: string) {
  try {
    const st = await fs.stat(filePath)
    if (st.size <= MAX_FILE_BYTES) return
    const raw = await fs.readFile(filePath, 'utf8')
    const lines = raw.split('\n').filter(Boolean)
    const keep = lines.slice(-50_000)
    await fs.writeFile(filePath, `${keep.join('\n')}\n`, 'utf8')
  } catch {
    /* missing file */
  }
}

export async function appendSupervisorMetricEvent(event: SupervisorMetricEvent): Promise<void> {
  await fs.mkdir(SUPERVISOR_METRICS_DIR, { recursive: true })
  await trimFileIfHuge(SUPERVISOR_EVENTS_FILE)
  const line = `${JSON.stringify(event)}\n`
  await fs.appendFile(SUPERVISOR_EVENTS_FILE, line, 'utf8')
}
