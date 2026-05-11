'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type FilterBarProps = {
  goalValue?: string
  regionValue?: string
  onGoalChange?: (value: string) => void
  onRegionChange?: (value: string) => void
  className?: string
}

export function FilterBar({
  goalValue,
  regionValue,
  onGoalChange,
  onRegionChange,
  className,
}: FilterBarProps = {}) {
  const goalControlled = goalValue !== undefined
  const regionControlled = regionValue !== undefined

  return (
    <div
      role="group"
      aria-label="Filtres de l’explorateur"
      className={cn(
        'mb-6 flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 shadow-soft sm:flex-row sm:flex-wrap',
        className,
      )}
    >
      <Select
        className="w-full min-w-0 sm:w-[190px]"
        value={goalControlled ? goalValue : undefined}
        defaultValue={goalControlled ? undefined : 'all'}
        onValueChange={(v) => onGoalChange?.(v)}
      >
        <SelectTrigger className="w-full" aria-label="Filtrer par objectif">
          <SelectValue placeholder="Objectif" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les objectifs</SelectItem>
          <SelectItem value="study">Études longues</SelectItem>
          <SelectItem value="education">Éducation</SelectItem>
          <SelectItem value="work">Travail</SelectItem>
          <SelectItem value="business">Affaires</SelectItem>
          <SelectItem value="tourism">Tourisme</SelectItem>
          <SelectItem value="short_course">Formation courte</SelectItem>
        </SelectContent>
      </Select>

      <Select
        className="w-full min-w-0 sm:w-[190px]"
        value={regionControlled ? regionValue : undefined}
        defaultValue={regionControlled ? undefined : 'all'}
        onValueChange={(v) => onRegionChange?.(v)}
      >
        <SelectTrigger className="w-full" aria-label="Filtrer par région">
          <SelectValue placeholder="Région" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les régions</SelectItem>
          <SelectItem value="schengen">Schengen</SelectItem>
          <SelectItem value="europe">Europe</SelectItem>
          <SelectItem value="asia">Asie</SelectItem>
          <SelectItem value="africa">Afrique</SelectItem>
          <SelectItem value="americas">Amériques</SelectItem>
          <SelectItem value="oceania">Océanie</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
