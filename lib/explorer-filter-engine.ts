/**
 * Shared client-side Explorer filter + sort (Home, Explorer, Compare suggestions).
 */

import {
  COMPARE_OBJECTIVES,
  getObjectiveDefinition,
  objectiveWeightedScore,
} from '@/lib/compare-objectives';
import { extractCompareSignals } from '@/lib/compare-signals';
import {
  perspectiveBudgetBand,
  type BudgetBand,
  type EnrichedCountryApi,
} from '@/lib/enrich-country-api';
import {
  explorerRegionToUrlParam,
  matchesExplorerRegionFilter,
  matchesExplorerSchengenOnlyToggle,
  parseExplorerRegionFilter,
  type ExplorerRegionFilter,
} from '@/lib/explorer-filters';
import { explorerFilterGoalFromObjectiveSlug } from '@/lib/user-objectives/explorer-filter-goal';
import { getObjectiveBySlug } from '@/lib/user-objectives/registry';
import {
  defaultSlugForExplorerGoal,
  EXPLORER_GENERIC_PROFILE,
  getExplorerFilterProfileForSlug,
  type ExplorerFilterProfile,
} from '@/lib/explorer-filter-profiles';
import { isUserObjectiveSlug, type UserObjectiveSlug } from '@/lib/user-objectives/registry';

export type ExplorerExplorerGoal =
  | 'all'
  | 'tourism'
  | 'study'
  | 'work'
  | 'business'
  | 'education'
  | 'short_course';

export type ExplorerBudget = 'all' | BudgetBand;
export type ExplorerFrictionBand = 'all' | 'low' | 'medium' | 'high';
export type ExplorerFilterMode = 'explorer' | 'recommendation';

export type ExplorerFilterState = {
  objectiveSlug: UserObjectiveSlug | null;
  goal: ExplorerExplorerGoal;
  region: ExplorerRegionFilter;
  budget: ExplorerBudget;
  difficulty: string;
  friction: ExplorerFrictionBand;
  schengenOnly: boolean;
  q: string;
  mode: ExplorerFilterMode;
};

export function isExplorerBudget(v: string | null): v is BudgetBand {
  return v === 'low' || v === 'medium' || v === 'high';
}

export function parseExplorerGoalParam(v: string | null | undefined): ExplorerExplorerGoal {
  if (!v || v === 'all') return 'all';
  const n = v.trim().toLowerCase().replace(/-/g, '_');
  const allowed: Exclude<ExplorerExplorerGoal, 'all'>[] = [
    'tourism',
    'study',
    'work',
    'business',
    'education',
    'short_course',
  ];
  return (allowed.includes(n as Exclude<ExplorerExplorerGoal, 'all'>)
    ? n
    : 'all') as ExplorerExplorerGoal;
}

export function parseObjectiveSlugParam(v: string | null | undefined): UserObjectiveSlug | null {
  if (!v?.trim()) return null;
  const s = v.trim();
  return isUserObjectiveSlug(s) ? s : null;
}

export function resolveExplorerFilterProfile(
  state: ExplorerFilterState,
  preferenceSlug: string | null | undefined,
): ExplorerFilterProfile {
  if (state.objectiveSlug) {
    const p = getExplorerFilterProfileForSlug(state.objectiveSlug);
    if (p) return p;
  }
  if (preferenceSlug) {
    const p = getExplorerFilterProfileForSlug(preferenceSlug);
    if (p) return p;
  }
  if (state.goal !== 'all') {
    const slug = defaultSlugForExplorerGoal(state.goal);
    if (slug) {
      const p = getExplorerFilterProfileForSlug(slug);
      if (p) return p;
    }
  }
  return EXPLORER_GENERIC_PROFILE;
}

function primaryVisaScore(c: EnrichedCountryApi, focus: ExplorerFilterProfile['primaryScoreFocus']): number {
  switch (focus) {
    case 'tourism':
      return c._visa.tourism;
    case 'work':
      return c._visa.work;
    case 'business':
      return c._visa.business;
    case 'study':
    default:
      return c._visa.study;
  }
}

function matchesFrictionBand(frictionSignal: number, band: ExplorerFrictionBand): boolean {
  if (band === 'all') return true;
  // Higher _friction = easier admin (100 - friction_score)
  if (band === 'low') return frictionSignal >= 60;
  if (band === 'medium') return frictionSignal >= 35 && frictionSignal < 60;
  return frictionSignal < 35;
}

function matchesDifficultyLabel(label: string, difficulty: string): boolean {
  if (difficulty === 'all') return true;
  return label.toLowerCase() === difficulty.toLowerCase();
}

export function countryMatchesExplorerFilters(
  c: EnrichedCountryApi,
  state: ExplorerFilterState,
  profile: ExplorerFilterProfile,
): boolean {
  const nameStr = String(c.name ?? '');

  if (state.q.trim()) {
    if (!nameStr.toLowerCase().includes(state.q.trim().toLowerCase())) return false;
  }

  if (profile.dimensions.includes('region')) {
    if (
      !matchesExplorerRegionFilter(state.region, {
        name: nameStr,
        region: String(c.region ?? ''),
      })
    ) {
      return false;
    }
  }

  if (profile.dimensions.includes('schengen') && state.schengenOnly) {
    if (!matchesExplorerSchengenOnlyToggle(true, { name: nameStr })) return false;
  }

  if (profile.primaryScoreMin > 0) {
    if (primaryVisaScore(c, profile.primaryScoreFocus) < profile.primaryScoreMin) return false;
  }

  if (profile.moduleAccessSignal && profile.moduleAccessMin > 0) {
    const signals = extractCompareSignals(c);
    if ((signals[profile.moduleAccessSignal] ?? 0) < profile.moduleAccessMin) return false;
  }

  if (profile.dimensions.includes('difficulty') && state.difficulty !== 'all') {
    if (!matchesDifficultyLabel(String(c._difficultyLabel), state.difficulty)) return false;
  }

  if (profile.dimensions.includes('friction') && state.friction !== 'all') {
    if (!matchesFrictionBand(c._friction, state.friction)) return false;
  }

  if (profile.dimensions.includes('budgetBand') && state.budget !== 'all') {
    if (perspectiveBudgetBand(c, profile.primaryScoreFocus) !== state.budget) return false;
  }

  return true;
}

