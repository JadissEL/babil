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

/** Dernière date ISO parmi les clés `*_materialized_at` sous `_intelligence`. */
export function latestMaterializedIsoFromIntelMeta(
  meta: Record<string, unknown> | undefined | null,
): string | null {
  if (!meta || typeof meta !== 'object') return null
  let bestT: number | null = null
  let bestIso: string | null = null
  for (const [k, v] of Object.entries(meta)) {
    if (!/_materialized_at$/i.test(k)) continue
    if (typeof v !== 'string' || !v.trim()) continue
    const t = Date.parse(v.trim())
    if (!Number.isFinite(t)) continue
    if (bestT === null || t > bestT) {
      bestT = t
      bestIso = new Date(t).toISOString()
    }
  }
  return bestIso
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
