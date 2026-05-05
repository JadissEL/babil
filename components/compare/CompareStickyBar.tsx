'use client'

import { Scale, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

export type CompareStickyBarProps = {
  names: string[]
  max: number
  onClear: () => void
  onScrollToTable: () => void
}

export function CompareStickyBar({ names, max, onClear, onScrollToTable }: CompareStickyBarProps) {
  if (names.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 pt-2">
      <div className="pointer-events-auto flex w-full max-w-4xl flex-col gap-3 rounded-2xl border border-line bg-surface/95 px-4 py-3 shadow-card backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Scale className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <span className="font-black text-text">
            {names.length}/{max}
          </span>
          <span className="text-muted">—</span>
          <span className="truncate font-medium">{names.join(' · ')}</span>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="text-xs font-black uppercase tracking-wider" onClick={onScrollToTable}>
            Voir le tableau
          </Button>
          <Button type="button" variant="outline" className="gap-1 text-xs font-black uppercase tracking-wider" onClick={onClear}>
            <X className="h-4 w-4" /> Effacer
          </Button>
        </div>
      </div>
    </div>
  )
}
