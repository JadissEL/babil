/**
 * Public objective UI — import pickers, flow, and hooks from `@/components/objectives`.
 *
 * @example
 * import {
 *   DockObjectivePicker,
 *   useObjectivePreference,
 *   useObjectiveChangeFlow,
 * } from '@/components/objectives';
 */

export { DockObjectivePicker, type DockObjectivePickerVariant } from './DockObjectivePicker';
export { FirstVisitObjectiveWizard } from './FirstVisitObjectiveWizard';
export { HeaderObjectiveSelector } from './HeaderObjectiveSelector';
export { ObjectiveChangeDisclaimer } from './ObjectiveChangeDisclaimer';
export {
  ObjectiveChangeFlow,
  useObjectiveChangeFlow,
  useObjectiveChangeFlowOptional,
  type ObjectiveChangePhase,
  type PendingObjectiveChange,
} from './ObjectiveChangeFlow';
export {
  ObjectivePreferenceProvider,
  useObjectivePreference,
  useObjectivePreferenceOptional,
} from './ObjectivePreferenceProvider';
export { ObjectiveTransitionOverlay } from './ObjectiveTransitionOverlay';
