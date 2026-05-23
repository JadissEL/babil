'use client';

import {
  FirstVisitObjectiveWizard,
  ObjectiveChangeDisclaimer,
  ObjectiveChangeFlow,
  ObjectivePreferenceProvider,
  ObjectiveTransitionOverlay,
} from '@/components/objectives';

export function AppObjectiveRoot({ children }: { children: React.ReactNode }) {
  return (
    <ObjectivePreferenceProvider>
      <ObjectiveChangeFlow>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <FirstVisitObjectiveWizard />
        <ObjectiveChangeDisclaimer />
        <ObjectiveTransitionOverlay />
      </ObjectiveChangeFlow>
    </ObjectivePreferenceProvider>
  );
}
