/**
 * Single source for “primary interest” content lens across routes.
 * Users keep access to all site areas; each surface filters by this contract.
 */

import type { CompareObjectiveId } from '@/lib/compare-objectives';
import { userObjectiveSlugToCompareObjectiveId } from '@/lib/user-objectives/compare-bridge';
import { explorerFilterGoalFromObjectiveSlug } from '@/lib/user-objectives/explorer-filter-goal';
import type { ExplorerFilterGoal } from '@/lib/user-objectives/explorer-filter-goal';
import {
  getObjectiveBySlug,
  type UserObjectiveCategoryId,
  type UserObjectiveDefinition,
  type UserObjectiveSlug,
} from '@/lib/user-objectives/registry';

export type HubAffinityId =
  | 'tourism'
  | 'work'
  | 'studies'
  | 'training'
  | 'events'
  | 'business'
  | 'investment';

export type CountryScoreFocus = 'tourism' | 'study' | 'work' | 'business';

export type PerspectiveHubGateInfo = {
  hubLabel: string;
  primaryLabel: string;
  message: string;
};

export type PerspectiveContract = {
  slug: UserObjectiveSlug;
  explorerGoal: ExplorerFilterGoal;
  compareObjectiveId: CompareObjectiveId;
  hubAffinity: HubAffinityId;
  countryScoreFocus: CountryScoreFocus;
  /** Primary visa dimension for strapline / hero emphasis */
  primaryScoreFocus: CountryScoreFocus;
};

function hubAffinityFromCategory(categoryId: UserObjectiveCategoryId): HubAffinityId {
  switch (categoryId) {
    case 'tourism':
      return 'tourism';
    case 'work':
      return 'work';
    case 'studies':
      return 'studies';
    case 'training':
      return 'training';
    case 'events':
      return 'events';
    case 'business':
      return 'business';
    case 'investment_media_sports':
      return 'business';
    default:
      return 'tourism';
  }
}

function countryScoreFocusFromEngine(def: UserObjectiveDefinition): CountryScoreFocus {
  switch (def.engineGoal) {
    case 'tourism':
      return 'tourism';
    case 'work':
      return 'work';
    case 'business':
      return 'business';
    case 'study':
    case 'short_course':
    default:
      return 'study';
  }
}

export function perspectiveContractFromDefinition(
  def: UserObjectiveDefinition | null,
): PerspectiveContract | null {
  if (!def) return null;
  const compareObjectiveId = userObjectiveSlugToCompareObjectiveId(def.slug);
  if (!compareObjectiveId) return null;
  const explorerGoal = explorerFilterGoalFromObjectiveSlug(def.slug);
  const countryScoreFocus = countryScoreFocusFromEngine(def);
  return {
    slug: def.slug,
    explorerGoal,
    compareObjectiveId,
    hubAffinity: hubAffinityFromCategory(def.categoryId),
    countryScoreFocus,
    primaryScoreFocus: countryScoreFocus,
  };
}

export function perspectiveContractFromSlug(
  slug: string | null | undefined,
): PerspectiveContract | null {
  return perspectiveContractFromDefinition(getObjectiveBySlug(slug));
}

/** Major marketing / workspace hubs — always visible in nav when primary is set. */
export const MAJOR_NAV_HREFS = [
  '/explorer',
  '/schengen',
  '/compare',
  '/recommendations',
  '/recommendation-engine',
  '/services/delegated-applications',
  '/services/consultants',
  '/education',
  '/community',
  '/business',
  '/permis',
  '/investment',
  '/probability',
] as const;

function pathOnly(href: string): string {
  const p = href.split('?')[0]?.trim() || '/';
  return p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p;
}

function hubAffinityForPath(path: string): HubAffinityId | null {
  if (path === '/education' || path.startsWith('/education/')) return 'studies';
  if (path === '/business' || path.startsWith('/business/')) return 'business';
  if (path === '/investment' || path.startsWith('/investment/')) return 'investment';
  return null;
}

function hubAffinityMatchesPath(path: string, affinity: HubAffinityId): boolean {
  const hub = hubAffinityForPath(path);
  if (!hub) return true;
  if (hub === 'studies') {
    return affinity === 'studies' || affinity === 'training' || affinity === 'events';
  }
  if (hub === 'business') {
    return (
      affinity === 'work' ||
      affinity === 'business' ||
      affinity === 'investment'
    );
  }
  if (hub === 'investment') {
    return affinity === 'investment' || affinity === 'business';
  }
  return true;
}

/** Nav link shows in menu (full site access). */
export function isNavHrefVisible(_href: string, _contract: PerspectiveContract | null): boolean {
  return true;
}

/** Nav link leads to full in-perspective content (not a hub gate). */
export function isNavHrefActionable(
  href: string,
  contract: PerspectiveContract | null,
): boolean {
  if (!contract) return true;
  return hubAffinityMatchesPath(pathOnly(href), contract.hubAffinity);
}

/** @deprecated Use isNavHrefActionable — kept for existing imports during migration */
export function isExplorerNavHrefInPerspective(
  href: string,
  def: UserObjectiveDefinition | null,
): boolean {
  return isNavHrefActionable(href, perspectiveContractFromDefinition(def));
}

export function hubGateForPath(
  path: string,
  contract: PerspectiveContract | null,
): PerspectiveHubGateInfo | null {
  if (!contract) return null;
  const p = pathOnly(path);
  const hub = hubAffinityForPath(p);
  if (!hub || hubAffinityMatchesPath(p, contract.hubAffinity)) return null;

  const hubLabels: Record<HubAffinityId, string> = {
    tourism: 'Tourisme',
    work: 'Travail',
    studies: 'Études',
    training: 'Formations',
    events: 'Événements',
    business: 'Business',
    investment: 'Investissement',
  };

  const def = getObjectiveBySlug(contract.slug);
  const primaryLabel = def?.labelFr ?? contract.slug;

  return {
    hubLabel: hubLabels[hub],
    primaryLabel,
    message: `Ce module est orienté « ${hubLabels[hub]} ». Votre parcours actuel est « ${primaryLabel} » — les contenus ci-dessous ne correspondent pas à votre intérêt principal.`,
  };
}

export function countryScoreVisible(
  focus: CountryScoreFocus,
  contract: PerspectiveContract | null,
): 'primary' | 'secondary' | 'hidden' {
  if (!contract) return 'primary';
  if (focus === contract.primaryScoreFocus) return 'primary';
  return 'secondary';
}

export function orientationStraplineForPerspective(
  contract: PerspectiveContract | null,
  scores: { tourism: number; study: number; work: number },
): string {
  if (!contract) {
    if (scores.study >= 70) return 'Excellence Études & Mobilité';
    if (scores.work >= 70) return 'Talents & Carrière Internationale';
    if (scores.tourism >= 70) return 'Découverte & Tourisme';
    return 'Mobilité internationale';
  }
  switch (contract.primaryScoreFocus) {
    case 'tourism':
      return 'Découverte & Tourisme';
    case 'work':
      return 'Talents & Carrière Internationale';
    case 'business':
      return 'Business & investissement';
    case 'study':
    default:
      return 'Excellence Études & Mobilité';
  }
}

export function isPhdPerspectiveRelevant(contract: PerspectiveContract | null): boolean {
  if (!contract) return true;
  const def = getObjectiveBySlug(contract.slug);
  return def?.categoryId === 'studies';
}
