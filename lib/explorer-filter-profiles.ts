/**
 * Per–primary-objective Explorer filter profiles: which controls to show and how to match countries.
 */

import type { CompareObjectiveId } from '@/lib/compare-objectives';
import type { CompareSignalId } from '@/lib/compare-signals';
import { userObjectiveSlugToCompareObjectiveId } from '@/lib/user-objectives/compare-bridge';
import type { CountryScoreFocus } from '@/lib/user-objectives/perspective-contract';
import {
  getObjectiveBySlug,
  isUserObjectiveSlug,
  USER_OBJECTIVES,
  type UserObjectiveSlug,
} from '@/lib/user-objectives/registry';

export type ExplorerFilterDimensionId =
  | 'region'
  | 'schengen'
  | 'difficulty'
  | 'friction'
  | 'budgetBand'
  | 'moduleAccess';

export type ExplorerFilterProfileLabels = {
  primaryScore?: string;
  difficulty?: string;
  friction?: string;
  budgetBand?: string;
  moduleAccess?: string;
};

export type ExplorerPrimaryGateSource = 'enrichedVisa' | 'dbScalar' | 'weighted';

export type ExplorerFilterProfile = {
  slug: UserObjectiveSlug | null;
  compareObjectiveId: CompareObjectiveId;
  primaryScoreFocus: CountryScoreFocus;
  /** How the primary gate score is read (tourism uses DB scalar — model merge is too flat). */
  primaryGateSource?: ExplorerPrimaryGateSource;
  /** Minimum primary visa/signal score (0 = no gate). */
  primaryScoreMin: number;
  /** When set, raise `primaryScoreMin` to at least this percentile of DB scalars in the current list. */
  primaryGatePercentile?: number;
  /** Cap results to this share of the catalog (by DB primary scalar) after other gates — tourism DB scores cluster. */
  primaryGateMaxCatalogShare?: number;
  /** Optional extra gate on a compare signal (e.g. phdPresence). */
  moduleAccessSignal?: CompareSignalId;
  moduleAccessMin: number;
  dimensions: readonly ExplorerFilterDimensionId[];
  labels: ExplorerFilterProfileLabels;
  parcoursLabelFr: string;
};

const DEFAULT_PRIMARY_MIN = 48;

