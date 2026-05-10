'use client';

import { FirstVisitObjectiveWizard } from '@/components/objectives/FirstVisitObjectiveWizard';
import { ObjectivePreferenceProvider } from '@/components/objectives/ObjectivePreferenceProvider';

export function AppObjectiveRoot({ children }: { children: React.ReactNode }) {
  return (
    <ObjectivePreferenceProvider>
      {children}
      <FirstVisitObjectiveWizard />
    </ObjectivePreferenceProvider>
  );
}
