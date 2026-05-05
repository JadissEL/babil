'use client'

const options = [
  { value: 'all', label: 'All Risks' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export default function RiskFilter({ value = 'all', onChange }: { value?: string; onChange?: (value: string) => void }) {
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

