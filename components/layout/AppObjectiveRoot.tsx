'use client';

import { FirstVisitObjectiveWizard } from '@/components/objectives/FirstVisitObjectiveWizard';
import { ObjectivePreferenceProvider } from '@/components/objectives/ObjectivePreferenceProvider';

export function AppObjectiveRoot({ children }: { children: React.ReactNode }) {
  return (
    <ObjectivePreferenceProvider>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <FirstVisitObjectiveWizard />
    </ObjectivePreferenceProvider>
  );
}
