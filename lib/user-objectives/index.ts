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
  focusStripForObjective,
} from '@/lib/user-objectives/home-orchestration';
