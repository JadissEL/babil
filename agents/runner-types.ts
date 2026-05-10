import type { Domain } from '../lib/agent-adaptive-query'

export type TaskStatus = 'queued' | 'running' | 'done' | 'failed'

export type CountryTask = {
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

export type AgentState = {
  tasks: CountryTask[]
  generatedAt: string
  contractVersion: string
  /** Index into world-country-run-order.json; advances only after a terminal `done` or `failed` when sequential mode is active. */
  worldOrderCursor?: number
}
