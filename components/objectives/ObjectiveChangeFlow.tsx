'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider';
import { objectiveChangeCopy, type ObjectiveChangeCopy } from '@/lib/user-objectives/change-copy';
import { type UserObjectiveSlug } from '@/lib/user-objectives/registry';

const MIN_TRANSITION_MS = 2200;
const MAX_TRANSITION_MS = 12000;

export type ObjectiveChangePhase = 'idle' | 'disclaimer' | 'transitioning';

export type PendingObjectiveChange = {
  fromSlug: UserObjectiveSlug | null;
  toSlug: UserObjectiveSlug;
  copy: ObjectiveChangeCopy;
};

type ObjectiveChangeFlowContextValue = {
  phase: ObjectiveChangePhase;
  pending: PendingObjectiveChange | null;
  transitionProgress: number;
  error: string | null;
  requestChange: (toSlug: UserObjectiveSlug) => boolean;
  confirmChange: () => Promise<void>;
  cancelChange: () => void;
};

const ObjectiveChangeFlowContext = createContext<ObjectiveChangeFlowContextValue | null>(null);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function ObjectiveChangeFlow({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { preference, setPrimaryObjective } = useObjectivePreference();
  const [phase, setPhase] = useState<ObjectiveChangePhase>('idle');
  const [pending, setPending] = useState<PendingObjectiveChange | null>(null);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const runIdRef = useRef(0);

  const requestChange = useCallback(
    (toSlug: UserObjectiveSlug): boolean => {
      const fromSlug = preference.primarySlug;
      if (fromSlug === toSlug) return false;

      setError(null);
      setPending({
        fromSlug,
        toSlug,
        copy: objectiveChangeCopy(fromSlug, toSlug),
      });
      setPhase('disclaimer');
      return true;
    },
    [preference.primarySlug],
  );

  const cancelChange = useCallback(() => {
    runIdRef.current += 1;
    setPhase('idle');
    setPending(null);
    setTransitionProgress(0);
    setError(null);
  }, []);

  const confirmChange = useCallback(async () => {
    if (!pending || phase !== 'disclaimer') return;

    const runId = ++runIdRef.current;
    const { toSlug } = pending;
    setPhase('transitioning');
    setTransitionProgress(0);
    setError(null);

    const started = Date.now();
    let persistError: string | null = null;

    const progressTimer = window.setInterval(() => {
      const elapsed = Date.now() - started;
      const raw = Math.min(0.95, elapsed / MIN_TRANSITION_MS);
      setTransitionProgress(raw);
    }, 32);

    try {
      await Promise.all([
        setPrimaryObjective(toSlug, { completeWizard: true }),
        delay(MIN_TRANSITION_MS),
      ]);
    } catch {
      persistError =
        'La sauvegarde a échoué. Vérifiez votre connexion et réessayez depuis le menu objectif.';
    }

    window.clearInterval(progressTimer);

    if (runId !== runIdRef.current) return;

    const elapsed = Date.now() - started;
    if (elapsed > MAX_TRANSITION_MS) {
      persistError = persistError ?? 'La transition a pris trop de temps. Réessayez.';
    }

    setTransitionProgress(1);
    await delay(280);

    if (runId !== runIdRef.current) return;

    if (persistError) {
      setError(persistError);
      setPhase('idle');
      setPending(null);
      setTransitionProgress(0);
      return;
    }

    try {
      router.refresh();
    } catch {
      /* non-blocking */
    }

    setPhase('idle');
    setPending(null);
    setTransitionProgress(0);
  }, [pending, phase, setPrimaryObjective, router]);

  const value = useMemo<ObjectiveChangeFlowContextValue>(
    () => ({
      phase,
      pending,
      transitionProgress,
      error,
      requestChange,
      confirmChange,
      cancelChange,
    }),
    [phase, pending, transitionProgress, error, requestChange, confirmChange, cancelChange],
  );

  return (
    <ObjectiveChangeFlowContext.Provider value={value}>{children}</ObjectiveChangeFlowContext.Provider>
  );
}

export function useObjectiveChangeFlow(): ObjectiveChangeFlowContextValue {
  const ctx = useContext(ObjectiveChangeFlowContext);
  if (!ctx) {
    throw new Error('useObjectiveChangeFlow must be used within ObjectiveChangeFlow');
  }
  return ctx;
}

export function useObjectiveChangeFlowOptional(): ObjectiveChangeFlowContextValue | null {
  return useContext(ObjectiveChangeFlowContext);
}
