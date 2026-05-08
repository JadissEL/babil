import type { CompareObjectiveId } from '@/lib/compare-objectives'

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

export function compareHrefForExplorerGoal(goal: string): string {
  const obj = explorerGoalToCompareObjectiveId(goal)
  return obj ? `/compare?objective=${encodeURIComponent(obj)}` : '/compare'
}
