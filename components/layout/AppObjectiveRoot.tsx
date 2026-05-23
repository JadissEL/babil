'use client';

import { FirstVisitObjectiveWizard } from '@/components/objectives/FirstVisitObjectiveWizard';
import { ObjectiveChangeDisclaimer } from '@/components/objectives/ObjectiveChangeDisclaimer';
import { ObjectiveChangeFlow, useObjectiveChangeFlow } from '@/components/objectives/ObjectiveChangeFlow';
import { ObjectivePreferenceProvider } from '@/components/objectives/ObjectivePreferenceProvider';
import { ObjectiveTransitionOverlay } from '@/components/objectives/ObjectiveTransitionOverlay';

function ObjectiveChangeErrorToast() {
  const { error, cancelChange } = useObjectiveChangeFlow();
  if (!error) return null;
  return (
    <div
      className="fixed bottom-4 left-1/2 z-[260] w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-red-300/50 bg-surface px-4 py-3 shadow-lg"
      role="alert"
    >
      <p className="text-sm font-medium text-text">{error}</p>
      <button
        type="button"
        onClick={cancelChange}
        className="mt-2 text-xs font-black uppercase tracking-widest text-primary hover:underline"
      >
        Fermer
      </button>
    </div>
  );
}

export function AppObjectiveRoot({ children }: { children: React.ReactNode }) {
  return (
    <ObjectivePreferenceProvider>
      <ObjectiveChangeFlow>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <FirstVisitObjectiveWizard />
        <ObjectiveChangeDisclaimer />
        <ObjectiveTransitionOverlay />
        <ObjectiveChangeErrorToast />
      </ObjectiveChangeFlow>
    </ObjectivePreferenceProvider>
  );
}
