'use client';

import * as Sentry from '@sentry/nextjs';
import { RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';

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

  const referenceCode = useMemo(() => buildReferenceCode(error), [error]);

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12 sm:px-8"
      style={{ backgroundColor: '#FAF7EE' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(13,27,62,0.10), rgba(13,27,62,0.02) 60%, transparent 75%)',
        }}
      />

      <div
        role="alert"
        aria-live="polite"
        className="relative w-full max-w-md rounded-2xl border bg-white px-8 py-10 text-center shadow-[0_18px_60px_-30px_rgba(13,27,62,0.18)] sm:px-10 sm:py-12"
        style={{ borderColor: 'rgba(13,27,62,0.10)' }}
      >
        <div className="flex items-center gap-2 text-left">
          <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-rose-500" />
          <span className="font-mono text-[11px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/70">
            System Fault
          </span>
        </div>

        <GlitchMark className="mx-auto mt-10 h-6 w-24 text-[#0D1B3E]/45" />

        <h1
          className="mt-8 font-serif font-black tracking-tight text-[#0D1B3E]"
          style={{ fontSize: 'clamp(1.5rem, 3.5vw, 1.875rem)', lineHeight: 1.1 }}
        >
          Une erreur est survenue
        </h1>

        <p className="mx-auto mt-4 max-w-sm font-serif text-[14px] font-medium leading-[1.65] text-[#0D1B3E]/65">
          Nous n’avons pas pu charger ce composant. Vous pouvez réessayer ou retourner à l’accueil
          pour reprendre votre session.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0D1B3E] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0D1B3E]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3E]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <RefreshCcw className="h-4 w-4" aria-hidden />
            Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-xl border bg-white px-5 py-3 text-sm font-bold text-[#0D1B3E] transition-colors hover:border-[#0D1B3E] hover:bg-[#0D1B3E]/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3E]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            style={{ borderColor: 'rgba(13,27,62,0.20)' }}
          >
            Accueil
          </Link>
        </div>

        <p className="mt-8 font-mono text-[10px] font-black uppercase tracking-[0.26em] text-[#0D1B3E]/45">
          Code de référence : ERR-{referenceCode}
        </p>
      </div>
    </div>
  );
}

function GlitchMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 32" role="presentation" aria-hidden className={className}>
      <line
        x1="14"
        y1="10"
        x2="78"
        y2="10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="22"
        y1="18"
        x2="98"
        y2="18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="34"
        y1="26"
        x2="86"
        y2="26"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function buildReferenceCode(error: Error & { digest?: string }): string {
  if (error.digest && /^[A-Za-z0-9]+$/.test(error.digest)) {
    return error.digest.slice(0, 4).toUpperCase();
  }
  const seed = `${error.name ?? ''}|${error.message ?? ''}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const code = hash.toString(16).toUpperCase().padStart(4, '0').slice(-4);
  return code || 'XXXX';
}
