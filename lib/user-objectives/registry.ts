/**
 * Central registry — single source of truth for “Primary User Objective” slugs.
 * UI, storage, API validation, and engine mapping derive from here (no scattered if/else).
 */

import type { UserGoalType } from '@/lib/user-profile-enums';

/** Explorer / home quick-filter `goal` query param (subset of UserGoalType + 'all'). */
export type ExplorerGoalParam = 'all' | UserGoalType;

export type UserObjectiveCategoryId =
  | 'tourism'
  | 'work'
  | 'studies'
  | 'training'
  | 'events'
  | 'business'
  | 'investment_media_sports';

export const USER_OBJECTIVE_SLUGS = [
  'tourism',
  'work',
  'studies_bachelor',
  'studies_master',
  'studies_phd',
  'training_short_technical',
  'training_long_technical',
  'training_language',
  'events',
  'business',
  'investment',
  'startup',
  'small_business_street_food',
  'creator_influencer_abroad',
  'sports_professional_abroad',
] as const;

export type UserObjectiveSlug = (typeof USER_OBJECTIVE_SLUGS)[number];

export type UserObjectiveDefinition = {
  slug: UserObjectiveSlug;
  labelFr: string;
  /** Short card subtitle in onboarding */
  teaserFr: string;
  categoryId: UserObjectiveCategoryId;
  categoryLabelFr: string;
  /**
   * Drives existing recommendation / probability engines (`UserProfile.goal_type` universe).
   * Granular objectives (e.g. PhD) map to the closest engine bucket until scoring v2.
   */
  engineGoal: UserGoalType;
  /** Default for Explorer + home quick filters */
  explorerGoalDefault: ExplorerGoalParam;
  /** Keys into `HOME_FEATURE_KEYS` ordering in home-orchestration */
  homeFeaturePriority: readonly string[];
  /** Copy for dynamic homepage “focus” strip */
  focusTopicsFr: readonly string[];
};

const R = (o: UserObjectiveDefinition) => o;

