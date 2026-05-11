import {
  explorerCountryIsSchengenMember,
  matchesExplorerRegionFilter,
} from '@/lib/explorer-filters'

export type RegionScoreBucket = {
  key: string
  label: string
  avgScore: number
  countryCount: number
}

type Row = { name: string; region: string; _finalScore: number }

/**
 * Moyennes de score Babil par grande zone (catalogue complet), pour une vue type heatmap légère.
 */
export function buildExplorerRegionScoreBuckets(rows: Row[]): RegionScoreBucket[] {
  const defs: { key: string; label: string; test: (r: Row) => boolean }[] = [
    { key: 'schengen', label: 'Schengen', test: (r) => explorerCountryIsSchengenMember(r.name) },
    { key: 'europe', label: 'Europe', test: (r) => matchesExplorerRegionFilter('Europe', r) },
    { key: 'asia', label: 'Asie', test: (r) => matchesExplorerRegionFilter('Asia', r) },
    { key: 'africa', label: 'Afrique', test: (r) => matchesExplorerRegionFilter('Africa', r) },
    { key: 'americas', label: 'Amériques', test: (r) => matchesExplorerRegionFilter('Americas', r) },
    { key: 'oceania', label: 'Océanie', test: (r) => matchesExplorerRegionFilter('Oceania', r) },
  ]

  return defs.map(({ key, label, test }) => {
    const subset = rows.filter(test)
    const n = subset.length
    const sum = subset.reduce((s, r) => s + r._finalScore, 0)
    const avg = n ? sum / n : 0
    return {
      key,
      label,
      avgScore: Math.round(avg * 10) / 10,
      countryCount: n,
    }
  })
}
