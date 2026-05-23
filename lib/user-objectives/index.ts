export {
  USER_OBJECTIVES,
  USER_OBJECTIVE_SLUGS,
  type UserObjectiveDefinition,
  type UserObjectiveSlug,
  type UserObjectiveCategoryId,
  type ExplorerGoalParam,
  isUserObjectiveSlug,
  getObjectiveBySlug,
  listObjectivesGrouped,
} from '@/lib/user-objectives/registry';

export {
  HOME_FEATURE_KEYS,
  type HomeFeatureKey,
  homeHeroForObjective,
  homeFeatureOrderForObjective,
  visibleHomeFeatureKeysForObjective,
  focusStripForObjective,
} from '@/lib/user-objectives/home-orchestration';

export {
  isExplorerNavHrefInPerspective,
  isPhdPerspectiveRelevant,
} from '@/lib/user-objectives/perspective-nav';

export {
  USER_OBJECTIVE_TO_COMPARE_OBJECTIVE_ID,
  userObjectiveSlugToCompareObjectiveId,
} from '@/lib/user-objectives/compare-bridge';

export {
  effectiveUserGoalTypeFromProfileFields,
  serializedGoalTypeForProfileResponse,
  withResolvedGoalTypeOnProfileRecord,
} from '@/lib/user-objectives/profile-goal-coalesce';

export {
  objectiveChangeCopy,
  objectiveTransitionPhaseLabel,
  type ObjectiveChangeCopy,
} from '@/lib/user-objectives/change-copy';

/** Liens Explorer / Comparer (objectif + hubs verticaux) — réexport pratique depuis le module objectifs. */
export {
  BUSINESS_HUB_EXPLORER_HREF,
  businessHubExplorerHref,
  CTA_COMPARE_TOURISM_HREF,
  CTA_EXPLORE_HREF,
  ctaCompareHref,
  ctaExploreHref,
  EDUCATION_HUB_EXPLORER_HREF,
  educationHubExplorerHref,
  TOURISM_HUB_EXPLORER_HREF,
  tourismHubExplorerHref,
  WORK_HUB_EXPLORER_HREF,
  workHubExplorerHref,
} from '@/lib/cta-hrefs';
