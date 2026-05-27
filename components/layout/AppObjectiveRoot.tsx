'use client';

import {
  FirstVisitObjectiveWizard,
  ObjectiveChangeDisclaimer,
  ObjectiveChangeFlow,
  ObjectivePreferenceProvider,
  ObjectiveTransitionOverlay,
  PerspectiveRemountShell,
} from '@/components/objectives';

export function AppObjectiveRoot({ children }: { children: React.ReactNode }) {
  return (
    <ObjectivePreferenceProvider>
      <ObjectiveChangeFlow>
        <PerspectiveRemountShell>
          {children}
        </PerspectiveRemountShell>
        <FirstVisitObjectiveWizard />
        <ObjectiveChangeDisclaimer />
        <ObjectiveTransitionOverlay />
      </ObjectiveChangeFlow>
    </ObjectivePreferenceProvider>
  );
}
