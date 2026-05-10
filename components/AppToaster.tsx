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
      className="pointer-events-none fixed bottom-0 right-0 z-[100] flex max-h-[50vh] w-full flex-col-reverse gap-2 overflow-y-auto p-4 sm:bottom-4 sm:right-4 sm:max-w-md sm:p-0"
      aria-live="polite"
      aria-relevant="additions"
    >
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-card backdrop-blur-sm',
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
            className="shrink-0 rounded-lg p-1 text-muted transition-colors hover:bg-black/5 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Fermer la notification"
            onClick={() => dismissToast(t.id)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
