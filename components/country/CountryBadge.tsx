export default function CountryBadge({ label, tone = 'neutral' }: { label: string; tone?: 'success' | 'warning' | 'danger' | 'neutral' }) {
  const classes =
    tone === 'success'
      ? 'bg-[#e9f9f1] text-success border-[#94dfbd]'
      : tone === 'warning'
        ? 'bg-[#fff5e7] text-warning border-[#f2c27a]'
        : tone === 'danger'
          ? 'bg-[#fff0f0] text-danger border-[#f3afaf]'
          : 'bg-[#f8f2e8] text-muted border-line'

  return <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${classes}`}>{label}</span>
}

