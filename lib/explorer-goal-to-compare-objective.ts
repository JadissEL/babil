import type { CompareObjectiveId } from '@/lib/compare-objectives'
import { explorerRegionToUrlParam, parseExplorerRegionFilter, type ExplorerRegionFilter } from '@/lib/explorer-filters'

/**
 * Maps Explorer “goal” filter to a sensible default compare objective for deep links.
 */
export function explorerGoalToCompareObjectiveId(goal: string): CompareObjectiveId | null {
  switch (goal) {
    case 'tourism':
      return 'tourism'
    case 'study':
      return 'studies_master'
    case 'work':
      return 'work'
    case 'business':
      return 'business'
    case 'education':
      return 'studies_bachelor'
    case 'short_course':
      return 'training_short_technical'
    default:
      return null
  }
}

export type CompareExplorerBudget = 'all' | 'low' | 'medium' | 'high'

/**
 * Build `/compare` URL with objective + optional explorer-style filters (used to bias suggestions on the compare page).
 */
export function compareHrefForExplorerPageState(args: {
  goal: string
  budget: CompareExplorerBudget
  region: ExplorerRegionFilter
  /** Explorer difficulty: `all` or `Low` | `Medium` | `High` | `Extreme` */
  difficulty: string
  schengenOnly: boolean
}): string {
  const { goal, budget, region, difficulty, schengenOnly } = args
  const params = new URLSearchParams()
  const obj = explorerGoalToCompareObjectiveId(goal)
  if (obj) params.set('objective', obj)
  if (budget !== 'all') params.set('budget', budget)
  if (region !== 'all') params.set('region', explorerRegionToUrlParam(region))
  if (difficulty !== 'all' && ['Low', 'Medium', 'High', 'Extreme'].includes(difficulty)) {
    params.set('difficulty', difficulty)
  }
  if (schengenOnly) params.set('schengen', '1')
  const q = params.toString()
  return q ? `/compare?${q}` : '/compare'
}

export function compareHrefForExplorerGoal(goal: string): string {
  return compareHrefForExplorerPageState({
    goal,
    budget: 'all',
    region: 'all',
    difficulty: 'all',
    schengenOnly: false,
  })
}

function homeRegionToExplorerRegion(region: string): ExplorerRegionFilter {
  if (!region || region === 'all') return 'all'
  const key = region === 'Schengen' ? 'schengen' : region.toLowerCase()
  return parseExplorerRegionFilter(key)
}

function isHomeBudget(v: string): v is Exclude<CompareExplorerBudget, 'all'> {
  return v === 'low' || v === 'medium' || v === 'high'
}

/**
 * Deep link from home quick filters: objective + same explorer-style constraints for suggestion biasing on /compare.
 */
export function compareHrefForHomeQuickFilters(goal: string, budget: string, region: string, risk: string): string {
  const difficulty =
    risk === 'all' ? 'all' : risk === 'low' ? 'Low' : risk === 'medium' ? 'Medium' : 'High'
  return compareHrefForExplorerPageState({
    goal,
    budget: isHomeBudget(budget) ? budget : 'all',
    region: homeRegionToExplorerRegion(region),
    difficulty,
    schengenOnly: false,
  })
}
