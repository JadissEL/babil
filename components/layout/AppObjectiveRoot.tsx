'use client';

import { FirstVisitObjectiveWizard } from '@/components/objectives/FirstVisitObjectiveWizard';
import { ObjectiveChangeDisclaimer } from '@/components/objectives/ObjectiveChangeDisclaimer';
import { ObjectiveChangeFlow } from '@/components/objectives/ObjectiveChangeFlow';
import { ObjectivePreferenceProvider } from '@/components/objectives/ObjectivePreferenceProvider';
import { ObjectiveTransitionOverlay } from '@/components/objectives/ObjectiveTransitionOverlay';

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