export function filterExplorerCountries(
  list: EnrichedCountryApi[],
  state: ExplorerFilterState,
  profile: ExplorerFilterProfile,
): EnrichedCountryApi[] {
  return list.filter((c) => countryMatchesExplorerFilters(c, state, profile));
}

export function sortExplorerCountries(
  list: EnrichedCountryApi[],
  state: ExplorerFilterState,
  profile: ExplorerFilterProfile,
): EnrichedCountryApi[] {
  const copy = [...list];
  if (state.mode === 'recommendation') {
    const def = getObjectiveDefinition(profile.compareObjectiveId);
    copy.sort((a, b) => objectiveWeightedScore(b, def) - objectiveWeightedScore(a, def));
    return copy;
  }
  copy.sort((a, b) => a.name.localeCompare(b.name));
  return copy;
}

export function applyExplorerFiltersAndSort(
  list: EnrichedCountryApi[],
  state: ExplorerFilterState,
  preferenceSlug: string | null | undefined,
): { filtered: EnrichedCountryApi[]; profile: ExplorerFilterProfile } {
  const profile = resolveExplorerFilterProfile(state, preferenceSlug);
  const filtered = sortExplorerCountries(filterExplorerCountries(list, state, profile), state, profile);
  return { filtered, profile };
}

/** Build `/explorer?…` query string (no leading `?`). */
export function buildExplorerQueryString(state: ExplorerFilterState): string {
  const params = new URLSearchParams();
  const q = state.q.trim();
  if (q) params.set('q', q);
  if (state.region !== 'all') params.set('region', explorerRegionToUrlParam(state.region));
  if (state.objectiveSlug) {
    params.set('objective', state.objectiveSlug);
  }
  if (state.goal !== 'all') params.set('goal', state.goal);
  if (state.budget !== 'all') params.set('budget', state.budget);
  if (state.difficulty !== 'all' && ['Low', 'Medium', 'High', 'Extreme'].includes(state.difficulty)) {
    params.set('difficulty', state.difficulty);
  }
  if (state.friction !== 'all') params.set('friction', state.friction);
  if (state.schengenOnly) params.set('schengen', '1');
  if (state.mode === 'recommendation') params.set('mode', 'recommendation');
  return params.toString();
}

export function explorerFilterStateFromSearchParams(
  searchParams: URLSearchParams,
  preferenceSlug: string | null | undefined,
  lockedObjectiveSlug: UserObjectiveSlug | null,
): ExplorerFilterState {
  let qDecoded = '';
  const qRaw = searchParams.get('q') ?? searchParams.get('search');
  try {
    qDecoded = decodeURIComponent(qRaw ?? '').trim();
  } catch {
    qDecoded = String(qRaw ?? '').trim();
  }

  const reg = searchParams.get('region');
  const region = reg?.trim() ? parseExplorerRegionFilter(reg.trim()) : 'all';

  const objectiveSlug =
    lockedObjectiveSlug ?? parseObjectiveSlugParam(searchParams.get('objective'));

  let goal = parseExplorerGoalParam(searchParams.get('goal'));
  if (lockedObjectiveSlug) {
    const g = explorerFilterGoalFromObjectiveSlug(lockedObjectiveSlug);
    goal = g === 'all' ? 'all' : (g as ExplorerExplorerGoal);
  } else if (goal === 'all' && objectiveSlug) {
    const def = getObjectiveBySlug(objectiveSlug);
    if (def) goal = def.explorerGoalDefault === 'all' ? 'all' : (def.explorerGoalDefault as ExplorerExplorerGoal);
  }

  const bud = searchParams.get('budget');
  const budget: ExplorerBudget = isExplorerBudget(bud) ? bud : 'all';

  const diff = searchParams.get('difficulty');
  const difficulty =
    diff && ['Low', 'Medium', 'High', 'Extreme'].includes(diff) ? diff : 'all';

  const fr = searchParams.get('friction');
  const friction: ExplorerFrictionBand =
    fr === 'low' || fr === 'medium' || fr === 'high' ? fr : 'all';

  const sch = searchParams.get('schengen');
  const schengenOnly = sch === '1' || sch === 'true' || sch === 'yes';

  const modeParam = searchParams.get('mode');
  const mode: ExplorerFilterMode = modeParam === 'recommendation' ? 'recommendation' : 'explorer';

  return {
    objectiveSlug,
    goal,
    region,
    budget,
    difficulty,
    friction,
    schengenOnly,
    q: qDecoded,
    mode,
  };
}

export function compareObjectiveIdForExplorerState(
  state: ExplorerFilterState,
  preferenceSlug: string | null | undefined,
): string {
  const profile = resolveExplorerFilterProfile(state, preferenceSlug);
  return profile.compareObjectiveId;
}
