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
          <SelectValue placeholder="Goal" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All goals</SelectItem>
          <SelectItem value="study">Study</SelectItem>
          <SelectItem value="education">Education</SelectItem>
          <SelectItem value="work">Work</SelectItem>
          <SelectItem value="business">Business</SelectItem>
          <SelectItem value="tourism">Tourism</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={regionControlled ? regionValue : undefined}
        defaultValue={regionControlled ? undefined : ''}
        onValueChange={(v) => onRegionChange?.(v)}
      >
        <SelectTrigger className="w-[190px]">
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All regions</SelectItem>
          <SelectItem value="schengen">Schengen</SelectItem>
          <SelectItem value="europe">Europe</SelectItem>
          <SelectItem value="asia">Asia</SelectItem>
          <SelectItem value="africa">Africa</SelectItem>
          <SelectItem value="americas">Americas</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