function profileForSlug(slug: UserObjectiveSlug): ExplorerFilterProfile {
  const def = getObjectiveBySlug(slug)!;
  const compareObjectiveId = userObjectiveSlugToCompareObjectiveId(slug)!;
  const focus: CountryScoreFocus =
    def.engineGoal === 'tourism'
      ? 'tourism'
      : def.engineGoal === 'work'
        ? 'work'
        : def.engineGoal === 'business'
          ? 'business'
          : 'study';

  const base = {
    slug,
    compareObjectiveId,
    primaryScoreFocus: focus,
    primaryScoreMin: DEFAULT_PRIMARY_MIN,
    moduleAccessMin: 48,
    parcoursLabelFr: def.labelFr,
  };

  switch (slug) {
    case 'tourism':
      return {
        ...base,
        primaryGateSource: 'dbScalar',
        primaryScoreMin: 56,
        primaryGatePercentile: 55,
        primaryGateMaxCatalogShare: 0.62,
        dimensions: ['region', 'schengen', 'difficulty', 'budgetBand'],
        labels: {
          primaryScore: 'Score visa tourisme',
          difficulty: 'Exigence visa / RDV',
          budgetBand: 'Budget voyage (indicatif)',
        },
        moduleAccessSignal: undefined,
        moduleAccessMin: 0,
      };
    case 'work':
    case 'sports_professional_abroad':
      return {
        ...base,
        dimensions: ['region', 'schengen', 'friction', 'budgetBand'],
        labels: {
          primaryScore: 'Score visa travail',
          friction: 'Délais & friction RDV',
          budgetBand: 'Coût séjour (indicatif)',
        },
        moduleAccessSignal: undefined,
        moduleAccessMin: 0,
      };
    case 'studies_bachelor':
    case 'studies_master':
      return {
        ...base,
        dimensions: ['region', 'schengen', 'friction', 'budgetBand'],
        labels: {
          primaryScore: 'Score visa études',
          friction: 'Friction dossier & RDV',
          budgetBand: 'Coût séjour étudiant',
        },
        moduleAccessSignal: undefined,
        moduleAccessMin: 0,
      };
    case 'studies_phd':
      return {
        ...base,
        primaryScoreMin: 45,
        dimensions: ['region', 'schengen', 'friction', 'budgetBand', 'moduleAccess'],
        labels: {
          primaryScore: 'Score visa études / recherche',
          friction: 'Friction dossier & RDV',
          budgetBand: 'Coût séjour doctorat',
          moduleAccess: 'Données doctorat sur la fiche',
        },
        moduleAccessSignal: 'phdPresence',
        moduleAccessMin: 50,
      };
    case 'training_short_technical':
      return {
        ...base,
        primaryScoreFocus: 'study',
        dimensions: ['region', 'schengen', 'difficulty', 'budgetBand', 'moduleAccess'],
        labels: {
          primaryScore: 'Accès formation courte',
          difficulty: 'Exigence visa court séjour',
          budgetBand: 'Budget séjour',
          moduleAccess: 'Formations courtes (données)',
        },
        moduleAccessSignal: 'shortCourses',
        moduleAccessMin: 48,
      };
    case 'training_long_technical':
      return {
        ...base,
        dimensions: ['region', 'schengen', 'friction', 'budgetBand', 'moduleAccess'],
        labels: {
          primaryScore: 'Score visa études / formation',
          friction: 'Friction dossier & RDV',
          budgetBand: 'Coût formation longue',
          moduleAccess: 'Formation technique (données)',
        },
        moduleAccessSignal: 'technicalTraining',
        moduleAccessMin: 48,
      };
    case 'events':
      return {
        ...base,
        primaryScoreFocus: 'tourism',
        dimensions: ['region', 'schengen', 'difficulty', 'budgetBand'],
        labels: {
          primaryScore: 'Score visa visiteur / événement',
          difficulty: 'Exigence visa court séjour',
          budgetBand: 'Budget séjour',
        },
        moduleAccessSignal: undefined,
        moduleAccessMin: 0,
      };
    case 'training_language':
      return {
        ...base,
        primaryScoreFocus: 'study',
        dimensions: ['region', 'schengen', 'friction', 'budgetBand', 'moduleAccess'],
        labels: {
          primaryScore: 'Score visa études / langue',
          friction: 'Délais de traitement',
          budgetBand: 'Budget séjour linguistique',
          moduleAccess: 'Écoles de langue (données)',
        },
        moduleAccessSignal: 'languageStudy',
        moduleAccessMin: 48,
      };
    case 'business':
    case 'investment':
    case 'startup':
    case 'creator_influencer_abroad':
      return {
        ...base,
        primaryScoreFocus: 'business',
        dimensions: ['region', 'schengen', 'friction', 'budgetBand'],
        labels: {
          primaryScore: 'Score visa affaires',
          friction: 'Friction administrative',
          budgetBand: 'Coût opérationnel',
        },
        moduleAccessSignal: undefined,
        moduleAccessMin: 0,
      };
    case 'small_business_street_food':
      return {
        ...base,
        primaryScoreFocus: 'business',
        dimensions: ['region', 'schengen', 'friction', 'budgetBand', 'moduleAccess'],
        labels: {
          primaryScore: 'Score visa affaires',
          friction: 'Friction terrain & RDV',
          budgetBand: 'Budget lancement',
          moduleAccess: 'Street food / petite structure',
        },
        moduleAccessSignal: 'streetFood',
        moduleAccessMin: 45,
      };
    default:
      return {
        ...base,
        dimensions: ['region', 'schengen', 'difficulty', 'budgetBand'],
        labels: {
          primaryScore: 'Score principal',
          difficulty: 'Exigence visa',
          budgetBand: 'Budget indicatif',
        },
        moduleAccessSignal: undefined,
        moduleAccessMin: 0,
      };
  }
}

/** Unscoped browse — no primary score gate. */
export const EXPLORER_GENERIC_PROFILE: ExplorerFilterProfile = {
  slug: null,
  compareObjectiveId: 'tourism',
  primaryScoreFocus: 'tourism',
  primaryScoreMin: 0,
  moduleAccessMin: 0,
  dimensions: ['region', 'schengen', 'difficulty', 'budgetBand'],
  labels: {
    difficulty: 'Difficulté RDV',
    budgetBand: 'Budget indicatif',
  },
  parcoursLabelFr: 'Tous les parcours',
};

const PROFILES_BY_SLUG = new Map<UserObjectiveSlug, ExplorerFilterProfile>(
  USER_OBJECTIVES.map((o) => [o.slug, profileForSlug(o.slug)]),
);

export function getExplorerFilterProfileForSlug(
  slug: string | null | undefined,
): ExplorerFilterProfile | null {
  if (!slug || !isUserObjectiveSlug(slug)) return null;
  return PROFILES_BY_SLUG.get(slug) ?? null;
}

/** Coarse Explorer `goal` → default slug when `objective` absent. */
export function defaultSlugForExplorerGoal(goal: string): UserObjectiveSlug | null {
  switch (goal) {
    case 'tourism':
      return 'tourism';
    case 'study':
      return 'studies_master';
    case 'work':
      return 'work';
    case 'business':
      return 'business';
    case 'education':
      return 'studies_bachelor';
    case 'short_course':
      return 'training_short_technical';
    default:
      return null;
  }
}

export function listAllExplorerFilterProfiles(): ExplorerFilterProfile[] {
  return Array.from(PROFILES_BY_SLUG.values());
}

export function getExplorerFilterProfileForCompareObjectiveId(
  compareObjectiveId: CompareObjectiveId,
): ExplorerFilterProfile | null {
  return (
    Array.from(PROFILES_BY_SLUG.values()).find((p) => p.compareObjectiveId === compareObjectiveId) ??
    null
  );
}
