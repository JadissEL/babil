'use client'

import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export type CountryOption = { id: number; name: string }

export type CountryComparePickerProps = {
  options: CountryOption[]
  selectedIds: number[]
  max?: number
  search: string
  onSearchChange: (v: string) => void
  onToggle: (id: number) => void
  /** Top picks for current objective */
  suggestionIds?: number[]
  suggestionLabel?: string
  onAddSuggestions?: () => void
}

export function CountryComparePicker({
  options,
  selectedIds,
  max = 4,
  search,
  onSearchChange,
  onToggle,
  suggestionIds = [],
  suggestionLabel = 'Suggestions pour votre objectif',
  onAddSuggestions,
}: CountryComparePickerProps) {
  const q = search.trim().toLowerCase()
  const filtered = options.filter((o) => o.name.toLowerCase().includes(q))
  const suggestionOptions = suggestionIds
    .map((id) => options.find((o) => o.id === id))
    .filter(Boolean) as CountryOption[]
  const canAddSuggestionBlock = suggestionOptions.length > 0 && onAddSuggestions

  return (
    <Card className="border-line bg-surface">
      <CardContent className="space-y-3 p-4 sm:space-y-4 sm:p-5">
        {canAddSuggestionBlock ? (
          <div className="rounded-xl border border-primary/25 bg-primary-soft/40 p-3 sm:p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">{suggestionLabel}</p>
            <p className="mt-1 text-xs text-muted">
              Classement rapide selon l’objectif : ajoutez jusqu’à {max} pays recommandés en un geste.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestionOptions.map((o) => (
                <span
                  key={o.id}
                  className="rounded-lg border border-line bg-surface px-2 py-1 text-xs font-bold text-text"
                >
                  {o.name}
                </span>
              ))}
            </div>
            <Button type="button" variant="secondary" className="mt-3 w-full sm:w-auto" onClick={onAddSuggestions}>
              Ajouter ces suggestions
            </Button>
          </div>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Label htmlFor="compare-search">Recherche pays</Label>
            <p className="mt-1 text-xs text-muted">Jusqu&apos;à {max} destinations — cliquez pour ajouter / retirer.</p>
          </div>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            id="compare-search"
            className="min-h-[2.75rem] pl-10 text-base sm:min-h-0 sm:text-sm"
            placeholder="Italie, France…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="max-h-[min(17.5rem,42vh)] space-y-2 overflow-y-auto overscroll-contain pr-1 sm:max-h-72">
          {filtered.map((o) => {
            const active = selectedIds.includes(o.id)
            const disabled = !active && selectedIds.length >= max
            return (
              <Button
                key={o.id}
                type="button"
                variant={active ? 'default' : 'outline'}
                disabled={disabled}
                className={cn('h-auto min-h-[3rem] w-full justify-between gap-2 px-3 py-3 text-left sm:min-h-0', disabled && 'opacity-40')}
                onClick={() => onToggle(o.id)}
              >
                <span className="font-bold">{o.name}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted">
                  {active ? 'Sélectionné' : disabled ? 'Max' : 'Ajouter'}
                </span>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
