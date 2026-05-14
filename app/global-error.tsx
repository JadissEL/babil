'use client'

import * as Sentry from '@sentry/nextjs'
import { AlertTriangle, Headphones, Home, RotateCw } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo } from 'react'

/**
 * Root layout failures (G.90 / F.86) — must define html/body; reports to Sentry when configured.
 * Inline critical styles act as a fallback if Tailwind / global CSS fails to load.
 */
export default function GlobalError({
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

  const errorCodeSuffix = useMemo(() => {
    if (error.digest && /^[A-Za-z0-9]+$/.test(error.digest)) {
      return error.digest.slice(0, 4).toUpperCase()
    }
    return null
  }, [error])

  const handleReload = () => {
    try {
      reset()
    } catch {
      if (typeof window !== 'undefined') window.location.reload()
    }
  }

  return (
    <html lang="fr">
      <body
        className="antialiased"
        style={{
          margin: 0,
          minHeight: '100vh',
          backgroundColor: '#FAF7EE',
          color: '#0D1B3E',
          fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
        }}
      >
        <main
          role="alert"
          aria-live="assertive"
          className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center overflow-hidden px-6 py-16 text-center sm:px-10"
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-md border bg-white"
            style={{ borderColor: 'rgba(220,38,38,0.30)' }}
            aria-hidden
          >
            <AlertTriangle className="h-7 w-7 text-rose-600" strokeWidth={1.75} />
          </div>

          <div className="relative mt-10 w-full">
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-sans font-black tracking-tight text-[#0D1B3E]/[0.07]"
              style={{ fontSize: 'clamp(4.5rem, 14vw, 9.5rem)', lineHeight: 1 }}
            >
              FAULT
            </span>
            <h1
              className="relative font-sans font-black tracking-tight text-[#0D1B3E]"
              style={{
                fontSize: 'clamp(1.875rem, 4.5vw, 2.75rem)',
                lineHeight: 1.05,
                fontFamily:
                  'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
              }}
            >
              Une erreur critique
              <br />
              est survenue
            </h1>
          </div>

          <p
            className="relative mt-6 max-w-xl font-medium leading-[1.7] text-[#0D1B3E]/65"
            style={{ fontSize: '15px' }}
          >
            L’application a rencontré un problème majeur. Vous pouvez tenter de recharger la page
            ou retourner à l’accueil pour réinitialiser votre session.
          </p>

          <button
            type="button"
            onClick={handleReload}
            className="relative mt-10 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D1B3E] px-7 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0D1B3E]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3E]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7EE]"
            style={{
              backgroundColor: '#0D1B3E',
              color: '#ffffff',
              fontFamily:
                'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            <RotateCw className="h-4 w-4" aria-hidden />
            Recharger l’application
          </button>

          <div
            className="relative mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px]"
            style={{ color: 'rgba(13,27,62,0.65)' }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-[#0D1B3E]"
            >
              <Home className="h-3.5 w-3.5" aria-hidden />
              Retourner à l’accueil
            </Link>
            <a
              href="mailto:support@visaflow.com?subject=Erreur%20critique%20VisaFlow"
              className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-[#0D1B3E]"
            >
              <Headphones className="h-3.5 w-3.5" aria-hidden />
              Contacter le support
            </a>
          </div>

          <p
            className="relative mt-10 inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.26em]"
            style={{
              color: 'rgba(13,27,62,0.45)',
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
            }}
          >
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: '#dc2626' }}
            />
            ERR_BOUNDARY_FAULT_GLOBAL{errorCodeSuffix ? `_${errorCodeSuffix}` : ''}
          </p>
        </main>
      </body>
    </html>
  )
}
