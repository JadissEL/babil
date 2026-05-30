'use client'

import { ArrowDown, ArrowUp, CheckCircle2, Minus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {
  parseVisaScorePercent,
  pickPrimaryVisaKpi,
  prismCompositeDisplay,
  prismRentPlaceholderEuro,
  prismTrendForValue,
  type PrismTrend,
} from '@/lib/compare-prism-ui'
import type { CompareRow } from '@/lib/compare-rows'
import { COUNTRY_HIGHLIGHTS } from '@/lib/country-highlights'
import type { EnrichedCountryApi } from '@/lib/enrich-country-api'
import { atlasVisaDelayDays } from '@/lib/explorer-atlas-ui'
import { NEXUS_FOCUS_VISIBLE, NEXUS_FOCUS_VISIBLE_ON_INK_SOLID, NEXUS_TRANSITION } from '@/lib/nexus-chrome'
import { formatDelaiJours, formatScoreSur100 } from '@/lib/ui-display-fr'
import { cn } from '@/lib/utils'

export type ComparePrismTableProps = {
  rows: CompareRow[]
  enriched: EnrichedCountryApi[]
  winnerId: number | null
  objectiveShortLabel: string
  objectiveLabel: string
  scoringRationale: string
  recommendation: string | null
}

function trendIcon(t: PrismTrend) {
  if (t === 'up')
    return <ArrowUp className="size-3.5 shrink-0 text-amber-600" aria-label="Au-dessus de la médiane" />
  if (t === 'down')
    return <ArrowDown className="size-3.5 shrink-0 text-emerald-600" aria-label="En-dessous de la médiane" />
  return <Minus className="size-3.5 shrink-0 text-[#0D1B3E]/35" aria-label="Proche de la médiane" />
}

function thumbSrc(iso: string, name: string) {
  const key = iso.toLowerCase().trim()
  const curated = COUNTRY_HIGHLIGHTS[key]
  if (curated?.imageUrl) return curated.imageUrl
  const seed = encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))
  return `https://picsum.photos/seed/${seed}/240/240`
}

