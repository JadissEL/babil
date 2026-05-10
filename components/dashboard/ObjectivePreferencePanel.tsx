'use client';

import { Target } from 'lucide-react';
import Link from 'next/link';
import { HeaderObjectiveSelector } from '@/components/objectives/HeaderObjectiveSelector';
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider';

export function ObjectivePreferencePanel() {
  const { preference, primaryDefinition, ready, reopenWizard } = useObjectivePreference();

  if (!ready) {
    return (
      <div
        className="mb-8 animate-pulse rounded-2xl border border-line bg-surface p-6 shadow-soft sm:rounded-3xl sm:p-8"
        aria-hidden
      />
    );
  }

  return (
    <section className="mb-8 rounded-2xl border border-primary/20 bg-primary-soft/30 p-5 shadow-soft sm:rounded-3xl sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="rounded-2xl bg-primary p-3 text-white shadow-md">
            <Target className="h-6 w-6 shrink-0" aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Objectif principal</p>
            <h2 className="mt-1 text-lg font-black text-text sm:text-xl">
              {primaryDefinition?.labelFr ?? 'Non défini — expérience générique'}
            </h2>
            <p className="mt-1 text-sm font-medium text-muted">
              L&apos;accueil et les raccourcis s&apos;alignent sur cet objectif. Changez-le à tout moment.
            </p>
            {preference.secondarySlugs.length > 0 ? (
              <p className="mt-2 text-xs font-semibold text-muted">
                Centres d&apos;intérêt secondaires : {preference.secondarySlugs.length} enregistré(s) localement.
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <HeaderObjectiveSelector className="w-full min-w-[12rem] sm:w-auto" />
          <button
            type="button"
            onClick={() => void reopenWizard()}
            className="text-left text-xs font-black uppercase tracking-wider text-primary underline-offset-2 hover:underline sm:text-right"
          >
            Revoir l&apos;assistant objectifs
          </button>
          <Link
            href="/"
            className="text-left text-xs font-bold text-muted underline-offset-2 hover:text-primary hover:underline sm:text-right"
          >
            Voir l&apos;accueil personnalisé
          </Link>
        </div>
      </div>
    </section>
  );
}
