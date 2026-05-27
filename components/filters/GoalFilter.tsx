'use client'

type Option = { value: string; label: string }

const options: Option[] = [
  { value: 'all', label: 'Tous les objectifs' },
  { value: 'tourism', label: 'Tourisme' },
  { value: 'study', label: 'Études' },
  { value: 'work', label: 'Travail' },
  { value: 'business', label: 'Affaires' },
  { value: 'short_course', label: 'Séjour court' },
]

const GOAL_LABELS: Record<string, string> = Object.fromEntries(
  options.map((o) => [o.value, o.label]),
)

export default function GoalFilter({
  value = 'all',
  onChange,
  locked = false,
  lockedLabel,
}: {
  value?: string
  onChange?: (value: string) => void
  locked?: boolean
  lockedLabel?: string
}) {
  if (locked && value !== 'all') {
    const display = lockedLabel ?? GOAL_LABELS[value] ?? value
    return (
      <div
        className="rounded-xl border border-white/20 bg-[#111827] px-3 py-2 text-sm font-bold text-slate-200"
        aria-label={`Parcours verrouillé : ${display}`}
      >
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Parcours</span>
        <span className="ml-2">{display}</span>
      </div>
    )
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="rounded-xl border border-white/15 bg-[#111827] px-3 py-2 text-sm font-bold text-slate-200"
      aria-label="Objectif"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
