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
    <div className={cn('mb-6 flex flex-wrap gap-4 rounded-2xl border border-line bg-surface p-4 shadow-soft', className)}>
      <Select
        value={goalControlled ? goalValue : undefined}
        defaultValue={goalControlled ? undefined : ''}
        onValueChange={(v) => onGoalChange?.(v)}
      >
        <SelectTrigger className="w-[190px]">
          <SelectValue placeholder="Objectif" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tous les objectifs</SelectItem>
          <SelectItem value="study">Études longues</SelectItem>
          <SelectItem value="education">Éducation</SelectItem>
          <SelectItem value="work">Travail</SelectItem>
          <SelectItem value="business">Affaires</SelectItem>
          <SelectItem value="tourism">Tourisme</SelectItem>
          <SelectItem value="short_course">Formation courte</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={regionControlled ? regionValue : undefined}
        defaultValue={regionControlled ? undefined : ''}
        onValueChange={(v) => onRegionChange?.(v)}
      >
        <SelectTrigger className="w-[190px]">
          <SelectValue placeholder="Région" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Toutes les régions</SelectItem>
          <SelectItem value="schengen">Schengen</SelectItem>
          <SelectItem value="europe">Europe</SelectItem>
          <SelectItem value="asia">Asie</SelectItem>
          <SelectItem value="africa">Afrique</SelectItem>
          <SelectItem value="americas">Amériques</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
