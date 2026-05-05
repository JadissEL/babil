export default function CountryScoreBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 75
      ? 'from-[#22a06b] to-[#5fc690]'
      : value >= 55
        ? 'from-[#3157d5] to-[#5b7af0]'
        : value >= 35
          ? 'from-[#de8f1c] to-[#f5b14a]'
          : 'from-[#dc4b4b] to-[#f08080]'
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-3.5 w-full overflow-hidden rounded-full border border-[#e5d9c7] bg-[#f3eadb]">
        <div className={`h-full bg-gradient-to-r ${color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  )
}

