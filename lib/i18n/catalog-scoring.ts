import type { BabilLocale } from './locale'

/**
 * Messages métier — pilote scoring / top drivers (B.38).
 * Clés stables ; texte par locale. Pas de concaténation en dehors de `interpolate` sur `driverLine`.
 */
export const scoringCatalog = {
  fr: {
    reco: {
      visa: 'Pilier visa (objectif + profil)',
      friction: 'Friction / rendez-vous',
      goalMatch: 'Adéquation objectif',
      antiRisk: 'Marge vs risque de refus',
    },
    proba: {
      finance: 'Profil financier',
      profession: 'Situation professionnelle',
      social: 'Liens sociaux / famille',
      countryContext: 'Contexte pays (acceptation + visa)',
      appointmentEase: 'Facilité des rendez-vous',
      riskImmigration: 'Risque immigration perçu',
    },
    /** Paramètres : label, sign, points */
    driverLine: '{label} : {sign}{points} pt (vs profil de référence neutre)',
  },
  en: {
    reco: {
      visa: 'Visa pillar (goal + profile)',
      friction: 'Friction / appointments',
      goalMatch: 'Goal match',
      antiRisk: 'Headroom vs perceived refusal risk',
    },
    proba: {
      finance: 'Financial profile',
      profession: 'Employment situation',
      social: 'Social / family ties',
      countryContext: 'Country context (acceptance + visa)',
      appointmentEase: 'Admin / appointment ease',
      riskImmigration: 'Perceived immigration risk',
    },
    driverLine: '{label}: {sign}{points} pts (vs neutral reference profile)',
  },
} as const

export type ScoringCatalog = (typeof scoringCatalog)[BabilLocale]

export function scoringMessages(locale: BabilLocale): ScoringCatalog {
  return scoringCatalog[locale]
}
