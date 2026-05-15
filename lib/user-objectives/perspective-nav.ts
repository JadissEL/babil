/**
 * Global “primary objective” perspective: which hubs and PhD surfaces match the user’s choice.
 * Used by Nexus sidebar, marketing primary nav, home feature tiles, and country/education PhD blocks.
 */

import type { UserObjectiveDefinition } from '@/lib/user-objectives/registry';

function pathOnly(href: string): string {
  const p = href.split('?')[0]?.trim() || '/';
  return p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p;
}

/**
 * Hub links in sidebar / primary nav: hide destinations outside the active perspective.
 * When no primary objective is chosen yet, show the full map (onboarding).
 */
export function isExplorerNavHrefInPerspective(
  href: string,
  def: UserObjectiveDefinition | null,
): boolean {
  if (!def) return true;
  const path = pathOnly(href);

  if (path === '/education' || path.startsWith('/education/')) {
    return def.categoryId === 'studies' || def.categoryId === 'training' || def.categoryId === 'events';
  }
  if (path === '/business' || path.startsWith('/business/')) {
    return (
      def.categoryId === 'work' ||
      def.categoryId === 'business' ||
      def.categoryId === 'investment_media_sports'
    );
  }
  if (path === '/investment' || path.startsWith('/investment/')) {
    return (
      def.slug === 'investment' ||
      def.categoryId === 'business' ||
      def.categoryId === 'investment_media_sports'
    );
  }
  return true;
}

/** Doctorat / PhD promos, badges, and country doctorat routes (`/countries/.../doctorat`). */
export function isPhdPerspectiveRelevant(def: UserObjectiveDefinition | null): boolean {
  if (!def) return true;
  return def.categoryId === 'studies';
}
