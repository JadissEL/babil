'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/** Error boundary pour l’espace connecté — F.86. */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[40vh] max-w-lg flex-col items-center justify-center gap-6 px-4 py-12 text-center">
      <h1 className="text-2xl font-black text-text">Erreur dans l’espace connecté</h1>
      <p className="text-sm font-semibold text-muted">
        Réessayez ou ouvrez une autre page du tableau de bord.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-white shadow-soft"
        >
          Réessayer
        </button>
        <Link
          href="/overview"
          className="rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-bold text-text"
        >
          Tableau de bord
        </Link>
        <Link href="/" className="text-sm font-bold text-primary underline">
          Accueil
        </Link>
      </div>
    </div>
  );
}
