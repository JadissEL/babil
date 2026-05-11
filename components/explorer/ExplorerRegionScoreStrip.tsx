import type { RegionScoreBucket } from '@/lib/explorer-region-score-buckets'
import { cn } from '@/lib/utils'

const ATLAS_TILE_ORDER = ['europe', 'americas', 'asia', 'oceania'] as const

function heatBarClass(avg: number): string {
  if (avg >= 70) return 'bg-emerald-500'
  if (avg >= 55) return 'bg-amber-500'
  if (avg >= 35) return 'bg-red-400'
  return 'bg-slate-400'
}

type Props = {
  buckets: RegionScoreBucket[]
  className?: string
  /** `atlas` : tuiles compactes type Stitch (4 zones) ; `default` : vue régionale historique. */
  variant?: 'default' | 'atlas'
  /** Clé bucket (`europe`, `asia`, …) pour bordure « sélection » en variante atlas. */
  activeBucketKey?: string | null
}

/**
 * Vue régionale : moyenne des scores Babil par zone (pas une carte SVG).
 * Variante **atlas** : quatre tuiles (Europe, Amériques, Asie, Océanie) alignées maquette Stitch PAGE 02.
 */
export function ExplorerRegionScoreStrip({
  buckets,
  className = '',
  variant = 'default',
  activeBucketKey = null,
}: Props) {
  const hasAny = buckets.some((b) => b.countryCount > 0)

  if (variant === 'atlas') {
    const display = ATLAS_TILE_ORDER.map((k) => buckets.find((b) => b.key === k)).filter(
      (b): b is RegionScoreBucket => Boolean(b),
    )
    if (!display.length) return null

    return (
      <div
        className={cn('grid grid-cols-2 gap-3 sm:grid-cols-4', className)}
        aria-label="Scores moyens par grande zone"
      >
        {display.map((b) => {
          const scoreDisplay = b.countryCount ? Math.round(b.avgScore) : '—'
          const selected = activeBucketKey != null && activeBucketKey === b.key
          return (
            <div
              key={b.key}
              className={cn(
                'rounded-2xl border-2 bg-white p-4 shadow-sm transition-colors',
                selected ? 'border-[#0D1B3E]' : 'border-transparent',
              )}
              title={`${b.label} : moyenne ${b.avgScore}, ${b.countryCount} pays`}
            >
              <p className="text-xs font-bold text-muted">{b.label}</p>
              <p className="mt-1 text-4xl font-black tabular-nums tracking-tight text-[#0D1B3E]">
                {scoreDisplay}
              </p>
            </div>
          )
        })}
      </div>
    )
  }

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
