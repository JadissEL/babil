'use client';

import { ChevronDown } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  const listboxPortalRef = useRef<HTMLDivElement | null>(null);
  const prevOpenRef = useRef(false);
  const listboxId = useId();
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

    let raf = 0;
    const measure = () => {
      const btn = buttonRef.current;
      if (!btn || typeof window === 'undefined') return;
      const r = btn.getBoundingClientRect();
      const width = Math.min(Math.max(r.width, 288), window.innerWidth - 16);
      let left = r.left;
      if (left + width > window.innerWidth - 8) left = window.innerWidth - 8 - width;
      if (left < 8) left = 8;
      setListboxRect({ top: r.bottom + 6, left, width });
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
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
      if (compactHeader && listboxPortalRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, compactHeader]);

  /** Reprise du focus sur le bouton à la fermeture (Escape, clic extérieur, choix). */
  useEffect(() => {
    if (prevOpenRef.current && !open) {
      const id = requestAnimationFrame(() => buttonRef.current?.focus());
      prevOpenRef.current = open;
      return () => cancelAnimationFrame(id);
    }
    prevOpenRef.current = open;
    return undefined;
  }, [open]);

  /** Focus initial sur le panneau porté (lecteurs d’écran, navigation clavier). */
  useEffect(() => {
    if (!open || !compactHeader || !listboxRect) return;
    const id = requestAnimationFrame(() => {
      listboxPortalRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [open, compactHeader, listboxRect]);

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

  const listboxMaxHeightPx =
    typeof window !== 'undefined' && listboxRect
      ? Math.max(140, Math.min(Math.floor(window.innerHeight * 0.62), window.innerHeight - listboxRect.top - 12))
      : undefined;

  const listboxClassName =
    'overflow-y-auto overscroll-y-contain rounded-2xl border border-line bg-[#fdf8ef] p-3 shadow-card outline-none focus-visible:ring-2 focus-visible:ring-primary/35';

  const listboxInner = (
    <>
      <p className="mb-2 px-1 text-[11px] font-medium text-muted" id={`${listboxId}-hint`}>
        L’accueil, l’explorateur et les raccourcis s’alignent sur votre choix.
      </p>
      <div className="space-y-6" role="presentation">
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
          ref={listboxPortalRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={`${listboxId}-hint`}
          className={cn(listboxClassName, 'fixed z-[90]')}
          style={{
            top: listboxRect.top,
            left: listboxRect.left,
            width: listboxRect.width,
            maxHeight: listboxMaxHeightPx ? `${listboxMaxHeightPx}px` : 'min(60dvh,22rem)',
          }}
        >
          {listboxInner}
        </div>,
        document.body,
      );
    }
    return (
      <div
        id={listboxId}
        role="listbox"
        tabIndex={-1}
        aria-labelledby={`${listboxId}-hint`}
        className={cn('absolute left-0 right-0 top-full z-[80] mt-1.5 max-h-[min(60dvh,22rem)]', listboxClassName)}
      >
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
        aria-controls={open ? listboxId : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-2xl border border-line bg-surface text-left shadow-soft transition-colors motion-reduce:transition-none',
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
            'shrink-0 text-muted motion-reduce:transition-none',
            compact ? 'h-3.5 w-3.5 transition-transform duration-200' : 'h-5 w-5 transition-transform duration-200',
            open ? 'rotate-180' : '',
          )}
          aria-hidden
        />
      </button>

      {listboxNode}
    </div>
  );
}
