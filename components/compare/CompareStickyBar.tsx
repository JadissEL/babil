'use client'

import { Scale, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

export type CompareStickyBarProps = {
  names: string[]
  max: number
  objectiveShortLabel?: string
  onClear: () => void
  onScrollToTable: () => void
}

export function CompareStickyBar({ names, max, objectiveShortLabel, onClear, onScrollToTable }: CompareStickyBarProps) {
  if (names.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-2 sm:px-4 sm:pb-4">
      <div className="pointer-events-auto flex w-full max-w-4xl flex-col gap-3 rounded-2xl border border-line bg-surface/95 px-3 py-3 shadow-card backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="min-w-0 sm:flex sm:flex-1 sm:items-center">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted sm:text-sm">
            <Scale className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            <span className="font-black text-text">
              {names.length}/{max}
            </span>
            <span className="hidden text-muted sm:inline" aria-hidden>
              —
            </span>
            <span className="w-full min-w-0 line-clamp-2 break-words font-medium leading-snug text-text sm:w-auto sm:max-w-[min(100%,28rem)]">
              {objectiveShortLabel ? (
                <>
                  <span className="font-black text-primary">{objectiveShortLabel}</span>
                  <span className="text-muted"> · </span>
                </>
              ) : null}
              {names.join(' · ')}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:flex-row sm:gap-2">
          <Button
            type="button"
            variant="secondary"
            className="text-[10px] font-black uppercase tracking-wider sm:text-xs"
            onClick={onScrollToTable}
          >
            <span className="sm:hidden">Tableau</span>
            <span className="hidden sm:inline">Voir le tableau</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-1 text-[10px] font-black uppercase tracking-wider sm:text-xs"
            onClick={onClear}
          >
            <X className="h-4 w-4 shrink-0" aria-hidden /> Effacer
          </Button>
        </div>
      </div>
    </div>
  )
}
