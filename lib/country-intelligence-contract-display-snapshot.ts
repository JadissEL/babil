/**
 * B.29 — Marqueurs attendus sur la fiche pays publique pour les signaux du contrat d’intelligence.
 * Si un marqueur disparaît du fichier page sans mise à jour volontaire du contrat, le test CI échoue.
 */
export const COUNTRY_DETAIL_PAGE_CONTRACT_MARKERS = [
  'brutal_reality_score',
  'acceptance_rate_morocco',
  'friction_score',
  'confidence_score',
  'appointment_audit',
  'visa_system',
  'economy',
  'health',
  'work',
  '_intelligence',
  'morocco_insights',
  'embassy_behavior',
] as const

export type CountryDetailPageContractMarker = (typeof COUNTRY_DETAIL_PAGE_CONTRACT_MARKERS)[number]
