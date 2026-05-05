const tabs = [
  { id: 'languages', label: 'Languages' },
  { id: 'technical', label: 'Technical' },
  { id: 'short', label: 'Short Courses' },
]

export default function EducationTabs({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-[#111827] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`rounded-lg px-3 py-2 text-xs font-black uppercase tracking-widest transition-colors ${
            value === tab.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

