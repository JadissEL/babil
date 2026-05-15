import { isExplorerNavHrefInPerspective } from '@/lib/user-objectives/perspective-nav';
import type { UserObjectiveDefinition } from '@/lib/user-objectives/registry';
import { getObjectiveBySlug } from '@/lib/user-objectives/registry';

/** Stable keys for homepage feature tiles — mapped to links & icons in HomeExperience */
export const HOME_FEATURE_KEYS = [
  'probability',
  'schengen',
  'delegated',
  'education',
  'community',
  'business',
  'investment',
  'permis',
  'recommendations',
  'compare',
] as const;

export type HomeFeatureKey = (typeof HOME_FEATURE_KEYS)[number];

export type HomeHeroCopy = {
  title: string;
  subtitle: string;
  badge: string;
};

/** Copy alignée maquette Stitch PAGE 01 (aucun objectif primaire encore choisi). */
const DEFAULT_HERO: HomeHeroCopy = {
  badge: 'INTELLIGENCE STRATÉGIQUE',
  title: 'Explorez le monde avec certitude.',
  subtitle:
    'Intelligence mobilité pour profils marocains : études, travail, business. Scores de mobilité, probabilités de visa et accompagnement.',
};

export function homeHeroForObjective(slug: string | null | undefined): HomeHeroCopy {
  const o = getObjectiveBySlug(slug);
  if (!o) return DEFAULT_HERO;
  return {
    badge: `Parcours · ${o.categoryLabelFr}`,
    title: `Votre objectif : ${o.labelFr}`,
    subtitle: `${o.teaserFr} — navigation et modules hors perspective sont masqués jusqu'à changement d'objectif (scores restent comparables entre pays).`,
  };
}

export function orderedHomeFeatureKeys(priority: readonly string[]): HomeFeatureKey[] {
  const set = new Set<string>(HOME_FEATURE_KEYS);
  const seen = new Set<string>();
  const out: HomeFeatureKey[] = [];
  for (const k of priority) {
    if (set.has(k) && !seen.has(k)) {
      seen.add(k);
      out.push(k as HomeFeatureKey);
    }
  }
  for (const k of HOME_FEATURE_KEYS) {
    if (!seen.has(k)) out.push(k);
  }
  return out;
}

export function homeFeatureOrderForObjective(def: UserObjectiveDefinition | null): HomeFeatureKey[] {
  if (!def) return [...HOME_FEATURE_KEYS];
  return orderedHomeFeatureKeys(def.homeFeaturePriority);
}

const FEATURE_KEY_EXPLORER_HREF: Partial<Record<HomeFeatureKey, string>> = {
  education: '/education',
  business: '/business',
  investment: '/investment',
};

function isHomeFeatureInPerspective(key: HomeFeatureKey, def: UserObjectiveDefinition | null): boolean {
  if (!def) return true;
  const href = FEATURE_KEY_EXPLORER_HREF[key];
  if (!href) return true;
  return isExplorerNavHrefInPerspective(href, def);
}

/**
 * Homepage “Modules VisaFlow” tiles: only objectives allowed for the current perspective,
 * in `homeFeaturePriority` order (no filler — off-perspective modules stay hidden).
 */
export function visibleHomeFeatureKeysForObjective(def: UserObjectiveDefinition | null): HomeFeatureKey[] {
  if (!def) return [...HOME_FEATURE_KEYS];
  const out: HomeFeatureKey[] = [];
  const seen = new Set<string>();
  for (const k of def.homeFeaturePriority) {
    if (!(HOME_FEATURE_KEYS as readonly string[]).includes(k)) continue;
    const key = k as HomeFeatureKey;
    if (!isHomeFeatureInPerspective(key, def)) continue;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(key);
  }
  return out;
}

export function focusStripForObjective(slug: string | null | undefined): readonly string[] {
  const o = getObjectiveBySlug(slug);
  if (!o) {
    return [
      'Scores visa multi-objectifs',
      'Friction rendez-vous & terrain',
      'Comparaisons transparentes',
    ];
  }
  return o.focusTopicsFr;
}
