'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const GOAL_LABELS: Record<string, string> = {
  all: 'Tous les objectifs',
  study: 'Études longues',
  education: 'Éducation',
  work: 'Travail',
  business: 'Affaires',
  tourism: 'Tourisme',
  short_course: 'Formation courte',
}

export type FilterBarProps = {
  goalValue?: string
  regionValue?: string
  onGoalChange?: (value: string) => void
  onRegionChange?: (value: string) => void
  /** When set, goal filter is read-only (primary interest locked). */
  goalLocked?: boolean
  goalLockedLabel?: string
  /** Hide region control (e.g. when ExplorerFilterPanel owns region). */
  hideRegion?: boolean
  className?: string
}

export function FilterBar({
  goalValue,
  regionValue,
  onGoalChange,
  onRegionChange,
  goalLocked = false,
  goalLockedLabel,
  hideRegion = false,
  className,
}: FilterBarProps = {}) {
  const goalControlled = goalValue !== undefined
  const regionControlled = regionValue !== undefined
  const lockedDisplay =
    goalLockedLabel ??
    (goalValue && goalValue !== 'all' ? GOAL_LABELS[goalValue] : undefined) ??
    'Parcours verrouillé'

  return (
    <div
      role="group"
      aria-label="Filtres de l’explorateur"
      className={cn(
        'mb-6 flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 shadow-soft sm:flex-row sm:flex-wrap',
        className,
      )}
    >
      {goalLocked ? (
        <div
          className="flex w-full min-w-0 items-center rounded-xl border border-[#0D1B3E]/12 bg-[#FDFBF4] px-4 py-2.5 sm:w-[190px]"
          aria-label={`Parcours verrouillé : ${lockedDisplay}`}
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-[#0D1B3E]/55">
            Parcours
          </span>
          <span className="ml-2 truncate text-sm font-bold text-[#0D1B3E]">{lockedDisplay}</span>
        </div>
      ) : (
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
      )}

      {!hideRegion ? (
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
      ) : null}
    </div>
  )
}
