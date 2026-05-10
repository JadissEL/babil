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
