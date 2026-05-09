/**
 * C.42 — Alertes `EnrichmentRun` : runs bloqués (sans `finishedAt`) et échecs récents.
 * Seuils partagés API admin, UI et script CI.
 */

/** Run considéré bloqué si toujours PENDING/RUNNING après ce délai depuis `startedAt`. */
export const STALE_ENRICHMENT_RUN_MS = 2 * 60 * 60 * 1000 // 2 h

/** Fenêtre pour lister les runs FAILED / PARTIAL dans l’UI et le script de garde. */
export const FAILED_ENRICHMENT_LOOKBACK_MS = 14 * 24 * 60 * 60 * 1000 // 14 j

export type EnrichmentRunAlertLevel = 'ok' | 'warning' | 'critical'

const STUCK_STATUSES = ['PENDING', 'RUNNING'] as const

export function isStuckEnrichmentStatus(status: string): boolean {
  return (STUCK_STATUSES as readonly string[]).includes(status)
}

export function computeEnrichmentRunAlertLevel(input: {
  staleRunCount: number
  recentFailedOrPartialCount: number
  lastRunStatus: string | null
}): EnrichmentRunAlertLevel {
  if (input.staleRunCount > 0) return 'critical'
  if (input.recentFailedOrPartialCount > 0) return 'warning'
  if (input.lastRunStatus === 'FAILED' || input.lastRunStatus === 'PARTIAL') return 'warning'
  return 'ok'
}
