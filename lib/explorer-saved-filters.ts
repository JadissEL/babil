export const EXPLORER_SAVED_FILTERS_STORAGE_KEY = 'vf_explorer_saved_filters_v1'
const KEY = EXPLORER_SAVED_FILTERS_STORAGE_KEY

export type ExplorerSavedFiltersV1 = {
  v: 1
  /** Recherche */
  q: string
  /** Param URL région (ex. schengen, europe) ou vide */
  region: string
  goal: string
  budget: string
  difficulty: string
  schengenOnly: boolean
  mode: 'explorer' | 'recommendation'
  savedAt: string
}

export function readExplorerSavedFilters(): ExplorerSavedFiltersV1 | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const o = JSON.parse(raw) as ExplorerSavedFiltersV1
    if (o?.v !== 1) return null
    if (typeof o.q !== 'string') return null
    if (typeof o.region !== 'string') return null
    if (typeof o.goal !== 'string') return null
    if (typeof o.budget !== 'string') return null
    if (typeof o.difficulty !== 'string') return null
    if (typeof o.schengenOnly !== 'boolean') return null
    if (o.mode !== 'explorer' && o.mode !== 'recommendation') return null
    return o
  } catch {
    return null
  }
}

export function writeExplorerSavedFilters(data: Omit<ExplorerSavedFiltersV1, 'v' | 'savedAt'>) {
  if (typeof window === 'undefined') return
  try {
    const payload: ExplorerSavedFiltersV1 = {
      v: 1,
      ...data,
      savedAt: new Date().toISOString(),
    }
    window.localStorage.setItem(KEY, JSON.stringify(payload))
  } catch {
    /* quota */
  }
}

export function clearExplorerSavedFilters() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

/** Construit la query string pour `/explorer` (sans `?`). */
export function buildExplorerQueryStringFromSaved(s: ExplorerSavedFiltersV1): string {
  const params = new URLSearchParams()
  const q = s.q.trim()
  if (q) params.set('q', q)
  if (s.region.trim()) params.set('region', s.region.trim())
  if (s.goal && s.goal !== 'all') params.set('goal', s.goal)
  if (s.budget && s.budget !== 'all') params.set('budget', s.budget)
  if (s.difficulty && s.difficulty !== 'all' && ['Low', 'Medium', 'High', 'Extreme'].includes(s.difficulty)) {
    params.set('difficulty', s.difficulty)
  }
  if (s.schengenOnly) params.set('schengen', '1')
  if (s.mode === 'recommendation') params.set('mode', 'recommendation')
  return params.toString()
}
