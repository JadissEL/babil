export default function CountryBadge({ label, tone = 'neutral' }: { label: string; tone?: 'success' | 'warning' | 'danger' | 'neutral' }) {
  const classes =
    tone === 'success'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      : tone === 'warning'
        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
        : tone === 'danger'
          ? 'bg-red-500/15 text-red-300 border-red-500/30'
          : 'bg-white/5 text-slate-300 border-white/15'

  return <span className={`rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-widest ${classes}`}>{label}</span>
}

