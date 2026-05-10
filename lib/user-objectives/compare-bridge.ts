import type { CompareObjectiveId } from '@/lib/compare-objectives';
import {
  isUserObjectiveSlug,
  type UserObjectiveSlug,
} from '@/lib/user-objectives/registry';

/**
 * Maps onboarding / profile slugs (`lib/user-objectives/registry.ts`) to compare leaf IDs
 * (`lib/compare-objectives.ts`). Keep in sync when adding objectives on either side.
 */
export const USER_OBJECTIVE_TO_COMPARE_OBJECTIVE_ID: {
  [K in UserObjectiveSlug]: CompareObjectiveId;
} = {
  tourism: 'tourism',
  work: 'work',
  studies_bachelor: 'studies_bachelor',
  studies_master: 'studies_master',
  studies_phd: 'studies_phd',
  training_short_technical: 'training_short_technical',
  training_long_technical: 'training_long_technical',
  training_language: 'language_training',
  events: 'events',
  business: 'business',
  investment: 'investment',
  startup: 'startup',
  small_business_street_food: 'street_food_small_business',
  creator_influencer_abroad: 'creator_content',
  sports_professional_abroad: 'sports_pro',
};

export function userObjectiveSlugToCompareObjectiveId(
  slug: string | null | undefined,
): CompareObjectiveId | null {
  if (!slug || !isUserObjectiveSlug(slug)) return null;
  return USER_OBJECTIVE_TO_COMPARE_OBJECTIVE_ID[slug];
}
