/** Statuts workflow Assist candidatures — admin peut faire progresser */
export const DELEGATED_REQUEST_STATUSES = [
  'SUBMITTED',
  'IN_REVIEW',
  'IN_PROGRESS',
  'COMPLETED',
  'CLOSED',
  'REFUND_ELIGIBLE',
] as const

export type DelegatedRequestStatus = (typeof DELEGATED_REQUEST_STATUSES)[number]

export function isDelegatedRequestStatus(v: string): v is DelegatedRequestStatus {
  return (DELEGATED_REQUEST_STATUSES as readonly string[]).includes(v)
}
