'use client'

import * as Sentry from '@sentry/nextjs'
import { Archive, BarChart3, FileWarning, Map, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

/** Error boundary pour l'espace connecté — F.86 / G.90. */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
    Sentry.captureException(error)
  }, [error])

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: '#FAF7EE' }}
    >
      <div className="mx-auto grid min-h-screen max-w-[1280px] grid-cols-1 lg:grid-cols-[220px_1fr]">
        <aside
          aria-hidden
          className="hidden border-r bg-white/40 px-5 py-8 opacity-40 lg:flex lg:flex-col"
          style={{ borderColor: 'rgba(13,27,62,0.10)' }}
        >
          <div>
            <p className="font-serif text-2xl font-black tracking-tight text-[#0D1B3E]">
              Intelligence
            </p>
            <p className="mt-1 font-mono text-[10px] font-black uppercase tracking-[0.26em] text-[#0D1B3E]/55">
              Mobility Terminal
            </p>
          </div>

          <ul className="mt-12 space-y-2">
            {[
              { Icon: BarChart3, label: 'Analytics' },
              { Icon: Map, label: 'Global Map' },
              { Icon: ShieldCheck, label: 'Policies' },
              { Icon: Archive, label: 'Archived' },
            ].map(({ Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#0D1B3E]/55"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-auto">
            <div
              className="rounded-xl border px-4 py-2.5 text-center text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/45"
              style={{ borderColor: 'rgba(13,27,62,0.15)' }}
            >
              Export Report
            </div>
          </div>
        </aside>

        <main className="flex items-center justify-center px-5 py-10 sm:px-8 sm:py-12">
          <div
            role="alert"
            aria-live="polite"
            className="w-full max-w-md rounded-2xl border bg-white px-8 py-10 text-center shadow-[0_18px_60px_-30px_rgba(13,27,62,0.18)] sm:px-10 sm:py-12"
            style={{ borderColor: 'rgba(13,27,62,0.10)' }}
          >
            <FileWarning
              className="mx-auto h-9 w-9 text-[#0D1B3E]/45"
              strokeWidth={1.5}
              aria-hidden
            />

            <p className="mt-6 font-mono text-[11px] font-black uppercase tracking-[0.26em] text-[#0D1B3E]/70">
              System Interrupt
            </p>

            <h1
              className="mt-3 font-serif font-black tracking-tight text-[#0D1B3E]"
              style={{ fontSize: 'clamp(1.5rem, 3.5vw, 1.875rem)', lineHeight: 1.1 }}
            >
              Erreur dans l’espace connecté
            </h1>

            <p className="mx-auto mt-4 max-w-sm font-serif text-[14px] font-medium leading-[1.65] text-[#0D1B3E]/65">
              Nous n’avons pas pu charger vos données personnelles. Vous pouvez réessayer ou
              retourner à votre tableau de bord.
            </p>

            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#0D1B3E] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0D1B3E]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3E]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Réessayer
              </button>
              <Link
                href="/overview"
                className="inline-flex w-full items-center justify-center rounded-xl border bg-white px-5 py-3 text-sm font-bold text-[#0D1B3E] transition-colors hover:border-[#0D1B3E] hover:bg-[#0D1B3E]/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3E]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                style={{ borderColor: 'rgba(13,27,62,0.20)' }}
              >
                Mon Tableau de bord
              </Link>
            </div>

            <div className="mt-5">
              <Link
                href="/"
                className="text-[13px] font-medium text-[#0D1B3E]/65 underline decoration-[#0D1B3E]/25 underline-offset-4 transition-colors hover:text-[#0D1B3E] hover:decoration-[#0D1B3E]"
              >
                Retour à l’accueil
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
