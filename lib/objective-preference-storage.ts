import type { UserObjectiveSlug } from '@/lib/user-objectives/registry';
import { isUserObjectiveSlug } from '@/lib/user-objectives/registry';

export const OBJECTIVE_PREFERENCE_STORAGE_KEY = 'babil_objective_pref_v1';
export const OBJECTIVE_PREFERENCE_EVENT = 'babil:objective-preference-updated';

export type StoredObjectivePreferenceV1 = {
  version: 1;
  primarySlug: UserObjectiveSlug | null;
  secondarySlugs: UserObjectiveSlug[];
  /** ISO timestamp — wizard dismissed / completed */
  wizardCompletedAt: string | null;
};

export const EMPTY_OBJECTIVE_PREFERENCE: StoredObjectivePreferenceV1 = {
  version: 1,
  primarySlug: null,
  secondarySlugs: [],
  wizardCompletedAt: null,
};

function normalizeSecondary(raw: unknown): UserObjectiveSlug[] {
  if (!Array.isArray(raw)) return [];
  const out: UserObjectiveSlug[] = [];
  for (const x of raw) {
    if (typeof x === 'string' && isUserObjectiveSlug(x) && !out.includes(x)) out.push(x);
  }
  return out.slice(0, 5);
}

export function readObjectivePreference(): StoredObjectivePreferenceV1 {
  if (typeof window === 'undefined') return EMPTY_OBJECTIVE_PREFERENCE;
  try {
    const raw = window.localStorage.getItem(OBJECTIVE_PREFERENCE_STORAGE_KEY);
    if (!raw) return EMPTY_OBJECTIVE_PREFERENCE;
    const o = JSON.parse(raw) as Record<string, unknown>;
    if (o.version !== 1) return EMPTY_OBJECTIVE_PREFERENCE;
    const primary =
      typeof o.primarySlug === 'string' && isUserObjectiveSlug(o.primarySlug) ? o.primarySlug : null;
    return {
      version: 1,
      primarySlug: primary,
      secondarySlugs: normalizeSecondary(o.secondarySlugs),
      wizardCompletedAt: typeof o.wizardCompletedAt === 'string' ? o.wizardCompletedAt : null,
    };
  } catch {
    return EMPTY_OBJECTIVE_PREFERENCE;
  }
}

export function writeObjectivePreference(patch: Partial<StoredObjectivePreferenceV1>) {
  if (typeof window === 'undefined') return;
  try {
    const prev = readObjectivePreference();
    const next: StoredObjectivePreferenceV1 = {
      ...prev,
      ...patch,
      version: 1,
      secondarySlugs: patch.secondarySlugs ?? prev.secondarySlugs,
    };
    window.localStorage.setItem(OBJECTIVE_PREFERENCE_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(OBJECTIVE_PREFERENCE_EVENT));
  } catch {
    /* quota */
  }
}

export function setPrimaryObjectiveSlug(slug: UserObjectiveSlug) {
  writeObjectivePreference({ primarySlug: slug });
}

export function markObjectiveWizardCompleted() {
  writeObjectivePreference({ wizardCompletedAt: new Date().toISOString() });
}