export function ComparePrismTable({
  rows,
  enriched,
  winnerId,
  objectiveShortLabel,
  objectiveLabel,
  scoringRationale,
  recommendation,
}: ComparePrismTableProps) {
  const gridCols = `minmax(11rem,13rem) repeat(${rows.length}, minmax(6.5rem, 1fr))`
  const gridStyle = { gridTemplateColumns: gridCols } as const

  const delays = enriched.map((c) => atlasVisaDelayDays(c._full, c.id))
  const rents = enriched.map((c) => prismRentPlaceholderEuro(c.id))

  const primaryVisa = rows.map((r) => pickPrimaryVisaKpi(r.kpis))
  const acceptancePercents = primaryVisa.map((cell) =>
    cell ? parseVisaScorePercent(cell.value) : null,
  )
  const acceptanceValues = acceptancePercents.filter((x): x is number => x != null)

  const winnerName = winnerId != null ? rows.find((r) => r.id === winnerId)?.name : null
  const criteriaCount = Math.max(4, (rows[0]?.kpis.length ?? 0) + 2)

  return (
    <div id="compare-table-anchor" className="min-w-0 space-y-4">
      <div className="rounded-2xl border border-[#0D1B3E]/10 bg-white p-4 shadow-lg sm:p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0D1B3E]/55">
          Objectif · {objectiveLabel}
        </p>
        <p className="mt-2 text-sm font-medium leading-relaxed text-[#0D1B3E]/80">{scoringRationale}</p>
        {recommendation ? (
          <p className="mt-3 border-t border-[#0D1B3E]/10 pt-3 text-sm font-semibold text-[#0D1B3E]">{recommendation}</p>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#0D1B3E]/10 bg-white shadow-xl">
        <div className="min-w-[min(100%,520px)] p-4 sm:min-w-[640px] sm:p-6">
          {/* Country headers */}
          <div className="grid gap-3 border-b border-[#0D1B3E]/10 pb-5" style={gridStyle}>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#0D1B3E]/45">Critères</div>
            {rows.map((r, i) => (
              <div key={r.id} className="flex flex-col items-center gap-2 text-center">
                <div className="relative size-[4.25rem] shrink-0 overflow-hidden rounded-full border-2 border-[#0D1B3E]/12 shadow-sm sm:size-20">
                  <Image
                    src={thumbSrc(r.code, r.name)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                    loading="lazy"
                  />
                </div>
                <span className="font-serif text-base font-bold leading-tight text-[#0D1B3E] sm:text-lg">
                  {r.name}
                </span>
                <span className="sr-only">Colonne {r.name}</span>
              </div>
            ))}
          </div>

          {/* Visa */}
          <div className="mt-4 border-t border-[#0D1B3E]/10 bg-[rgba(13,27,62,0.04)] px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/75">
            Visa et immigration
          </div>

          <div className="grid items-center border-b border-[#0D1B3E]/8 py-3 text-sm" style={gridStyle}>
            <div>
              <div className="text-xs font-bold text-[#0D1B3E]">Délai de traitement</div>
              <div className="mt-0.5 text-[10px] font-medium text-[#0D1B3E]/55">Moyenne estimée (jours)</div>
            </div>
            {enriched.map((c, i) => {
              const d = delays[i]!
              const t = prismTrendForValue(d, delays)
              return (
                <div
                  key={`d-${c.id}`}
                  className="flex items-center justify-center gap-1.5 tabular-nums text-[#0D1B3E]"
                >
                  <span className="font-semibold">{formatDelaiJours(d)}</span>
                  {trendIcon(t)}
                </div>
              )
            })}
          </div>

          <div className="grid items-center border-b border-[#0D1B3E]/8 py-3 text-sm" style={gridStyle}>
            <div>
              <div className="text-xs font-bold text-[#0D1B3E]">Taux d&apos;acceptation</div>
              <div className="mt-0.5 text-[10px] font-medium text-[#0D1B3E]/55">
                {primaryVisa[0]?.header ?? 'Visa'} (score modèle sur 100)
              </div>
            </div>
            {rows.map((r, i) => {
              const pct = acceptancePercents[i]
              const display = pct != null ? `${pct}%` : '—'
              const t =
                acceptanceValues.length >= 2 && pct != null
                  ? prismTrendForValue(pct, acceptanceValues)
                  : ('flat' as const)
              return (
                <div
                  key={`a-${r.id}`}
                  className="flex items-center justify-center gap-1.5 tabular-nums text-[#0D1B3E]"
                >
                  <span className="font-semibold">{display}</span>
                  {trendIcon(t)}
                </div>
              )
            })}
          </div>

          {/* Recommendation overlay */}
          {winnerId != null && winnerName && rows.length >= 2 ? (
            <div className="relative z-[1] -mx-2 my-4 flex flex-col gap-4 rounded-xl border border-[#0D1B3E]/10 bg-white/95 px-4 py-4 shadow-[0_8px_30px_rgba(13,27,62,0.12)] backdrop-blur-sm sm:-mx-1 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex min-w-0 items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-8 shrink-0 text-emerald-600" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-snug text-[#0D1B3E] sm:text-base">
                    Le <span className="font-black">{winnerName}</span> est optimal pour votre objectif{' '}
                    <span className="font-black">{objectiveShortLabel}</span>
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#0D1B3E]/65">
                    Basé sur {criteriaCount} critères d&apos;immigration et coût.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <Link
                  href="/services/delegated-applications"
                  className={cn(
                    'inline-flex items-center justify-center rounded-xl border-2 border-[#0D1B3E] bg-white px-4 py-2.5 text-center text-xs font-black uppercase tracking-wider text-[#0D1B3E] hover:bg-[#FDFBF4]',
                    NEXUS_TRANSITION,
                    NEXUS_FOCUS_VISIBLE,
                  )}
                >
                  Obtenir de l&apos;aide
                </Link>
                <Link
                  href={`/countries/${winnerId}`}
                  className={cn(
                    'inline-flex items-center justify-center rounded-xl bg-[#0D1B3E] px-4 py-2.5 text-center text-xs font-black uppercase tracking-wider text-white hover:bg-[#0D1B3E]/90',
                    NEXUS_TRANSITION,
                    NEXUS_FOCUS_VISIBLE_ON_INK_SOLID,
                  )}
                >
                  Voir {winnerName}
                </Link>
              </div>
            </div>
          ) : null}

          {/* Cost */}
          <div className="border-t border-[#0D1B3E]/10 bg-[rgba(13,27,62,0.04)] px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/75">
            Coût de la vie
          </div>

          <div className="grid items-center border-b border-[#0D1B3E]/8 py-3 text-sm" style={gridStyle}>
            <div>
              <div className="text-xs font-bold text-[#0D1B3E]">Loyer mensuel moyen</div>
              <div className="mt-0.5 text-[10px] font-medium text-[#0D1B3E]/55">Indicatif studio centre-ville (EUR)</div>
            </div>
            {enriched.map((c, i) => {
              const rent = rents[i]!
              const t = prismTrendForValue(rent, rents)
              return (
                <div
                  key={`r-${c.id}`}
                  className="flex items-center justify-center gap-1.5 tabular-nums text-[#0D1B3E]"
                >
                  <span className="font-semibold">
                    {rent} €{/* */}
                  </span>
                  {trendIcon(t)}
                </div>
              )
            })}
          </div>

          {/* Mobility score */}
          <div className="border-t border-[#0D1B3E]/10 bg-[rgba(13,27,62,0.04)] px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/75">
            Score mobilité
          </div>

          <div className="grid items-end gap-y-2 pt-3 pb-1" style={gridStyle}>
            <div className="pb-1">
              <div className="text-xs font-bold text-[#0D1B3E]">Score composite</div>
              <div className="mt-0.5 text-[10px] font-medium leading-snug text-[#0D1B3E]/55">
                Alignement avec profil {objectiveShortLabel}
              </div>
            </div>
            {rows.map((r) => {
              const isWinner = winnerId != null && r.id === winnerId
              const display = prismCompositeDisplay(r.composite)
              return (
                <div key={`s-${r.id}`} className="flex justify-center">
                  <div
                    className={cn(
                      'min-w-[4.5rem] rounded-lg border px-3 py-2 text-center text-2xl font-black tabular-nums text-[#0D1B3E]',
                      isWinner
                        ? 'border-sky-300/80 bg-sky-100/90 shadow-inner'
                        : 'border-[#0D1B3E]/10 bg-[#FDFBF4]/80',
                    )}
                  >
                    {display}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
