'use client';

import { FileBarChart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type Props = {
  countryName: string;
};

/**
 * Lightweight upsell aligned with existing public data (no extra PII collection on this surface).
 */
export function DeepReportTeaser({ countryName }: Props) {
  return (
    <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-line bg-surface p-5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex min-w-0 items-start gap-4">
        <div className="rounded-2xl bg-accent/15 p-3 text-accent ring-1 ring-accent/25">
          <FileBarChart className="h-7 w-7" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-accent">
            Rapport approfondi
          </p>
          <p className="mt-1 text-base font-black text-text sm:text-lg">
            Croiser probabilités et friction pour {countryName}
          </p>
          <p className="mt-1 text-sm font-medium text-muted">
            Le moteur de probabilités et les demandes déléguées s’appuient sur les mêmes signaux que
            cette fiche — sans vous demander plus de données ici.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
        <Link
          href="/probability"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-soft transition-colors hover:bg-primary-hover"
        >
          Voir les probabilités
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link
          href="/services/delegated-applications"
          className="text-center text-[10px] font-bold uppercase tracking-widest text-muted underline-offset-2 transition-colors hover:text-primary hover:underline sm:text-right"
        >
          Accompagnement dossier
        </Link>
      </div>
    </div>
  );
}
