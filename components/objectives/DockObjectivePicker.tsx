'use client';

import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider';
import {
  listObjectivesGrouped,
  USER_OBJECTIVE_CATEGORY_ORDER,
  type UserObjectiveSlug,
} from '@/lib/user-objectives/registry';
import { cn } from '@/lib/utils';

export type DockObjectivePickerVariant = 'default' | 'compact' | 'compactHeader';

/**
 * Sélecteur d’objectif : panneau personnalisé (style VisaFlow) au lieu du menu natif du `<select>`.
 * - `compact` : pilule étroite (ancien dock flottant).
 * - `compactHeader` : même pilule, listbox en `position: fixed` + portail `document.body`
 *   pour éviter le clipping des en-têtes avec `backdrop-filter`.
 */
export function DockObjectivePicker({
  variant = 'default',
}: {
  variant?: DockObjectivePickerVariant;
}) {
  const { preference, ready, setPrimaryObjective } = useObjectivePreference();
  const [open, setOpen] = useState(false);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [listboxRect, setListboxRect] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const grouped = useMemo(() => listObjectivesGrouped(), []);

  const compactHeader = variant === 'compactHeader';
  const compact = variant === 'compact' || compactHeader;

  const currentLabel = useMemo(() => {
    if (!preference.primarySlug) return null;
    for (const items of Array.from(grouped.values())) {
      const hit = items.find((o) => o.slug === preference.primarySlug);
      if (hit) return hit.labelFr;
    }
    return null;
  }, [grouped, preference.primarySlug]);

  useLayoutEffect(() => {
    if (!open || !compactHeader) {
      setListboxRect(null);
      return;
    }
    const update = () => {
      const btn = buttonRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const width = Math.min(Math.max(r.width, 288), typeof window !== 'undefined' ? window.innerWidth - 16 : 288);
      let left = r.left;
      if (typeof window !== 'undefined') {
        if (left + width > window.innerWidth - 8) left = window.innerWidth - 8 - width;
        if (left < 8) left = 8;
      }
      setListboxRect({ top: r.bottom + 6, left, width });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, compactHeader]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (compactHeader) {
        const portal = document.getElementById('vf-objective-listbox-root');
        if (portal?.contains(t)) return;
      }
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, compactHeader]);

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
      <div
        className={cn(
          'animate-pulse rounded-2xl border border-line bg-inset',
          compactHeader && 'h-8 w-[11.25rem] sm:w-[13.25rem]',
          variant === 'compact' && 'h-9 w-full max-w-[17.5rem]',
          variant === 'default' && 'h-12 w-full max-w-xl',
        )}
        aria-hidden
      />
    );
  }

  const listboxClassName =
    'max-h-[min(60dvh,22rem)] overflow-y-auto overscroll-y-contain rounded-2xl border border-line bg-[#fdf8ef] p-3 shadow-card';

  const listboxInner = (
    <>
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
    </>
  );

  const listboxNode = (() => {
    if (!open) return null;
    if (compactHeader) {
      if (!listboxRect || typeof document === 'undefined') return null;
      return createPortal(
        <div
          id="vf-objective-listbox-root"
          role="listbox"
          className={cn(listboxClassName, 'fixed z-[90]')}
          style={{
            top: listboxRect.top,
            left: listboxRect.left,
            width: listboxRect.width,
          }}
        >
          {listboxInner}
        </div>,
        document.body,
      );
    }
    return (
      <div role="listbox" className={cn('absolute left-0 right-0 top-full z-[80] mt-1.5', listboxClassName)}>
        {listboxInner}
      </div>
    );
  })();

  return (
    <div
      ref={rootRef}
      className={cn(
        'relative',
        compactHeader && 'min-w-0 w-[11.25rem] sm:w-[13.25rem]',
        variant === 'compact' && !compactHeader && 'w-full max-w-[17.5rem]',
        variant === 'default' && 'mx-auto w-full max-w-3xl',
      )}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-2xl border border-line bg-surface text-left shadow-soft transition-colors',
          compact ? 'px-2 py-1.5 sm:px-2.5 sm:py-1.5' : 'gap-3 px-4 py-3',
          open ? 'border-primary/40 ring-2 ring-primary/25' : 'hover:border-primary/35 hover:bg-primary-soft/50',
        )}
      >
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block font-black uppercase tracking-widest text-muted',
              compact ? 'text-[7px] tracking-[0.18em]' : 'text-[9px] tracking-widest',
            )}
          >
            Objectif principal
          </span>
          <span
            className={cn(
              'block truncate font-black text-text',
              compact ? 'mt-0.5 text-[11px] leading-tight sm:text-xs' : 'mt-0.5 text-sm',
            )}
          >
            {currentLabel ?? 'Choisir votre objectif…'}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'shrink-0 text-muted transition-transform',
            compact ? 'h-3.5 w-3.5' : 'h-5 w-5',
            open ? 'rotate-180' : '',
          )}
          aria-hidden
        />
      </button>

      {listboxNode}
    </div>
  );
}
