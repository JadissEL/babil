import type { RegionScoreBucket } from '@/lib/explorer-region-score-buckets'

function heatBarClass(avg: number): string {
  if (avg >= 70) return 'bg-emerald-500'
  if (avg >= 55) return 'bg-amber-500'
  if (avg >= 35) return 'bg-red-400'
  return 'bg-slate-400'
}

type Props = {
  buckets: RegionScoreBucket[]
  className?: string
}

/**
 * Vue régionale légère : moyenne des scores Babil par zone (pas une carte SVG).
 */
export function ExplorerRegionScoreStrip({ buckets, className = '' }: Props) {
  const hasAny = buckets.some((b) => b.countryCount > 0)
  if (!hasAny) return null

  return (
    <section
      className={`rounded-2xl border border-line bg-surface p-5 shadow-card sm:rounded-[2rem] sm:p-6 ${className}`}
      aria-labelledby="explorer-region-heatmap-heading"
    >
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted">Vue régionale</p>
        <h2 id="explorer-region-heatmap-heading" className="text-lg font-black text-text">
          Scores moyens par zone
        </h2>
        <p className="mt-1 text-xs font-medium text-muted">
          Moyenne du score final sur tout le catalogue (indépendamment des filtres ci-dessus). Utile pour situer une
          destination dans son bloc géographique.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {buckets.map((b) => (
          <div
            key={b.key}
            className="rounded-xl border border-line bg-inset p-3"
            title={`${b.label} : ${b.countryCount} pays`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-muted">{b.label}</span>
              <span className="text-lg font-black tabular-nums text-text">
                {b.countryCount ? b.avgScore : '—'}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line/80">
              <div
                className={`h-full rounded-full transition-all ${heatBarClass(b.avgScore)}`}
                style={{ width: b.countryCount ? `${Math.min(100, Math.max(4, b.avgScore))}%` : '0%' }}
              />
            </div>
            <p className="mt-1.5 text-[10px] font-bold text-muted">
              {b.countryCount} pays{b.countryCount === 1 ? '' : 's'}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
