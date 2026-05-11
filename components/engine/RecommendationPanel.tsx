import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

function CompassScoreBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2.5 w-full overflow-hidden rounded-full bg-[#0D1B3E]/10"
    >
      <div className="h-full rounded-full bg-[#0D1B3E] transition-[width] duration-300" style={{ width: `${pct}%` }} />
    </div>
  )
}

export type RecommendationResultRow = {
  country: string
  /** Identifiant pays (reco API) — utilisé pour le mode comparaison. */
  countryId?: number
  score: number
  explanation: string[]
  /** Index affiché (1-based) */
  rank?: number
  subtitle?: string
  warnings?: string[]
  /** Signaux fiche pays (acceptation, friction…) — pas de texte générique répété. */
  sheetSignalsSummary?: string
  hasPhdStudies?: boolean
}

export function RecommendationPanel({
  results,
  compareMode,
  compareSelectedIds,
  onCompareToggle,
  variant = 'default',
}: {
  results: RecommendationResultRow[]
  compareMode?: boolean
  compareSelectedIds?: number[]
  onCompareToggle?: (countryId: number) => void
  /** `compass` — PAGE 06 Stitch (fond crème / cartes claires, barres marine). */
  variant?: 'default' | 'compass'
}) {
  const selected = new Set(compareSelectedIds ?? [])
  const isCompass = variant === 'compass'

  return (
    <div className={cn(isCompass ? 'space-y-4' : 'space-y-6')}>
      {results.map((r, i) => (
        <div
          key={`${r.country}-${i}`}
          className={
            isCompass
              ? 'rounded-2xl border border-[#0D1B3E]/10 bg-white p-5 shadow-sm sm:p-6'
              : 'rounded-xl border border-gray-800 bg-[#111827] p-4 sm:p-5'
          }
        >
          <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-3">
              {compareMode && r.countryId != null && onCompareToggle ? (
                <label className="flex shrink-0 cursor-pointer items-center pt-1">
                  <input
                    type="checkbox"
                    className={cn(
                      'h-4 w-4 rounded focus:ring-primary',
                      isCompass
                        ? 'border-[#0D1B3E]/30 text-[#0D1B3E] focus:ring-[#0D1B3E]/40'
                        : 'border-slate-500 bg-slate-800 text-primary focus:ring-primary',
                    )}
                    checked={selected.has(r.countryId)}
                    disabled={!selected.has(r.countryId) && selected.size >= 3}
                    onChange={() => onCompareToggle(r.countryId!)}
                    aria-label={`Comparer ${r.country}`}
                  />
                </label>
              ) : null}
              <div className="flex gap-3">
                {r.rank != null &&
                  (isCompass ? (
                    <span
                      className="inline-flex h-8 shrink-0 items-center bg-[#0D1B3E] px-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-white"
                      aria-hidden
                    >
                      Rank #{r.rank}
                    </span>
                  ) : (
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-sm font-black text-blue-300 ring-1 ring-blue-500/35"
                      aria-hidden
                    >
                      {r.rank}
                    </span>
                  ))}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={cn(
                        'font-semibold',
                        isCompass ? 'text-lg font-black text-[#0D1B3E]' : 'text-white',
                      )}
                    >
                      {r.country}
                    </h3>
                    {r.hasPhdStudies ? (
                      <span
                        className={
                          isCompass
                            ? 'rounded-full border border-[#0D1B3E]/20 bg-[#0D1B3E]/5 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#0D1B3E]'
                            : 'rounded-full border border-blue-500/40 bg-blue-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-300'
                        }
                      >
                        Doctorat
                      </span>
                    ) : null}
                  </div>
                  {r.subtitle ? (
                    <p
                      className={cn(
                        'mt-0.5 text-xs font-medium uppercase tracking-wider',
                        isCompass ? 'text-[#0D1B3E]/50' : 'text-slate-500',
                      )}
                    >
                      {r.subtitle}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
            <span
              className={cn('shrink-0 text-sm', isCompass ? 'font-black text-[#0D1B3E]' : 'text-gray-400')}
            >
              {r.score}/100
            </span>
          </div>

          {isCompass ? <CompassScoreBar value={r.score} /> : <Progress value={r.score} />}

          {r.sheetSignalsSummary ? (
            <p
              className={cn(
                'mt-3 rounded-lg border p-3 text-xs font-medium leading-relaxed',
                isCompass
                  ? 'border-[#0D1B3E]/10 bg-[#FDFBF4] text-[#0D1B3E]/80'
                  : 'border-slate-600/60 bg-slate-900/40 text-slate-400',
              )}
            >
              <span className={cn('font-black', isCompass ? 'text-[#0D1B3E]/60' : 'text-slate-500')}>
                Fiche pays ·{' '}
              </span>
              {r.sheetSignalsSummary}
            </p>
          ) : null}

          {r.warnings && r.warnings.length > 0 ? (
            <p className={cn('mt-3 text-xs font-medium', isCompass ? 'text-amber-700' : 'text-red-400')}>
              {r.warnings[0]}
            </p>
          ) : null}

          <ul
            className={cn(
              'mt-3 list-disc space-y-1.5 pl-4 text-sm leading-relaxed sm:pl-5',
              isCompass ? 'text-[#0D1B3E]/75' : 'text-gray-400',
            )}
          >
            {r.explanation.map((e, j) => (
              <li key={`${r.country}-${i}-${j}`} className="break-words">
                {e}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default RecommendationPanel
