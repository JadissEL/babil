export type ApplicabilityCase = 'A' | 'B' | 'C' | 'D' | 'E'

export type ApplicabilityDecision = 'include' | 'exclude' | 'review'

export type MoroccoApplicabilityResult = {
  case: ApplicabilityCase
  decision: ApplicabilityDecision
  scope: string
  rationale: string
  evidenceObservationIds: string[]
  fieldPath: string
}
