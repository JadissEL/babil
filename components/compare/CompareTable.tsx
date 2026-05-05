import type { CompareRow } from '@/lib/compare-rows'

import { cn } from '@/lib/utils'

export type CompareTableProps = {
  rows: CompareRow[]
  /** id du pays avec le meilleur score composite */
  winnerId: number | null
}

export function CompareTable({ rows, winnerId }: CompareTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-[#f8f2e8] p-12 text-center text-muted">
        Sélectionnez au moins un pays pour afficher le tableau.
      </div>
    )
  }

  return (
    <div id="compare-table-anchor" className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-[#f8f2e8]">
            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">Pays</th>
            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">Visa (0–100)</th>
            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">Friction</th>
            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">Études</th>
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
                  isWinner ? 'bg-[#e9f9f1] ring-1 ring-inset ring-[#94dfbd]' : 'hover:bg-[#f8f2e8]',
                )}
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {isWinner && (
                      <span className="rounded-md bg-[#e9f9f1] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-success">
                        Best
                      </span>
                    )}
                    <span className="font-bold text-text">{c.name}</span>
                  </div>
                </td>
                <td className="p-4 font-medium text-muted">{c.visaScore}</td>
                <td className="p-4 font-medium text-muted">{c.friction}</td>
                <td className="p-4 font-medium text-muted">{c.study}</td>
                <td className="p-4 font-medium text-muted">{c.business}</td>
                <td className="p-4 font-black text-primary">{c.composite}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
