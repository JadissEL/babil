import Link from 'next/link'
import type { CompareRow } from '@/lib/compare-rows'
import { CTA_COMPARE_TOURISM_HREF, CTA_EXPLORE_HREF } from '@/lib/cta-hrefs'
import { cn } from '@/lib/utils'

export type CompareTableProps = {
  rows: CompareRow[]
  winnerId: number | null
  objectiveLabel: string
  scoringRationale: string
  /** e.g. 2+ countries and a winner */
  recommendation: string | null
}

function CompareMobileCards({ rows, winnerId }: Pick<CompareTableProps, 'rows' | 'winnerId'>) {
  return (
    <div className="space-y-3 md:hidden">
      {rows.map((c) => {
        const isWinner = winnerId != null && c.id === winnerId
        return (
          <div
            key={c.id}
            className={cn(
              'rounded-2xl border border-line bg-surface p-4 shadow-soft',
              isWinner && 'bg-[#e9f9f1] ring-1 ring-[#94dfbd]',
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                {isWinner && (
                  <span className="shrink-0 rounded-md bg-white/70 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-success ring-1 ring-[#94dfbd]">
                    Meilleur
                  </span>
                )}
                <span className="font-black text-text">{c.name}</span>
              </div>
              <span className="shrink-0 text-lg font-black text-primary">{c.composite.toFixed(1)}</span>
            </div>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted">Score objectif</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              {c.kpis.map((k) => (
                <div key={k.key} className={k.key === 'phd' ? 'col-span-2' : ''}>
                  <dt className="text-[10px] font-black uppercase tracking-widest text-muted" title={k.tooltip}>
                    {k.header}
                  </dt>
                  <dd className="mt-0.5 font-medium text-text">
                    {k.key === 'phd' && k.value === 'Oui' ? (
                      <Link
                        href={`/countries/${c.id}`}
                        className="font-black text-primary underline decoration-primary/30 underline-offset-2"
                      >
                        Voir fiche
                      </Link>
                    ) : (
                      k.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )
      })}
    </div>
  )
}

export function CompareTable({
  rows,
  winnerId,
  objectiveLabel,
  scoringRationale,
  recommendation,
}: CompareTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-inset p-8 text-center text-muted sm:p-12">
        <p className="mb-6 font-medium">Sélectionnez au moins un pays pour afficher le tableau.</p>
        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={CTA_EXPLORE_HREF}
            className="inline-flex justify-center rounded-xl bg-primary px-6 py-3 text-sm font-black text-white shadow-soft transition-colors hover:bg-primary-hover"
          >
            Choisir dans l&apos;explorateur
          </Link>
          <Link
            href={CTA_COMPARE_TOURISM_HREF}
            className="inline-flex justify-center rounded-xl border border-line bg-surface px-6 py-3 text-sm font-black text-text transition-colors hover:bg-primary-soft"
          >
            Exemple : comparer (tourisme)
          </Link>
        </div>
      </div>
    )
  }

  const headers = rows[0]?.kpis ?? []

  return (
    <div id="compare-table-anchor" className="min-w-0 space-y-4">
      <div className="rounded-2xl border border-line bg-inset p-4 text-sm leading-relaxed text-text shadow-soft sm:p-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted">Objectif · {objectiveLabel}</p>
        <p className="mt-2 font-medium text-text">{scoringRationale}</p>
        {recommendation ? (
          <p className="mt-3 border-t border-line pt-3 text-sm font-bold text-primary">{recommendation}</p>
        ) : null}
      </div>

      <CompareMobileCards rows={rows} winnerId={winnerId} />

      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface shadow-card md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-inset">
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">Pays</th>
              {headers.map((h) => (
                <th
                  key={h.key}
                  className="p-4 text-[10px] font-black uppercase tracking-widest text-muted"
                  title={h.tooltip}
                >
                  {h.header}
                </th>
              ))}
              <th
                className="p-4 text-[10px] font-black uppercase tracking-widest text-muted"
                title="Score 0–100 selon les poids de votre objectif (voir encadré ci-dessus)."
              >
                Score objectif
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((c) => {
              const isWinner = winnerId != null && c.id === winnerId
              return (
                <tr
                  key={c.id}
                  className={cn(
                    'transition-colors',
                    isWinner ? 'bg-[#e9f9f1] ring-1 ring-inset ring-[#94dfbd]' : 'hover:bg-inset',
                  )}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {isWinner && (
                        <span className="rounded-md bg-[#e9f9f1] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-success">
                          Meilleur
                        </span>
                      )}
                      <span className="font-bold text-text">{c.name}</span>
                    </div>
                  </td>
                  {c.kpis.map((k) => (
                    <td key={k.key} className="p-4 font-medium text-muted" title={k.tooltip}>
                      {k.key === 'phd' && k.value === 'Oui' ? (
                        <Link
                          href={`/countries/${c.id}`}
                          className="font-black text-primary underline decoration-primary/30 underline-offset-2 hover:text-primary-hover"
                          title="Fiche pays — bloc doctorat"
                        >
                          Oui
                        </Link>
                      ) : (
                        k.value
                      )}
                    </td>
                  ))}
                  <td className="p-4 font-black text-primary">{c.composite.toFixed(1)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
