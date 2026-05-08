/**
 * Déduit la liste des pays récemment consultés à partir de `UserHistoryEvent`
 * (type `VIEW_COUNTRY`, payload `{ countryId: number }`).
 */

export type HistoryEventLike = {
  type: string
  payload: unknown
  createdAt?: string
}

function parseCountryIdFromPayload(payload: unknown): number | null {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) return null
  const raw = (payload as { countryId?: unknown }).countryId
  const n = typeof raw === 'number' ? raw : Number(raw)
  return Number.isFinite(n) ? n : null
}

/** IDs uniques, du plus récent au plus ancien, plafonnés à `max`. */
export function recentViewedCountryIdsFromHistory(events: readonly HistoryEventLike[], max = 12): number[] {
  const seen = new Set<number>()
  const out: number[] = []
  for (const e of events) {
    if (e.type !== 'VIEW_COUNTRY') continue
    const id = parseCountryIdFromPayload(e.payload)
    if (id === null || seen.has(id)) continue
    seen.add(id)
    out.push(id)
    if (out.length >= max) break
  }
  return out
}
