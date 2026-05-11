import { userObjectiveSlugToCompareObjectiveId } from '@/lib/user-objectives/compare-bridge';
import { explorerFilterGoalFromObjectiveSlug } from '@/lib/user-objectives/explorer-filter-goal';
import { getObjectiveBySlug } from '@/lib/user-objectives/registry';

/** Liens d’appel à l’action réutilisables (empty states, onboarding). */
export const CTA_EXPLORE_HREF = '/explorer';
export const CTA_COMPARE_TOURISM_HREF = '/compare?objective=tourism';

/** Default Explorer funnel from the education hub when le profil n’est pas déjà orienté études / formation. */
export const EDUCATION_HUB_EXPLORER_HREF = '/explorer?goal=education';

function isEducationHubAlignedObjectiveSlug(slug: string | null | undefined): boolean {
  const c = getObjectiveBySlug(slug)?.categoryId;
  return c === 'studies' || c === 'training';
}

/**
 * Lien « Explorer » depuis le hub Éducation : garde `?goal=education` pour la découverte,
 * sauf si l’objectif principal est déjà dans les catégories études / formation (alors même logique que {@link ctaExploreHref}).
 */
export function educationHubExplorerHref(primaryObjectiveSlug: string | null | undefined): string {
  if (isEducationHubAlignedObjectiveSlug(primaryObjectiveSlug)) {
    return ctaExploreHref(primaryObjectiveSlug);
  }
  return EDUCATION_HUB_EXPLORER_HREF;
}

/** Funnel Explorer depuis le hub Business (objectifs non encore « affaires » dans le registre). */
export const BUSINESS_HUB_EXPLORER_HREF = '/explorer?goal=business';

function isBusinessHubAlignedObjectiveSlug(slug: string | null | undefined): boolean {
  return getObjectiveBySlug(slug)?.explorerGoalDefault === 'business';
}

/**
 * Lien « Explorer » depuis le hub Business : `?goal=business` par défaut,
 * sauf si l’objectif principal a déjà `explorerGoalDefault === 'business'` dans le registre.
 */
export function businessHubExplorerHref(primaryObjectiveSlug: string | null | undefined): string {
  if (isBusinessHubAlignedObjectiveSlug(primaryObjectiveSlug)) {
    return ctaExploreHref(primaryObjectiveSlug);
  }
  return BUSINESS_HUB_EXPLORER_HREF;
}

/** Funnel Explorer pour parcours « travail / visa pro » (hors objectifs déjà filtre travail au registre). */
export const WORK_HUB_EXPLORER_HREF = '/explorer?goal=work';

function isWorkHubAlignedObjectiveSlug(slug: string | null | undefined): boolean {
  return getObjectiveBySlug(slug)?.explorerGoalDefault === 'work';
}

/**
 * Lien « Explorer » pour un hub ou CTA orienté travail : `?goal=work` par défaut,
 * sauf si l’objectif principal a déjà `explorerGoalDefault === 'work'`.
 */
export function workHubExplorerHref(primaryObjectiveSlug: string | null | undefined): string {
  if (isWorkHubAlignedObjectiveSlug(primaryObjectiveSlug)) {
    return ctaExploreHref(primaryObjectiveSlug);
  }
  return WORK_HUB_EXPLORER_HREF;
}

/** Funnel Explorer pour parcours tourisme (hors objectif tourisme explicite au registre). */
export const TOURISM_HUB_EXPLORER_HREF = '/explorer?goal=tourism';

function isTourismHubAlignedObjectiveSlug(slug: string | null | undefined): boolean {
  return getObjectiveBySlug(slug)?.explorerGoalDefault === 'tourism';
}

/**
 * Lien « Explorer » pour un hub ou CTA orienté tourisme : `?goal=tourism` par défaut,
 * sauf si l’objectif principal a déjà `explorerGoalDefault === 'tourism'`.
 */
export function tourismHubExplorerHref(primaryObjectiveSlug: string | null | undefined): string {
  if (isTourismHubAlignedObjectiveSlug(primaryObjectiveSlug)) {
    return ctaExploreHref(primaryObjectiveSlug);
  }
  return TOURISM_HUB_EXPLORER_HREF;
}

/** Explorer avec filtre `goal` aligné sur l’objectif principal (ou générique). */
export function ctaExploreHref(primaryObjectiveSlug: string | null | undefined): string {
  const g = explorerFilterGoalFromObjectiveSlug(primaryObjectiveSlug);
  if (g === 'all') return CTA_EXPLORE_HREF;
  return `/explorer?goal=${encodeURIComponent(g)}`;
}

/** Comparer avec l’objectif feuille mappé depuis le slug onboarding / profil. */
export function ctaCompareHref(primaryObjectiveSlug: string | null | undefined): string {
  const id = userObjectiveSlugToCompareObjectiveId(primaryObjectiveSlug ?? null);
  if (!id) return CTA_COMPARE_TOURISM_HREF;
  return `/compare?objective=${encodeURIComponent(id)}`;
}
