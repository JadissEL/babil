import Link from 'next/link'

import type { CompareRow } from '@/lib/compare-rows'

import { cn } from '@/lib/utils'

export type CompareTableProps = {
  rows: CompareRow[]
  /** id du pays avec le meilleur score composite */
  winnerId: number | null
}

function CompareMobileCards({ rows, winnerId }: CompareTableProps) {
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
              <span className="shrink-0 text-lg font-black text-primary">{c.composite}</span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              <div>
                <dt className="text-[10px] font-black uppercase tracking-widest text-muted">Visa</dt>
                <dd className="mt-0.5 font-bold text-text">{c.visaScore}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-black uppercase tracking-widest text-muted">Friction</dt>
                <dd className="mt-0.5 font-medium text-muted">{c.friction}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-black uppercase tracking-widest text-muted">Études</dt>
                <dd className="mt-0.5 font-medium text-muted">{c.study}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-black uppercase tracking-widest text-muted">Business</dt>
                <dd className="mt-0.5 font-medium text-muted">{c.business}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[10px] font-black uppercase tracking-widest text-muted">PhD (fiche)</dt>
                <dd className="mt-0.5">
                  {c.phdStructuredData ? (
                    <Link
                      href={`/countries/${c.id}`}
                      className="font-black text-primary underline decoration-primary/30 underline-offset-2"
                    >
                      Voir la fiche pays
                    </Link>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        )
      })}
    </div>
  )
}

export function CompareTable({ rows, winnerId }: CompareTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-inset p-8 text-center text-muted sm:p-12">
        Sélectionnez au moins un pays pour afficher le tableau.
      </div>
    )
  }

  return (
    <div id="compare-table-anchor" className="min-w-0">
      <CompareMobileCards rows={rows} winnerId={winnerId} />
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface shadow-card md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-inset">
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">Pays</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">Visa (0–100)</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">Friction</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">Études</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">PhD (data)</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">Business</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">Score</th>
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
                  <td className="p-4 font-medium text-muted">{c.visaScore}</td>
                  <td className="p-4 font-medium text-muted">{c.friction}</td>
                  <td className="p-4 font-medium text-muted">{c.study}</td>
                  <td className="p-4 font-medium">
                    {c.phdStructuredData ? (
                      <Link
                        href={`/countries/${c.id}`}
                        className="font-black text-primary underline decoration-primary/30 underline-offset-2 hover:text-primary-hover"
                        title="Ouvrir la fiche pays — bloc Doctorat (PhD)"
                      >
                        Oui
                      </Link>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="p-4 font-medium text-muted">{c.business}</td>
                  <td className="p-4 font-black text-primary">{c.composite}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
