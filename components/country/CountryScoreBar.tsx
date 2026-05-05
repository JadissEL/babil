export default function CountryScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 75 ? 'bg-emerald-500' : value >= 55 ? 'bg-amber-500' : value >= 35 ? 'bg-red-500' : 'bg-slate-800'
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className={`h-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  )
}

