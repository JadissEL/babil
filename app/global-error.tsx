'use client';

import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { useEffect } from 'react';

/**
 * Root layout failures (G.90 / F.86) — must define html/body; reports to Sentry when configured.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-4 text-center text-text antialiased">
        <h1 className="text-2xl font-black">Une erreur critique est survenue</h1>
        <p className="max-w-md text-sm font-semibold text-muted">
          Vous pouvez réessayer ou retourner à l&apos;accueil.
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
      </body>
    </html>
  );
}
