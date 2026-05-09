/**
 * Indique si une date ISO (ex. `_intelligence.economy_materialized_at`) est récente.
 */
export function isEconomyIntelFresh(isoDate: string | null | undefined, maxAgeDays = 21): boolean {
  if (!isoDate || typeof isoDate !== 'string') return false
  const t = Date.parse(isoDate.trim())
  if (!Number.isFinite(t)) return false
  const ageMs = Date.now() - t
  return ageMs >= 0 && ageMs <= maxAgeDays * 864e5
}

export function formatIntelDateShortFr(isoDate: string): string {
  const t = Date.parse(isoDate.trim())
  if (!Number.isFinite(t)) return isoDate.trim()
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(t))
}
