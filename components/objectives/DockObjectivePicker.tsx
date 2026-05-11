'use client';

import { ChevronUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider';
import {
  listObjectivesGrouped,
  USER_OBJECTIVE_CATEGORY_ORDER,
  type UserObjectiveSlug,
} from '@/lib/user-objectives/registry';
import { cn } from '@/lib/utils';

/**
 * Sélecteur d’objectif en bas de page : panneau personnalisé (style VisaFlow) au lieu du menu natif du `<select>`.
 */
export function DockObjectivePicker() {
  const { preference, ready, setPrimaryObjective } = useObjectivePreference();
  const [open, setOpen] = useState(false);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const grouped = useMemo(() => listObjectivesGrouped(), []);

  const currentLabel = useMemo(() => {
    if (!preference.primarySlug) return null;
    for (const items of Array.from(grouped.values())) {
      const hit = items.find((o) => o.slug === preference.primarySlug);
      if (hit) return hit.labelFr;
    }
    return null;
  }, [grouped, preference.primarySlug]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const onPick = useCallback(
    async (slug: UserObjectiveSlug) => {
      setBusySlug(slug);
      try {
        await setPrimaryObjective(slug, { completeWizard: true });
        setOpen(false);
      } finally {
        setBusySlug(null);
      }
    },
    [setPrimaryObjective],
  );

  if (!ready) {
    return (
      <div className="h-12 w-full max-w-xl animate-pulse rounded-2xl border border-line bg-inset" aria-hidden />
    );
  }

  return (
    <div ref={rootRef} className="relative mx-auto w-full max-w-3xl">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-left shadow-soft transition-colors',
          open ? 'border-primary/40 ring-2 ring-primary/25' : 'hover:border-primary/35 hover:bg-primary-soft/50',
        )}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[9px] font-black uppercase tracking-widest text-muted">Objectif principal</span>
          <span className="mt-0.5 block truncate text-sm font-black text-text">
            {currentLabel ?? 'Choisir votre objectif…'}
          </span>
        </span>
        <ChevronUp
          className={cn('h-5 w-5 shrink-0 text-muted transition-transform', open ? 'rotate-180' : '')}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute bottom-full left-0 right-0 z-50 mb-2 max-h-[min(60dvh,22rem)] overflow-y-auto overscroll-y-contain rounded-2xl border border-line bg-[#fdf8ef] p-3 shadow-card"
        >
          <p className="mb-2 px-1 text-[11px] font-medium text-muted">
            L’accueil, l’explorateur et les raccourcis s’alignent sur votre choix.
          </p>
          <div className="space-y-6">
            {USER_OBJECTIVE_CATEGORY_ORDER.map((cat) => {
              const items = grouped.get(cat);
              if (!items?.length) return null;
              return (
                <div key={cat}>
                  <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-widest text-muted">
                    {items[0]!.categoryLabelFr}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {items.map((o) => (
                      <button
                        key={o.slug}
                        type="button"
                        role="option"
                        aria-selected={preference.primarySlug === o.slug}
                        disabled={busySlug !== null}
                        onClick={() => void onPick(o.slug)}
                        className={cn(
                          'flex flex-col rounded-xl border px-3 py-2.5 text-left text-sm font-black transition-all disabled:opacity-50',
                          preference.primarySlug === o.slug
                            ? 'border-primary/40 bg-primary-soft text-primary ring-1 ring-primary/25'
                            : 'border-line bg-surface text-text hover:border-primary/35 hover:shadow-sm',
                        )}
                      >
                        {busySlug === o.slug ? 'Enregistrement…' : o.labelFr}
                        <span className="mt-1 text-[11px] font-medium leading-snug text-muted">{o.teaserFr}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
