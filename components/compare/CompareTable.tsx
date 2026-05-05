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
      <div className="rounded-2xl border border-dashed border-white/20 bg-[#111827]/50 p-12 text-center text-slate-500">
        Sélectionnez au moins un pays pour afficher le tableau.
      </div>
    )
  }

  return (
    <div id="compare-table-anchor" className="overflow-x-auto rounded-2xl border border-gray-800 bg-[#111827] shadow-lg shadow-black/20">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-800 bg-white/[0.04]">
            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Pays</th>
            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Visa (0–100)</th>
            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Friction</th>
            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Études</th>
            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Business</th>
            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {rows.map((c) => {
            const isWinner = winnerId != null && c.id === winnerId
            return (
              <tr
                key={c.id}
                className={cn(
                  'transition-colors',
                  isWinner ? 'bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/40' : 'hover:bg-white/[0.03]',
                )}
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {isWinner && (
                      <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                        Best
                      </span>
                    )}
                    <span className="font-bold text-white">{c.name}</span>
                  </div>
                </td>
                <td className="p-4 font-medium text-slate-300">{c.visaScore}</td>
                <td className="p-4 font-medium text-slate-300">{c.friction}</td>
                <td className="p-4 font-medium text-slate-300">{c.study}</td>
                <td className="p-4 font-medium text-slate-300">{c.business}</td>
                <td className="p-4 font-black text-blue-300">{c.composite}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
