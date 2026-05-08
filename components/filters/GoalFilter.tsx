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

export default function GoalFilter({ value = 'all', onChange }: { value?: string; onChange?: (value: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange?.(e.target.value)} className="rounded-xl border border-white/15 bg-[#111827] px-3 py-2 text-sm font-bold text-slate-200">
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

