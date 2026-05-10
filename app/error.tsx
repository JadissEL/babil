'use client';

import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { useEffect } from 'react';

/**
 * Error boundary segment (App Router) — F.86 / G.90.
 * Couvre les erreurs de rendu sous le layout racine (hors erreurs du layout lui-même).
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <h1 className="text-2xl font-black text-text">Une erreur est survenue</h1>
      <p className="text-sm font-semibold text-muted">
        Vous pouvez réessayer ou retourner à l’accueil.
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
          href="/"
          className="rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-bold text-text"
        >
          Accueil
        </Link>
      </div>
    </div>
  );
}
