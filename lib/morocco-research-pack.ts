/**
 * Arborescence `full_data.morocco_research_pack` — décision voyage / études / travail / installation
 * pour utilisateur résidant au Maroc (sans données inventées ici ; coquille vide par défaut).
 */

import type { SourcedValue } from '@/lib/morocco-research-evidence'

/** Bloc thématique : résumé libre + entrées sourcées optionnelles. */
export type MoroccoResearchSectionBrief = {
  summary?: string
  /** Détail champ-par-champ (clé stable choisie par l’équipe recherche). */
  sourced_entries?: Record<string, SourcedValue<unknown>>
}

export type MoroccoResearchPack = {
  /**
   * Marqueur non vide conseillé dès qu’un pack est créé intentionnellement (ex. morocco-pack-v1).
   * Utilisé par le contrat de complétude « présence du pack ».
   */
  _pack_version?: string

  immigration_legal?: MoroccoResearchSectionBrief
  work_business?: MoroccoResearchSectionBrief
  education?: MoroccoResearchSectionBrief
  costs_life_mad?: MoroccoResearchSectionBrief
  society_demographics?: MoroccoResearchSectionBrief
  mobility_transport?: MoroccoResearchSectionBrief
  climate_geography?: MoroccoResearchSectionBrief
  special_programs?: MoroccoResearchSectionBrief
  driving_license_detail?: MoroccoResearchSectionBrief
  qualitative_moroccan_lens?: MoroccoResearchSectionBrief
  /** Agrégé des dizaines de critères additionnels avant éclatement futur */
  extended_criteria?: MoroccoResearchSectionBrief
}

/** Coquille sans texte trompeur : à remplir uniquement après recherche validée */
export function emptyMoroccoResearchPack(): MoroccoResearchPack {
  return {}
}
