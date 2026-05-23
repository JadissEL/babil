/**
 * Objective domain — registry, home orchestration, change copy, storage, transition canvas.
 *
 * @example
 * import {
 *   USER_OBJECTIVES,
 *   objectiveChangeCopy,
 *   readObjectivePreference,
 * } from '@/lib/objectives';
 */

export * from '@/lib/user-objectives';

export {
  EMPTY_OBJECTIVE_PREFERENCE,
  OBJECTIVE_PREFERENCE_EVENT,
  OBJECTIVE_PREFERENCE_STORAGE_KEY,
  markObjectiveWizardCompleted,
  readObjectivePreference,
  setPrimaryObjectiveSlug,
  writeObjectivePreference,
  type StoredObjectivePreferenceV1,
} from '@/lib/objective-preference-storage';

export {
  drawObjectiveTransitionFrame,
  prefersReducedMotion,
  type ObjectiveTransitionCanvasParams,
} from '@/lib/objective-transition-canvas';
