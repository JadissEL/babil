/**
 * Gabarit de provenance pour le pack décision « résident au Maroc, passeport marocain ».
 * Les valeurs factuelles vivent dans `full_data.morocco_research_pack` (JSON) — pas ici.
 */

/** Niveau de confiance attribué manuellement ou par workflow de validation */
export type VerificationTier =
  | 'unverified'
  | 'single_source'
  | 'cross_checked'
  | 'official_primary'

/** Une source vérifiable (URL + métadonnées de consultation). */
export type SourceRef = {
  url: string
  /** Titre ou libellé humain lisible */
  label?: string
  /** ISO 8601 date de consultations */
  retrievedAt?: string
  /** Type de document : loi, consulat, étude… */
  kind?: string
}

/**
 * Enveloppe recommandée pour une assertion exposée utilisateur :
 * évolution possible depuis chaînes brutes seules vers ce format sans changer la clé JSON.
 */
export type SourcedValue<T = unknown> = {
  value: T
  verification: VerificationTier
  /** Date de péremption conseillée ou dernière revue ISO */
  asOf?: string
  notes?: string
  sources?: SourceRef[]
}
