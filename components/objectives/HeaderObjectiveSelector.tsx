'use client';

import { useMemo } from 'react';
import { useObjectiveChangeFlow } from '@/components/objectives/ObjectiveChangeFlow';
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider';
import {
  isUserObjectiveSlug,
  listObjectivesGrouped,
  USER_OBJECTIVE_CATEGORY_ORDER,
} from '@/lib/user-objectives/registry';

export function HeaderObjectiveSelector({ className }: { className?: string }) {
  const { preference, ready } = useObjectivePreference();
  const { requestChange } = useObjectiveChangeFlow();
  const grouped = useMemo(() => listObjectivesGrouped(), []);

  if (!ready) {
    return (
      <div
        className={
          'h-9 min-w-[10rem] animate-pulse rounded-xl border border-line bg-inset ' + (className ?? '')
        }
        aria-hidden
      />
    );
  }

  const value = preference.primarySlug ?? '';

  return (
    <label className={'flex min-w-0 flex-col gap-0.5 ' + (className ?? '')}>
      <span className="text-[9px] font-black uppercase tracking-wider text-muted">Objectif</span>
      <select
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (!v || !isUserObjectiveSlug(v)) return;
          requestChange(v);
        }}
        className="max-w-full cursor-pointer truncate rounded-xl border border-line bg-[#f8f2e8] px-2.5 py-1.5 text-[11px] font-bold text-text shadow-sm transition-colors hover:border-primary/35 hover:bg-primary-soft focus:outline-none focus:ring-2 focus:ring-primary/30 sm:max-w-[14rem] sm:px-3 sm:text-xs"
        title="Objectif principal — personnalise l'accueil et les raccourcis"
      >
        <option value="">Choisir…</option>
        {USER_OBJECTIVE_CATEGORY_ORDER.map((cat) => {
          const items = grouped.get(cat);
          if (!items?.length) return null;
          return (
            <optgroup key={cat} label={items[0]!.categoryLabelFr}>
              {items.map((o) => (
                <option key={o.slug} value={o.slug}>
                  {o.labelFr}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
    </label>
  );
}
