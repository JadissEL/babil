'use client';

import { Sparkles, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider';
import {
  listObjectivesGrouped,
  USER_OBJECTIVE_CATEGORY_ORDER,
  type UserObjectiveSlug,
} from '@/lib/user-objectives/registry';

export function FirstVisitObjectiveWizard() {
  const { ready, preference, setPrimaryObjective, dismissObjectiveWizard } = useObjectivePreference();
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const grouped = useMemo(() => listObjectivesGrouped(), []);

  const visible = ready && !preference.wizardCompletedAt;

  const onPick = useCallback(
    async (slug: UserObjectiveSlug) => {
      setBusySlug(slug);
      try {
        await setPrimaryObjective(slug, { completeWizard: true });
      } finally {
        setBusySlug(null);
      }
    },
    [setPrimaryObjective],
  );

  const onSkip = useCallback(async () => {
    setBusySlug('__skip__');
    try {
      await dismissObjectiveWizard();
    } finally {
      setBusySlug(null);
    }
  }, [dismissObjectiveWizard]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] overflow-y-auto overflow-x-hidden bg-[#1a1510]/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="objective-wizard-title"
    >
      {/* min-h-full évite le piège flex/items-center : le panneau haut peut défiler hors viewport à zoom 100 %. */}
      <div className="flex min-h-full items-center justify-center p-4 py-6 sm:p-6 sm:py-10">
        <div className="relative flex w-full max-w-4xl max-h-[min(92dvh,calc(100vh-2rem))] flex-col overflow-hidden rounded-3xl border border-line bg-[#fdf8ef] shadow-2xl sm:max-h-[min(90dvh,calc(100vh-2.5rem))]">
          <button
            type="button"
            onClick={() => void onSkip()}
            disabled={busySlug !== null}
            className="absolute right-3 top-3 z-10 rounded-xl border border-line bg-surface/95 p-2 text-muted shadow-sm backdrop-blur-sm transition-colors hover:bg-primary-soft hover:text-primary disabled:opacity-50 sm:right-4 sm:top-4"
            aria-label="Fermer sans choisir"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="shrink-0 border-b border-line/60 bg-[#fdf8ef] px-5 pb-5 pt-6 pr-14 sm:px-8 sm:pb-6 sm:pt-8 sm:pr-16">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary-soft/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Personnalisation
            </div>
            <h2 id="objective-wizard-title" className="mt-3 text-2xl font-black tracking-tight text-text sm:text-3xl">
              Qu&apos;est-ce que vous cherchez ?
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-medium text-muted sm:text-base">
              Sélectionnez votre objectif principal : l&apos;accueil, les filtres et les priorités s&apos;alignent
              automatiquement. Vous pourrez le modifier à tout moment depuis le menu.
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-6 sm:px-8 sm:py-8">
            <div className="space-y-10 pb-2">
              {USER_OBJECTIVE_CATEGORY_ORDER.map((cat) => {
                const items = grouped.get(cat);
                if (!items?.length) return null;
                return (
                  <section key={cat}>
                    <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-muted">
                      {items[0]!.categoryLabelFr}
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((o) => (
                        <button
                          key={o.slug}
                          type="button"
                          disabled={busySlug !== null}
                          onClick={() => void onPick(o.slug)}
                          className="group flex flex-col rounded-2xl border border-line bg-surface p-4 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md disabled:opacity-60"
                        >
                          <span className="text-sm font-black text-text group-hover:text-primary sm:text-base">
                            {busySlug === o.slug ? 'Enregistrement…' : o.labelFr}
                          </span>
                          <span className="mt-1.5 text-xs font-medium leading-relaxed text-muted">{o.teaserFr}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>

          <div className="shrink-0 border-t border-line bg-[#fdf8ef] px-5 py-5 sm:px-8 sm:py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-medium text-muted">
                Vous préférez explorer d&apos;abord ? Aucun problème — vous restez sur l&apos;expérience générique.
              </p>
              <button
                type="button"
                disabled={busySlug !== null}
                onClick={() => void onSkip()}
                className="rounded-xl border border-line bg-inset px-5 py-2.5 text-xs font-black uppercase tracking-widest text-text transition-colors hover:bg-primary-soft disabled:opacity-50"
              >
                {busySlug === '__skip__' ? '…' : "Passer pour l'instant"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
