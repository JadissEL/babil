/** Public shape for `CountryInsight` rows returned from `GET /api/countries/[id]`. */

export type CountryDbInsightPublic = {
  id: number
  osint_insights: string | null
  real_world_friction: string | null
  community_sentiment: string | null
}

export function insightRowHasContent(row: CountryDbInsightPublic): boolean {
  const parts = [row.osint_insights, row.real_world_friction, row.community_sentiment]
  return parts.some((s) => typeof s === 'string' && s.trim().length > 0)
}

export function filterPublicCountryInsights(raw: unknown): CountryDbInsightPublic[] {
  if (!Array.isArray(raw)) return []
  const out: CountryDbInsightPublic[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const id = Number(o.id)
    if (!Number.isFinite(id)) continue
    out.push({
      id,
      osint_insights: typeof o.osint_insights === 'string' ? o.osint_insights : null,
      real_world_friction: typeof o.real_world_friction === 'string' ? o.real_world_friction : null,
      community_sentiment: typeof o.community_sentiment === 'string' ? o.community_sentiment : null,
    })
  }
  return out.filter(insightRowHasContent)
}
