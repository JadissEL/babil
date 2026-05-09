/**
 * B.27 — Référence unique des échelles (évite de mélanger 1–10 stocké vs 0–100 moteur / UI).
 *
 * | Surface | Échelle | Notes |
 * |--------|---------|--------|
 * | Colonnes Prisma `*_visa_score` | **1–10** | Snapshots persistés ; fusionnés avec le modèle → 0–100 en lecture. |
 * | `full_data.friction_score` | **0–100** | Plus bas = parcours plus fluide. |
 * | `full_data.brutal_reality_score` | **0–10** | Converti en contribution 0–100 dans le moteur proba (`×10` sur risque). |
 * | Moteurs reco / proba / enrich UI | **0–100** | Scores affichés, breakdown, barres. |
 * | `UserProfile` / profil formulaire | Hors scope | Revenus / épargne en unités métier, pas des « scores ». |
 */

export const SCALE_VISA_PRISMA_MIN = 1
export const SCALE_VISA_PRISMA_MAX = 10

export const SCALE_ENGINE_MIN = 0
export const SCALE_ENGINE_MAX = 100

export const SCALE_BRUTAL_REALITY_MIN = 0
export const SCALE_BRUTAL_REALITY_MAX = 10

/** Libellés courts pour l’UI (fiche pays, imprimable, tooltips). */
export const SCORE_SCALE_LEGEND_FR = {
  /** Sous-titre bloc barres visa sur la fiche */
  visaBarsSubtitle: 'Échelle 0–100 — fusion modèle + données (aligné moteur recommandation / explorateur).',
  /** Sous-titre tableau imprimable */
  printTableSubtitle:
    'Tous les scores du tableau sont sur 0–100 (même base que les barres visa et le score final).',
  /** Légende sous les tuiles « réalité / acceptation / friction / confiance » */
  terrainTilesCaption:
    'Échelles fiche : réalité terrain 0–10 · friction administrative 0–100 · confiance données 0–100 (l’acceptation reste un libellé indicateur, pas un score normalisé).',
  /** Rappel stockage Prisma (admin / doc) */
  prismaVisaColumns:
    'En base, les colonnes visa (`tourist_visa_score`, etc.) sont des snapshots 1–10 ; l’app les projette en 0–100 pour l’affichage et les moteurs.',
} as const
