import Link from 'next/link'
import { ComparePrismTable } from '@/components/compare/ComparePrismTable'
import type { CompareRow } from '@/lib/compare-rows'
import { CTA_COMPARE_TOURISM_HREF, CTA_EXPLORE_HREF } from '@/lib/cta-hrefs'
import type { EnrichedCountryApi } from '@/lib/enrich-country-api'
import { NEXUS_FOCUS_VISIBLE, NEXUS_FOCUS_VISIBLE_ON_INK_SOLID, NEXUS_TRANSITION } from '@/lib/nexus-chrome'
import { SITE_FOCUS_VISIBLE_ON_PRIMARY, SITE_FOCUS_VISIBLE_SOFT } from '@/lib/site-chrome-tokens'
import { cn } from '@/lib/utils'

export type CompareTableProps = {
  rows: CompareRow[]
  winnerId: number | null
  objectiveLabel: string
  /** Libellé court objectif (ex. Master) — maquette Prism. */
  objectiveShortLabel?: string
  scoringRationale: string
  /** e.g. 2+ countries and a winner */
  recommendation: string | null
  /** Empty-state CTA (defaults: generic explorer / tourism compare). */
  emptyExploreHref?: string
  emptyCompareHref?: string
  /** Maquette PAGE 03 (Prism) : tableau par sections + bandeau recommandation. */
  variant?: 'default' | 'prism'
  /** Requis pour `variant="prism"` : même ordre et mêmes `id` que `rows`. */
  enrichedCountries?: EnrichedCountryApi[]
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
                        className={cn(
                          'font-black text-primary underline decoration-primary/30 underline-offset-2',
                          NEXUS_TRANSITION,
                          NEXUS_FOCUS_VISIBLE,
                        )}
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

function prismDataOk(rows: CompareRow[], enriched: EnrichedCountryApi[] | undefined): enriched is EnrichedCountryApi[] {
  if (!enriched || enriched.length !== rows.length) return false
  return rows.every((r, i) => enriched[i]?.id === r.id)
}

export function CompareTable({
  rows,
  winnerId,
  objectiveLabel,
  objectiveShortLabel = '',
  scoringRationale,
  recommendation,
  emptyExploreHref = CTA_EXPLORE_HREF,
  emptyCompareHref = CTA_COMPARE_TOURISM_HREF,
  variant = 'default',
  enrichedCountries,
}: CompareTableProps) {
  const emptyShell =
    variant === 'prism'
      ? 'rounded-2xl border border-dashed border-[#0D1B3E]/25 bg-white/60 p-8 text-center text-[#0D1B3E]/75 sm:p-12'
      : 'rounded-2xl border border-dashed border-line bg-inset p-8 text-center text-muted sm:p-12'

  if (rows.length === 0) {
    return (
      <div className={emptyShell}>
        <p className="mb-6 font-medium">Sélectionnez au moins un pays pour afficher le tableau.</p>
        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={emptyExploreHref}
            className={cn(
              variant === 'prism'
                ? 'inline-flex justify-center rounded-xl bg-[#0D1B3E] px-6 py-3 text-sm font-black text-white shadow-md hover:bg-[#0D1B3E]/90'
                : 'inline-flex justify-center rounded-xl bg-primary px-6 py-3 text-sm font-black text-white shadow-soft hover:bg-primary-hover',
              NEXUS_TRANSITION,
              variant === 'prism' ? NEXUS_FOCUS_VISIBLE_ON_INK_SOLID : SITE_FOCUS_VISIBLE_ON_PRIMARY,
            )}
          >
            Choisir dans l&apos;explorateur
          </Link>
          <Link
            href={emptyCompareHref}
            className={cn(
              variant === 'prism'
                ? 'inline-flex justify-center rounded-xl border-2 border-[#0D1B3E] bg-white px-6 py-3 text-sm font-black text-[#0D1B3E] hover:bg-[#FDFBF4]'
                : 'inline-flex justify-center rounded-xl border border-line bg-surface px-6 py-3 text-sm font-black text-text hover:bg-primary-soft',
              NEXUS_TRANSITION,
              variant === 'prism' ? NEXUS_FOCUS_VISIBLE : SITE_FOCUS_VISIBLE_SOFT,
            )}
          >
            Exemple : ouvrir le comparateur
          </Link>
        </div>
      </div>
    )
  }

  if (variant === 'prism' && prismDataOk(rows, enrichedCountries)) {
    return (
      <ComparePrismTable
        rows={rows}
        enriched={enrichedCountries}
        winnerId={winnerId}
        objectiveShortLabel={objectiveShortLabel || objectiveLabel}
        objectiveLabel={objectiveLabel}
        scoringRationale={scoringRationale}
        recommendation={recommendation}
      />
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
                          className={cn(
                            'font-black text-primary underline decoration-primary/30 underline-offset-2 hover:text-primary-hover',
                            NEXUS_TRANSITION,
                            NEXUS_FOCUS_VISIBLE,
                          )}
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
