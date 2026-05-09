import { Progress } from '@/components/ui/progress'

export type RecommendationResultRow = {
  country: string
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

export function RecommendationPanel({ results }: { results: RecommendationResultRow[] }) {
  return (
    <div className="space-y-6">
      {results.map((r, i) => (
        <div key={`${r.country}-${i}`} className="rounded-xl border border-gray-800 bg-[#111827] p-4 sm:p-5">
          <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              {r.rank != null && (
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-sm font-black text-blue-300 ring-1 ring-blue-500/35"
                  aria-hidden
                >
                  {r.rank}
                </span>
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-white">{r.country}</h3>
                  {r.hasPhdStudies ? (
                    <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-300">
                      PhD
                    </span>
                  ) : null}
                </div>
                {r.subtitle ? (
                  <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-slate-500">
                    {r.subtitle}
                  </p>
                ) : null}
              </div>
            </div>
            <span className="shrink-0 text-sm text-gray-400">{r.score}/100</span>
          </div>

          <Progress value={r.score} />

          {r.sheetSignalsSummary ? (
            <p className="mt-3 rounded-lg border border-slate-600/60 bg-slate-900/40 p-3 text-xs font-medium leading-relaxed text-slate-400">
              <span className="font-black text-slate-500">Fiche pays · </span>
              {r.sheetSignalsSummary}
            </p>
          ) : null}

          {r.warnings && r.warnings.length > 0 ? (
            <p className="mt-3 text-xs font-medium text-red-400">{r.warnings[0]}</p>
          ) : null}

          <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-gray-400 sm:pl-5">
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
