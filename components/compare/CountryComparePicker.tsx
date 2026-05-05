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
}

export function CountryComparePicker({
  options,
  selectedIds,
  max = 4,
  search,
  onSearchChange,
  onToggle,
}: CountryComparePickerProps) {
  const q = search.trim().toLowerCase()
  const filtered = options.filter((o) => o.name.toLowerCase().includes(q))

  return (
    <Card className="border-gray-800 bg-[#111827]">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Label htmlFor="compare-search">Recherche pays</Label>
            <p className="mt-1 text-xs text-slate-500">Jusqu&apos;à {max} destinations — cliquez pour ajouter / retirer.</p>
          </div>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            id="compare-search"
            className="pl-10"
            placeholder="Italie, France…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {filtered.map((o) => {
            const active = selectedIds.includes(o.id)
            const disabled = !active && selectedIds.length >= max
            return (
              <Button
                key={o.id}
                type="button"
                variant={active ? 'default' : 'outline'}
                disabled={disabled}
                className={cn('h-auto w-full justify-between py-3 text-left', disabled && 'opacity-40')}
                onClick={() => onToggle(o.id)}
              >
                <span className="font-bold">{o.name}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
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
