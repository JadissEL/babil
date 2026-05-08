/**
 * Central exports for visa / mobility scoring (models + DB 1–10 snapshots).
 * Prefer importing from here in agents and scripts to stay consistent with enrich + seed.
 */

export {
  businessMobilityToScalar01to10,
  businessRightsTo01to100,
  businessSetupTo01to100,
  computeBusinessMobility100,
  type BusinessMobilityInputs,
} from '@/lib/scoring/business-mobility'

export {
  computeStudyMobility100,
  educationAccessTo01to100,
  studyMobilityToScalar01to10,
  type StudyMobilityInputs,
} from '@/lib/scoring/study-mobility'

export {
  computeTourismMobility100,
  tourismDifficultyFriendliness01to100,
  tourismMobilityToScalar01to10,
  type TourismMobilityInputs,
} from '@/lib/scoring/tourism-mobility'

export { computeWorkMobility100, workMobilityToScalar01to10, type WorkMobilityInputs } from '@/lib/scoring/work-mobility'

export { mergeModelWithDbScalar01to100 } from '@/lib/scoring/scalar-override'
