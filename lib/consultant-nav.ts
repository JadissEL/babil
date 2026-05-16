import type { UserObjectiveDefinition } from '@/lib/user-objectives/registry';

/** Tourisme masque les raccourcis « Experts » — tous les autres objectifs les affichent. */
export function showConsultantMarketplaceNav(def: UserObjectiveDefinition | null): boolean {
  if (!def) return true;
  return def.categoryId !== 'tourism';
}
