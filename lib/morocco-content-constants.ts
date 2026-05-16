/**
 * Copy and sentinels for « lecteur marocain » — orientation without inventing legal facts.
 */

export const MOROCCO_PACK_VERSION = 'morocco-pack-v1' as const;

/** Short token used in UI + launch gate when no verified primary source exists. */
export const EXPLICIT_UNKNOWN_SHORT_FR =
  'À vérifier sur la source officielle (consulat / TLS / VFS) pour un dossier déposé depuis le Maroc.';

/** Honest default for acceptance / refusal rate (never fabricate percentages). */
export const EXPLICIT_UNKNOWN_ACCEPTANCE_FR =
  "Aucun taux public consolidé n'est publié par destination pour les passeports marocains. " +
  'Les statistiques dépendent du guichet, du motif et de la période — confirmez toujours sur le portail officiel.';

export const MOROCCO_REALITY_FALLBACK_FR =
  "Vue d'ensemble en cours d'affinage pour les profils marocains : combinez cette fiche avec les sources officielles ci-dessous avant de vous engager.";

export const MOROCCO_PRO_TIP_FALLBACK_FR =
  "Conservez l'URL et la date de chaque page officielle consultée : les procédures changent souvent.";

export const MOROCCO_DARIJA_NOTE_FALLBACK_FR =
  'Astuce pratique : notez en français et en arabe les intitulés des pièces demandées si vous déposez en personne.';

export const MOROCCO_SECTION_SCAFFOLD_SUMMARIES: Record<string, string> = {
  immigration_legal:
    "Immigration et séjours : ce bloc recense les questions qu'un ressortissant marocain vérifie en priorité (visa, durées, motifs). Seules les pages officielles font foi.",
  work_business:
    "Travail et entreprise : accès au marché du travail, création d'activité et contraintes administratives vus depuis le Maroc — à croiser avec les textes à jour.",
  education:
    'Études et formations : parcours fréquents (langue, technique, court) et implications visa pour un diplômé du système marocain.',
  costs_life_mad:
    'Budget indicatif (MAD) et coût de la vie : signaux statistiques et repères — pas un engagement financier personnel.',
  society_demographics:
    'Société, langues et intégration : contexte général pour préparer un départ ou un séjour prolongé.',
  mobility_transport:
    'Mobilité et vols depuis le Maroc : escales, compagnies et points de vigilance pratiques (sans garantie de disponibilité).',
  climate_geography:
    'Climat et territoire : lecture pratique pour valider sa logistique (saisons, distances).',
  special_programs:
    "Programmes spéciaux (quand ils existent) : toujours vérifier l'éligibilité d'un passeport MA.",
  driving_license_detail:
    "Permis marocain à l'étranger : conversions, IDP et durées selon votre statut sur place — sources officielles uniquement.",
  qualitative_moroccan_lens:
    'Retours de terrain (non légaux) : utiles pour anticiper le ressenti et les délais réels si sourcés.',
  extended_criteria:
    'Critères complémentaires (santé, banque, etc.) : orientation avant recherche approfondie.',
};
