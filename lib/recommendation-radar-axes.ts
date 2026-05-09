/**
 * Textes d’aide pour le radar reco — alignés sur `app/api/recommendation/route.ts`
 * (visa pondéré par objectif, friction inversée, goal match, risque de refus).
 */
export const RECO_RADAR_AXIS_DESCRIPTIONS: Record<string, string> = {
  Visa:
    'Score visa pour votre objectif (tourisme, études, travail ou affaires), avec pénalités / bonus financiers et de profil (revenu, épargne, CNSS, famille UE) comme dans le moteur.',
  Friction:
    'Facilité administrative : rendez-vous, délais moyens et transparence. Plus la valeur est haute, moins le parcours consulaire est pénalisant.',
  Objectif:
    'Adéquation entre l’objectif déclaré dans votre profil et ce que la fiche pays ouvre (formations, business, cours courts, doctorat structuré, etc.).',
  'Anti-risque':
    '100 moins le risque de refus agrégé du moteur. Une valeur élevée signifie un risque perçu plus faible pour votre combinaison profil / pays.',
}
