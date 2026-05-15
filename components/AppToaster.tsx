'use client'

import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { dismissToast, getServerToastSnapshot, getToastSnapshot, subscribeToasts } from '@/lib/toast-store'
import { cn } from '@/lib/utils'

export function AppToaster() {
  const items = useSyncExternalStore(subscribeToasts, getToastSnapshot, getServerToastSnapshot)

  if (items.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed right-0 z-[100] flex max-h-[min(50dvh,calc(100dvh_-_8rem_-_env(safe-area-inset-bottom,0px)))] w-full flex-col-reverse gap-2 overflow-y-auto px-4 pb-[max(1rem,calc(0.75rem+env(safe-area-inset-bottom,0px)))] pt-4 pl-[max(1rem,env(safe-area-inset-left,0px))] sm:right-4 sm:max-h-[min(50dvh,45vh)] sm:max-w-md sm:p-0"
      style={{ bottom: 'max(1rem, calc(0.5rem + env(safe-area-inset-bottom, 0px)))' }}
      aria-live="polite"
      aria-relevant="additions"
    >
      {items.map((t) => (
        <div
          key={t.id}
          data-variant={t.variant}
          role={t.variant === 'error' ? 'alert' : undefined}
          className={cn(
            'pointer-events-auto flex animate-flare-in items-start gap-3 rounded-2xl border px-4 py-3 shadow-card backdrop-blur-sm',
            t.variant === 'success' && 'border-[#94dfbd]/60 bg-[#e9f9f1]/95 text-success',
            t.variant === 'error' && 'border-red-300/50 bg-[#fff0f0]/95 text-danger',
            t.variant === 'info' && 'border-primary/30 bg-primary-soft/90 text-text',
          )}
        >
          {t.variant === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          ) : t.variant === 'error' ? (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          ) : (
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
          )}
          <p className="min-w-0 flex-1 text-sm font-bold leading-snug">{t.message}</p>
          <button
            type="button"
            className="-mr-1 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-black/5 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Fermer la notification"
            onClick={() => dismissToast(t.id)}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  )
}
