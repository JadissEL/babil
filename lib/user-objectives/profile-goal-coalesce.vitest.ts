import { describe, expect, it } from 'vitest';
import {
  effectiveUserGoalTypeFromProfileFields,
  serializedGoalTypeForProfileResponse,
  withResolvedGoalTypeOnProfileRecord,
} from '@/lib/user-objectives/profile-goal-coalesce';

describe('profile-goal-coalesce', () => {
  it('derives goal from primary_objective_slug when goal_type is empty', () => {
    expect(
      effectiveUserGoalTypeFromProfileFields({
        goal_type: null,
        primary_objective_slug: 'studies_master',
      }),
    ).toBe('study');
  });

  it('keeps a valid goal_type over slug', () => {
    expect(
      effectiveUserGoalTypeFromProfileFields({
        goal_type: 'work',
        primary_objective_slug: 'studies_master',
      }),
    ).toBe('work');
  });

  it('serialized uses legacy tourism fallback for invalid non-empty goal without slug', () => {
    expect(
      serializedGoalTypeForProfileResponse({
        goal_type: 'not-a-valid-enum-value',
        primary_objective_slug: null,
      }),
    ).toBe('tourism');
  });

  it('serialized prefers slug when stored goal_type is invalid', () => {
    expect(
      serializedGoalTypeForProfileResponse({
        goal_type: 'garbage',
        primary_objective_slug: 'work',
      }),
    ).toBe('work');
  });

  it('withResolvedGoalTypeOnProfileRecord injects coalesced goal_type', () => {
    const out = withResolvedGoalTypeOnProfileRecord({
      income: 5000,
      primary_objective_slug: 'tourism',
    });
    expect(out.goal_type).toBe('tourism');
    expect(out.income).toBe(5000);
  });
});
