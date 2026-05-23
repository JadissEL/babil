'use client';

import { useUser } from '@clerk/nextjs';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  OBJECTIVE_PREFERENCE_EVENT,
  readObjectivePreference,
  writeObjectivePreference,
  type StoredObjectivePreferenceV1,
} from '@/lib/objective-preference-storage';
import {
  getObjectiveBySlug,
  isUserObjectiveSlug,
  type UserObjectiveSlug,
} from '@/lib/user-objectives/registry';

const EMPTY: StoredObjectivePreferenceV1 = {
  version: 1,
  primarySlug: null,
  secondarySlugs: [],
  wizardCompletedAt: null,
};

type ObjectivePreferenceContextValue = {
  ready: boolean;
  preference: StoredObjectivePreferenceV1;
  primaryDefinition: ReturnType<typeof getObjectiveBySlug>;
  setPrimaryObjective: (
    slug: UserObjectiveSlug,
    options?: { completeWizard?: boolean },
  ) => Promise<boolean>;
  setSecondaryObjectives: (slugs: UserObjectiveSlug[]) => void;
  /** Mark onboarding finished without choosing a primary (local + server when signed in). */
  dismissObjectiveWizard: () => Promise<void>;
  reopenWizard: () => void;
};

const ObjectivePreferenceContext = createContext<ObjectivePreferenceContextValue | null>(null);

function normalizeSecondaryFromApi(raw: unknown): UserObjectiveSlug[] {
  if (!Array.isArray(raw)) return [];
  const out: UserObjectiveSlug[] = [];
  for (const x of raw) {
    if (typeof x === 'string' && isUserObjectiveSlug(x) && !out.includes(x)) out.push(x);
  }
  return out.slice(0, 5);
}

export function ObjectivePreferenceProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [preference, setPreference] = useState<StoredObjectivePreferenceV1>(EMPTY);
  const [ready, setReady] = useState(false);

  const hydrateLocal = useCallback(() => {
    setPreference(readObjectivePreference());
  }, []);

  useEffect(() => {
    hydrateLocal();
    setReady(true);
    if (typeof window === 'undefined') return;
    const onStorage = () => hydrateLocal();
    window.addEventListener(OBJECTIVE_PREFERENCE_EVENT, onStorage);
    return () => window.removeEventListener(OBJECTIVE_PREFERENCE_EVENT, onStorage);
  }, [hydrateLocal]);

  useEffect(() => {
    if (!isLoaded || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (!res.ok || cancelled) return;
        const p = (await res.json()) as Record<string, unknown> | null;
        if (!p || cancelled) return;
        const serverPrimary =
          typeof p.primary_objective_slug === 'string' ? p.primary_objective_slug.trim() : '';
        const secondary = normalizeSecondaryFromApi(p.secondary_objective_slugs);
        const wizRaw = p.objective_wizard_completed_at;
        const wizIso =
          wizRaw != null && String(wizRaw).trim()
            ? new Date(String(wizRaw)).toISOString()
            : null;
        const local = readObjectivePreference();

        if (serverPrimary && isUserObjectiveSlug(serverPrimary)) {
          writeObjectivePreference({
            primarySlug: serverPrimary,
            secondarySlugs: secondary.length ? secondary : local.secondarySlugs,
            wizardCompletedAt: wizIso ?? local.wizardCompletedAt,
          });
          hydrateLocal();
        } else if (wizIso) {
          writeObjectivePreference({
            wizardCompletedAt: wizIso,
          });
          hydrateLocal();
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, user, hydrateLocal]);

  const primaryDefinition = useMemo(
    () => getObjectiveBySlug(preference.primarySlug),
    [preference.primarySlug],
  );

  const setPrimaryObjective = useCallback(
    async (slug: UserObjectiveSlug, options?: { completeWizard?: boolean }): Promise<boolean> => {
      const patch: Partial<StoredObjectivePreferenceV1> = { primarySlug: slug };
      if (options?.completeWizard) {
        patch.wizardCompletedAt = new Date().toISOString();
      }
      writeObjectivePreference(patch);
      hydrateLocal();

      if (!user) return true;

      try {
        const res = await fetch('/api/user/objectives', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            primary_objective_slug: slug,
            secondary_objective_slugs: readObjectivePreference().secondarySlugs,
          }),
        });
        return res.ok;
      } catch {
        return false;
      }
    },
    [user, hydrateLocal],
  );

  const setSecondaryObjectives = useCallback(
    (slugs: UserObjectiveSlug[]) => {
      writeObjectivePreference({ secondarySlugs: slugs.slice(0, 5) });
      hydrateLocal();
    },
    [hydrateLocal],
  );

  const dismissObjectiveWizard = useCallback(async () => {
    const now = new Date().toISOString();
    writeObjectivePreference({ wizardCompletedAt: now });
    hydrateLocal();
    if (user) {
      try {
        await fetch('/api/user/objectives', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dismiss_objective_wizard: true }),
        });
      } catch {
        /* offline — local state still applies */
      }
    }
  }, [user, hydrateLocal]);

  const reopenWizard = useCallback(async () => {
    writeObjectivePreference({ wizardCompletedAt: null });
    hydrateLocal();
    if (user) {
      try {
        await fetch('/api/user/objectives', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reopen_objective_wizard: true }),
        });
      } catch {
        /* offline */
      }
    }
  }, [user, hydrateLocal]);

  const value = useMemo<ObjectivePreferenceContextValue>(
    () => ({
      ready,
      preference,
      primaryDefinition,
      setPrimaryObjective,
      setSecondaryObjectives,
      dismissObjectiveWizard,
      reopenWizard,
    }),
    [
      ready,
      preference,
      primaryDefinition,
      setPrimaryObjective,
      setSecondaryObjectives,
      dismissObjectiveWizard,
      reopenWizard,
    ],
  );

  return (
    <ObjectivePreferenceContext.Provider value={value}>{children}</ObjectivePreferenceContext.Provider>
  );
}

export function useObjectivePreference(): ObjectivePreferenceContextValue {
  const ctx = useContext(ObjectivePreferenceContext);
  if (!ctx) {
    throw new Error('useObjectivePreference must be used within ObjectivePreferenceProvider');
  }
  return ctx;
}

export function useObjectivePreferenceOptional(): ObjectivePreferenceContextValue | null {
  return useContext(ObjectivePreferenceContext);
}
