import { getObjectiveBySlug } from '@/lib/user-objectives/registry';
import type { UserGoalType } from '@/lib/user-profile-enums';
import { parseUserGoalType } from '@/lib/user-profile-enums';

/**
 * Resolve engine/UI goal when Prisma has `primary_objective_slug` but stale/empty `goal_type`.
 */
export function effectiveUserGoalTypeFromProfileFields(fields: {
  goal_type: string | null | undefined;
  primary_objective_slug?: string | null | undefined;
}): UserGoalType | null {
  const fromGoal = parseUserGoalType(fields.goal_type);
  if (fromGoal) return fromGoal;
  const slug =
    typeof fields.primary_objective_slug === 'string'
      ? fields.primary_objective_slug.trim()
      : '';
  return getObjectiveBySlug(slug)?.engineGoal ?? null;
}

/**
 * JSON `goal_type` for GET/POST profile: coalesce slug → goal; keep legacy “invalid string → tourism”.
 */
export function serializedGoalTypeForProfileResponse(fields: {
  goal_type: string | null | undefined;
  primary_objective_slug?: string | null | undefined;
}): UserGoalType | null {
  const coalesced = effectiveUserGoalTypeFromProfileFields(fields);
  if (coalesced) return coalesced;
  const trimmed = String(fields.goal_type ?? '').trim();
  if (!trimmed) return null;
  return parseUserGoalType(fields.goal_type) ?? 'tourism';
}

export function withResolvedGoalTypeOnProfileRecord(profile: Record<string, unknown>): Record<string, unknown> {
  const g = serializedGoalTypeForProfileResponse({
    goal_type: profile.goal_type as string | null | undefined,
    primary_objective_slug: profile.primary_objective_slug as string | null | undefined,
  });
  if (g == null) return profile;
  return { ...profile, goal_type: g };
}
