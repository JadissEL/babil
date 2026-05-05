'use client'

const options = [
  { value: 'all', label: 'All Regions' },
  { value: 'Schengen', label: 'Schengen' },
  { value: 'Europe', label: 'Europe' },
  { value: 'Africa', label: 'Africa' },
  { value: 'Asia', label: 'Asia' },
  { value: 'Americas', label: 'Americas' },
]

export default function RegionFilter({ value = 'all', onChange }: { value?: string; onChange?: (value: string) => void }) {
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

