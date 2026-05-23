'use client';

import { ArrowRightLeft } from 'lucide-react';
import { useCallback, useEffect, useId, useState } from 'react';
import { useObjectiveChangeFlow } from '@/components/objectives/ObjectiveChangeFlow';
import { NEXUS_FOCUS_VISIBLE } from '@/lib/nexus-chrome';
import { cn } from '@/lib/utils';

export function ObjectiveChangeDisclaimer() {
  const { phase, pending, confirmChange, cancelChange } = useObjectiveChangeFlow();
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const checkboxId = useId();
  const visible = phase === 'disclaimer' && pending !== null;

  useEffect(() => {
    if (!visible) {
      setAccepted(false);
      setBusy(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || typeof document === 'undefined') return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) cancelChange();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [visible, busy, cancelChange]);

  const onConfirm = useCallback(async () => {
    if (!accepted || busy) return;
    setBusy(true);
    try {
      await confirmChange();
    } finally {
      setBusy(false);
    }
  }, [accepted, busy, confirmChange]);

  if (!visible || !pending) return null;

  const { copy } = pending;

  return (
    <div
      className="fixed inset-0 z-[210] overflow-y-auto overflow-x-hidden bg-[#1a1510]/55 backdrop-blur-sm pt-[max(0.5rem,env(safe-area-inset-top,0px))] pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="objective-change-title"
    >
      <div className="flex min-h-full items-start justify-center p-3 py-4 sm:items-center sm:p-6 sm:py-10">
        <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-[#fdf8ef] shadow-2xl">
          <div className="border-b border-line/60 px-6 pb-5 pt-7 sm:px-8">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary-soft/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
              <ArrowRightLeft className="h-3.5 w-3.5" aria-hidden />
              Transition de parcours
            </div>
            <h2 id="objective-change-title" className="mt-3 text-xl font-black tracking-tight text-text sm:text-2xl">
              Confirmer votre objectif
            </h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-text">{copy.headline}</p>
          </div>

          <div className="space-y-4 px-6 py-6 sm:px-8">
            {copy.fromLabel ? (
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-center">
                <span className="text-sm font-black text-muted">{copy.fromLabel}</span>
                <span className="text-primary" aria-hidden>
                  →
                </span>
                <span className="text-sm font-black text-primary">{copy.toLabel}</span>
              </div>
            ) : (
              <p className="rounded-2xl border border-primary/25 bg-primary-soft/50 px-4 py-3 text-center text-sm font-black text-primary">
                {copy.toLabel}
              </p>
            )}

            <p className="text-xs font-medium leading-relaxed text-muted">
              L&apos;accueil, l&apos;explorateur, les moteurs de recommandation et de probabilité, ainsi que les
              raccourcis de navigation seront réalignés sur ce choix. Les scores et indicateurs restent indicatifs. Vous
              pourrez modifier votre objectif à tout moment.
            </p>

            <label
              htmlFor={checkboxId}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-3 transition-colors',
                accepted && 'border-primary/35 bg-primary-soft/40',
              )}
            >
              <input
                id={checkboxId}
                type="checkbox"
                checked={accepted}
                disabled={busy}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-line text-primary focus:ring-primary/40"
              />
              <span className="text-sm font-medium leading-snug text-text">
                J&apos;ai lu et j&apos;accepte cette transition
              </span>
            </label>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-line/60 bg-[#fdf8ef] px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
            <button
              type="button"
              disabled={busy}
              onClick={cancelChange}
              className={cn(
                'rounded-2xl border border-line bg-surface px-5 py-3 text-xs font-black uppercase tracking-widest text-text transition-colors hover:bg-inset disabled:opacity-50',
                NEXUS_FOCUS_VISIBLE,
              )}
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={!accepted || busy}
              onClick={() => void onConfirm()}
              className={cn(
                'rounded-2xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50',
                NEXUS_FOCUS_VISIBLE,
              )}
            >
              {busy ? 'Transition…' : 'Confirmer et continuer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