export const USER_OBJECTIVES: readonly UserObjectiveDefinition[] = [
  R({
    slug: 'tourism',
    labelFr: 'Tourisme',
    teaserFr: 'Visa visiteur, destinations, budget voyage',
    categoryId: 'tourism',
    categoryLabelFr: 'Tourisme',
    engineGoal: 'tourism',
    explorerGoalDefault: 'tourism',
    homeFeaturePriority: ['schengen', 'probability', 'compare', 'community', 'permis', 'delegated', 'recommendations'],
    focusTopicsFr: ['Visa tourisme & durée de séjour', 'Saisonnalité & coût de la destination', 'Sécurité & accueil', 'Attractions & mobilité locale'],
  }),
  R({
    slug: 'work',
    labelFr: 'Travail',
    teaserFr: 'Visa travail, employabilité, rendez-vous',
    categoryId: 'work',
    categoryLabelFr: 'Travail',
    engineGoal: 'work',
    explorerGoalDefault: 'work',
    homeFeaturePriority: ['probability', 'recommendations', 'compare', 'schengen', 'delegated', 'community', 'education', 'business', 'permis'],
    focusTopicsFr: ['Visa travail & titre de séjour', 'Délais & friction rendez-vous', 'Marché du travail local', 'Reconnaissance des diplômes'],
  }),
  R({
    slug: 'studies_bachelor',
    labelFr: 'Licence / Bachelor',
    teaserFr: 'Admissions, visa étudiant, coût de la vie',
    categoryId: 'studies',
    categoryLabelFr: 'Études',
    engineGoal: 'study',
    explorerGoalDefault: 'study',
    homeFeaturePriority: ['education', 'recommendations', 'probability', 'compare', 'schengen', 'delegated', 'community', 'business', 'permis'],
    focusTopicsFr: ['Admissions licence', 'Visa étudiant', 'Frais & logement', 'Droit au travail étudiant'],
  }),
  R({
    slug: 'studies_master',
    labelFr: 'Master',
    teaserFr: 'Programmes, financement, visa long séjour',
    categoryId: 'studies',
    categoryLabelFr: 'Études',
    engineGoal: 'study',
    explorerGoalDefault: 'study',
    homeFeaturePriority: ['education', 'recommendations', 'probability', 'compare', 'schengen', 'delegated', 'community', 'business', 'permis'],
    focusTopicsFr: ['Sélection Master & équivalences', 'Bourses & financement', 'Visa étudiant', 'Insertion post-diplôme'],
  }),
  R({
    slug: 'studies_phd',
    labelFr: 'Doctorat (PhD)',
    teaserFr: 'Laboratoires, financement, visa recherche',
    categoryId: 'studies',
    categoryLabelFr: 'Études',
    engineGoal: 'study',
    explorerGoalDefault: 'study',
    homeFeaturePriority: ['education', 'recommendations', 'probability', 'compare', 'schengen', 'delegated', 'community', 'business', 'permis'],
    focusTopicsFr: ['Supervision & laboratoires', 'Bourses / contrats doctoraux', 'Visa recherche & mobilité', 'Lien vers fiches doctorat pays'],
  }),
  R({
    slug: 'training_short_technical',
    labelFr: 'Formation technique courte',
    teaserFr: 'Séjours courts, certifications, visa adapté',
    categoryId: 'training',
    categoryLabelFr: 'Formations',
    engineGoal: 'short_course',
    explorerGoalDefault: 'short_course',
    homeFeaturePriority: ['education', 'compare', 'probability', 'schengen', 'recommendations', 'community', 'business', 'delegated', 'permis'],
    focusTopicsFr: ['Durée & type de visa court séjour', 'Écoles & certifications', 'Budget compact', 'Suite possible (emploi / long séjour)'],
  }),
  R({
    slug: 'training_long_technical',
    labelFr: 'Formation technique longue',
    teaserFr: 'Programmes longs, visa étudiant / formation',
    categoryId: 'training',
    categoryLabelFr: 'Formations',
    engineGoal: 'study',
    explorerGoalDefault: 'study',
    homeFeaturePriority: ['education', 'recommendations', 'probability', 'compare', 'schengen', 'delegated', 'community', 'business', 'permis'],
    focusTopicsFr: ['Programmes & alternance', 'Visa étudiant / formation professionnelle', 'Coût total & logement', 'Perspectives emploi'],
  }),
  R({
    slug: 'training_language',
    labelFr: 'Cours de langue',
    teaserFr: 'Séjour linguistique, visa, écoles',
    categoryId: 'training',
    categoryLabelFr: 'Formations',
    engineGoal: 'study',
    explorerGoalDefault: 'study',
    homeFeaturePriority: ['education', 'compare', 'probability', 'schengen', 'recommendations', 'community', 'business', 'delegated', 'permis'],
    focusTopicsFr: ['Visa pour cours de langue', 'Intensifs vs longs parcours', 'Coût & hébergement', 'Passerelles vers études supérieures'],
  }),
  R({
    slug: 'events',
    labelFr: 'Événements',
    teaserFr: 'Salons, conférences, séjours brefs',
    categoryId: 'events',
    categoryLabelFr: 'Événements',
    engineGoal: 'short_course',
    explorerGoalDefault: 'short_course',
    homeFeaturePriority: ['compare', 'schengen', 'probability', 'education', 'recommendations', 'community', 'business', 'delegated', 'permis'],
    focusTopicsFr: ['Visa court séjour événementiel', 'Invitations & preuves', 'Saison & disponibilité des rendez-vous', 'Enchaînements voyage multi-pays'],
  }),
  R({
    slug: 'business',
    labelFr: 'Affaires & mobilité pro',
    teaserFr: 'Visa affaires, rendez-vous, risques',
    categoryId: 'business',
    categoryLabelFr: 'Business',
    engineGoal: 'business',
    explorerGoalDefault: 'business',
    homeFeaturePriority: ['business', 'investment', 'probability', 'compare', 'recommendations', 'schengen', 'delegated', 'community', 'permis'],
    focusTopicsFr: ['Visa affaires & multi-entrées', 'Friction administrative & rendez-vous', 'Réseaux & marchés', 'Installation longue durée (hors scope immédiat)'],
  }),
  R({
    slug: 'investment',
    labelFr: 'Investissement',
    teaserFr: 'Cadre fiscal, résidence, risques',
    categoryId: 'business',
    categoryLabelFr: 'Business',
    engineGoal: 'business',
    explorerGoalDefault: 'business',
    homeFeaturePriority: ['investment', 'business', 'recommendations', 'compare', 'probability', 'schengen', 'delegated', 'community', 'permis'],
    focusTopicsFr: ['Régimes d’investissement & résidence', 'Fiscalité indicative', 'Risque pays & stabilité', 'Visa affaires / investisseur (selon destination)'],
  }),
  R({
    slug: 'startup',
    labelFr: 'Startup',
    teaserFr: 'Écosystème, création, visa entrepreneur',
    categoryId: 'business',
    categoryLabelFr: 'Business',
    engineGoal: 'business',
    explorerGoalDefault: 'business',
    homeFeaturePriority: ['business', 'investment', 'recommendations', 'compare', 'probability', 'schengen', 'delegated', 'community', 'permis'],
    focusTopicsFr: ['Écosystèmes & accélérateurs', 'Formalités de création', 'Visa fondateur / travail autonome', 'Coût opérationnel & talents'],
  }),
  R({
    slug: 'small_business_street_food',
    labelFr: 'Petite entreprise / street food',
    teaserFr: 'Réglementation locale, visa, marchés',
    categoryId: 'business',
    categoryLabelFr: 'Business',
    engineGoal: 'business',
    explorerGoalDefault: 'business',
    homeFeaturePriority: ['business', 'compare', 'probability', 'recommendations', 'schengen', 'delegated', 'community', 'education', 'permis'],
    focusTopicsFr: ['Réglementation commerces & hygiene', 'Visa travail / indépendant', 'Réseaux de distribution', 'Risques opérationnels terrain'],
  }),
  R({
    slug: 'creator_influencer_abroad',
    labelFr: 'Créateur / influenceur à l’étranger',
    teaserFr: 'Tournage, télécoms, fiscalité créateur',
    categoryId: 'investment_media_sports',
    categoryLabelFr: 'Création & sport',
    engineGoal: 'business',
    explorerGoalDefault: 'business',
    homeFeaturePriority: ['business', 'compare', 'community', 'probability', 'recommendations', 'schengen', 'delegated', 'education', 'permis'],
    focusTopicsFr: ['Règles de tournage & drones (indicatif)', 'Qualité réseau & hubs créateurs', 'Visa affaires / travail hybride', 'Coût & visa Schengen multi-pays'],
  }),
  R({
    slug: 'sports_professional_abroad',
    labelFr: 'Sportif professionnel',
    teaserFr: 'Contrats, visa sportif, mobilité',
    categoryId: 'investment_media_sports',
    categoryLabelFr: 'Création & sport',
    engineGoal: 'work',
    explorerGoalDefault: 'work',
    homeFeaturePriority: ['probability', 'recommendations', 'compare', 'schengen', 'delegated', 'community', 'education', 'business', 'permis'],
    focusTopicsFr: ['Visa sportif / travail spécialisé', 'Contrats & agents', 'Double résidence fiscale (indicatif)', 'Santé & assurance'],
  }),
];

const bySlug = new Map<string, UserObjectiveDefinition>(
  USER_OBJECTIVES.map((o) => [o.slug, o]),
);

export function isUserObjectiveSlug(s: string): s is UserObjectiveSlug {
  return (USER_OBJECTIVE_SLUGS as readonly string[]).includes(s);
}

export function getObjectiveBySlug(slug: string | null | undefined): UserObjectiveDefinition | null {
  if (!slug || !isUserObjectiveSlug(slug)) return null;
  return bySlug.get(slug) ?? null;
}

export function listObjectivesGrouped(): Map<UserObjectiveCategoryId, UserObjectiveDefinition[]> {
  const m = new Map<UserObjectiveCategoryId, UserObjectiveDefinition[]>();
  for (const o of USER_OBJECTIVES) {
    const arr = m.get(o.categoryId) ?? [];
    arr.push(o);
    m.set(o.categoryId, arr);
  }
  return m;
}

/** Stable section order for onboarding and nav selectors (matches product areas). */
export const USER_OBJECTIVE_CATEGORY_ORDER: readonly UserObjectiveCategoryId[] = [
  'tourism',
  'work',
  'studies',
  'training',
  'events',
  'business',
  'investment_media_sports',
] as const;
