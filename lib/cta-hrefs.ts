import { userObjectiveSlugToCompareObjectiveId } from '@/lib/user-objectives/compare-bridge';
import { explorerFilterGoalFromObjectiveSlug } from '@/lib/user-objectives/explorer-filter-goal';

/** Liens d’appel à l’action réutilisables (empty states, onboarding). */
export const CTA_EXPLORE_HREF = '/explorer';
export const CTA_COMPARE_TOURISM_HREF = '/compare?objective=tourism';

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
