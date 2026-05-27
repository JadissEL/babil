'use client';

import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider';

/** Remounts public shell when primary interest changes (clears stale client filter state). */
export function PerspectiveRemountShell({ children }: { children: React.ReactNode }) {
  const { perspectiveEpoch, preference } = useObjectivePreference();
  const key = `${preference.primarySlug ?? 'none'}:${perspectiveEpoch}`;
  return (
    <div key={key} className="flex min-h-0 flex-1 flex-col">
      {children}
    </div>
  );
}
