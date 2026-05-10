import { getObjectiveBySlug } from '@/lib/user-objectives/registry';
import type { UserGoalType } from '@/lib/user-profile-enums';

/**
 * Explorer UI + `?goal=` uses this union (see `app/(public)/explorer/page.tsx`).
 * Aligns with {@link UserGoalType} plus `education` for the filter bar only.
 */
export type ExplorerFilterGoal =
  | 'all'
  | 'tourism'
  | 'study'
  | 'work'
  | 'business'
  | 'education'
  | 'short_course';

/** Map engine bucket → explorer filter value (1:1 for current `UserGoalType`). */
export function explorerFilterGoalFromEngineGoal(goal: UserGoalType): Exclude<ExplorerFilterGoal, 'all'> {
  return goal as Exclude<ExplorerFilterGoal, 'all'>;
}

/**
 * Default Explorer `goal` for a stored primary objective slug.
 * Uses registry `explorerGoalDefault` (central config).
 */
export function explorerFilterGoalFromObjectiveSlug(
  slug: string | null | undefined,
): ExplorerFilterGoal {
  const o = getObjectiveBySlug(slug);
  if (!o) return 'all';
  const d = o.explorerGoalDefault;
  if (d === 'all') return 'all';
  return explorerFilterGoalFromEngineGoal(d);
}
