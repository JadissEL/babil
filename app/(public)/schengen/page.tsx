'use client'

import { ArrowDown, ArrowUp, Minus, Search, ShieldCheck, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import CountryFlag from '@/components/country/CountryFlag'
import GoogleAd from '@/components/GoogleAd'
import { prismTrendForValue, type PrismTrend } from '@/lib/compare-prism-ui'
import { iso2ForCountryNameOrEmpty } from '@/lib/country-card-mappers'
import {
  normalizeCountriesApiListResponse,
  type CountryApiListRow,
} from '@/lib/country-full-data-materialize'
import { isSchengenMember } from '@/lib/schengen-members'

const CREAM = '#FDFBF4'

function toNum(value: unknown, fallback = 0) {
  const n = Number.parseInt(String(value ?? ''), 10)
  return Number.isFinite(n) ? n : fallback
}

function asFrictionAnalysis(full: Record<string, unknown>): Record<string, unknown> | undefined {
  const fa = full.friction_analysis
  if (!fa || typeof fa !== 'object' || Array.isArray(fa)) return undefined
  return fa as Record<string, unknown>
}

function cellStr(v: unknown, fallback = '—'): string {
  if (v === undefined || v === null || v === '') return fallback
  return String(v)
}

function parseAcceptanceMoroccoPercent(raw: unknown): number | null {
  const s = cellStr(raw, '')
  const m = s.match(/(\d+(?:[.,]\d+)?)/)
  if (!m) return null
  const n = parseFloat(m[1]!.replace(',', '.'))
  if (!Number.isFinite(n)) return null
  return Math.min(100, Math.max(0, n))
}

function scoreClassLight(score: number) {
  if (score >= 75) return 'bg-red-500/10 text-red-800 border-red-500/25'
  if (score >= 55) return 'bg-amber-500/10 text-amber-900 border-amber-500/25'
  if (score >= 35) return 'bg-sky-500/10 text-sky-900 border-sky-500/25'
  return 'bg-emerald-500/10 text-emerald-900 border-emerald-500/25'
}

function frictionTierLabelFr(score: number): { label: string; dot: string } {
  if (score >= 75) return { label: 'Élevé', dot: 'bg-red-500' }
  if (score >= 55) return { label: 'Moyen', dot: 'bg-amber-500' }
  return { label: 'Bas', dot: 'bg-emerald-500' }
}

function riskLevelFr(raw: string): string {
  const t = raw.trim().toLowerCase()
  if (t === 'high') return 'Élevé'
  if (t === 'medium') return 'Moyen'
  if (t === 'low') return 'Bas'
  return raw || '—'
}

function riskDotClass(raw: string): string {
  const t = raw.trim().toLowerCase()
  if (t === 'high') return 'bg-red-500'
  if (t === 'medium') return 'bg-amber-500'
  return 'bg-emerald-500'
}

function trendIcon(t: PrismTrend) {
  if (t === 'up')
    return <ArrowUp className="size-3.5 shrink-0 text-amber-600" aria-label="Au-dessus de la médiane" />
  if (t === 'down')
    return <ArrowDown className="size-3.5 shrink-0 text-emerald-600" aria-label="En-dessous de la médiane" />
  return <Minus className="size-3.5 shrink-0 text-[#0D1B3E]/30" aria-label="Proche de la médiane" />
}

function EuropeGhostSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 420 260" fill="none" aria-hidden>
      <path
        opacity="0.14"
        fill="currentColor"
        d="M48 118c12-28 38-52 72-58 18-36 58-62 102-62 48 0 90 28 108 70 22 4 42 18 54 38 16 28 14 62-6 88-18 24-48 38-78 36-26 22-58 34-92 34-44 0-84-20-110-52-20-8-38-20-50-36-14-20-18-44-10-68z"
      />
      <path
        opacity="0.1"
        fill="currentColor"
        d="M260 40c32 8 58 32 70 62 8 20 6 42-6 60-14 22-40 36-68 38-4 18-18 32-36 38-24 8-50 2-68-14-18-16-24-42-14-64 12-26 40-44 70-48 18-32 52-52 88-52h4z"
      />
      <ellipse cx="118" cy="168" rx="36" ry="22" opacity="0.09" fill="currentColor" />
    </svg>
  )
}

export default function SchengenPage() {
  const [countries, setCountries] = useState<CountryApiListRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [compareIds, setCompareIds] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => {
        const list = normalizeCountriesApiListResponse(data)
        setCountries(list.filter((c) => isSchengenMember(String(c.name ?? ''))))
      })
      .catch(() => setCountries([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = countries.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
  const compareCountries = countries.filter((c) => compareIds.includes(String(c.id)))

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 4) return prev
      return [...prev, id]
    })
  }

  const acceptanceSeries = compareCountries
    .map((c) => parseAcceptanceMoroccoPercent(c.full_data.acceptance_rate_morocco))
    .filter((x): x is number => x != null)

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM }}>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 pb-12 sm:space-y-8 sm:px-6 sm:py-10 sm:pb-16 lg:px-8">
        {/* Hero — maquette PAGE 04 */}
        <div className="relative overflow-hidden rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-lg sm:rounded-3xl sm:p-8">
          <div className="pointer-events-none absolute -right-4 top-1/2 w-[min(52%,420px)] -translate-y-1/2 text-[#0D1B3E] sm:right-0">
            <EuropeGhostSvg className="h-auto w-full" />
          </div>
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/70">
                <ShieldCheck className="size-4 shrink-0 text-[#0D1B3E]" aria-hidden />
                VisaFlow Intelligence
              </p>
              <h1 className="mt-3 font-serif text-3xl font-bold leading-tight tracking-tight text-[#0D1B3E] sm:text-4xl md:text-[2.35rem]">
                Schengen • Intelligence
              </h1>
              <p className="mt-4 text-sm font-medium leading-relaxed text-[#0D1B3E]/80 sm:text-[15px]">
                Terminal d&apos;analyse en temps réel des flux migratoires et des taux d&apos;acceptation consulaire pour
                l&apos;espace Schengen. Données calibrées pour l&apos;optimisation des dossiers — indicateurs indicatifs,
                non juridiques.
              </p>
            </div>
            <div className="relative w-full shrink-0 lg:max-w-sm">
              <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0D1B3E]/40" />
              <input
                type="search"
                placeholder="Filtrer les juridictions…"
                className="w-full border-0 border-b-2 border-[#0D1B3E]/20 bg-transparent py-3 pl-8 pr-1 text-sm font-medium text-[#0D1B3E] outline-none transition-colors placeholder:text-[#0D1B3E]/40 focus:border-[#0D1B3E]/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Filtrer les juridictions"
              />
            </div>
          </div>
        </div>

        {/* Comparaison active */}
        <div className="flex flex-col gap-3 rounded-2xl border border-[#0D1B3E]/10 bg-white px-4 py-3 shadow-md sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:rounded-3xl sm:px-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]">
            Comparaison active ({compareCountries.length}/4)
          </span>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {compareCountries.map((c) => (
              <button
                key={String(c.id)}
                type="button"
                onClick={() => toggleCompare(String(c.id))}
                className="inline-flex items-center gap-2 rounded-full border border-[#0D1B3E]/15 bg-[#FDFBF4] px-3 py-1.5 text-xs font-bold text-[#0D1B3E] transition-colors hover:border-[#0D1B3E]/30"
              >
                <CountryFlag iso2={iso2ForCountryNameOrEmpty(c.name)} className="!h-3 !w-4 !shadow-none rounded-sm" />
                {c.name}
                <X className="h-3.5 w-3.5 opacity-60" aria-hidden />
              </button>
            ))}
            {compareCountries.length === 0 ? (
              <span className="text-sm font-medium text-[#0D1B3E]/55">Ajoutez des pays depuis le tableau ci-dessous.</span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setCompareIds([])}
            disabled={compareCountries.length === 0}
            className="shrink-0 text-[10px] font-black uppercase tracking-[0.18em] text-[#0D1B3E] underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
          >
            Réinitialiser
          </button>
        </div>

        {compareCountries.length >= 2 && (
          <div className="overflow-x-auto rounded-2xl border border-[#0D1B3E]/10 bg-white shadow-lg sm:rounded-3xl">
            <table className="min-w-[540px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#0D1B3E]/10 bg-[rgba(13,27,62,0.045)]">
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#0D1B3E]/60 sm:px-6">
                    Métrique
                  </th>
                  {compareCountries.map((c) => (
                    <th
                      key={String(c.id)}
                      className="whitespace-nowrap px-4 py-3 text-left font-serif text-base font-bold text-[#0D1B3E] sm:px-6 sm:text-lg"
                    >
                      {c.name}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-[#0D1B3E]/60 sm:px-6">
                    <Link href="/compare?objective=tourism" className="inline-flex items-center gap-1 text-[#0D1B3E] hover:underline">
                      + Ajouter
                    </Link>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0D1B3E]/8">
                <tr>
                  <td className="px-4 py-3.5 text-xs font-bold text-[#0D1B3E]/80 sm:px-6">Acceptation (Maroc)</td>
                  {compareCountries.map((c) => {
                    const pct = parseAcceptanceMoroccoPercent(c.full_data.acceptance_rate_morocco)
                    const t =
                      acceptanceSeries.length >= 2 && pct != null
                        ? prismTrendForValue(pct, acceptanceSeries)
                        : ('flat' as const)
                    return (
                      <td key={`a-${c.id}`} className="px-4 py-3.5 sm:px-6">
                        <div className="flex items-center justify-start gap-1.5 font-serif text-base font-semibold tabular-nums text-[#0D1B3E]">
                          <span>{cellStr(c.full_data.acceptance_rate_morocco)}</span>
                          {trendIcon(t)}
                        </div>
                      </td>
                    )
                  })}
                  <td className="px-4 py-3.5 sm:px-6" />
                </tr>
                <tr>
                  <td className="px-4 py-3.5 text-xs font-bold text-[#0D1B3E]/80 sm:px-6">Friction score</td>
                  {compareCountries.map((c) => {
                    const n = toNum(c.full_data.friction_score, 50)
                    const fa = asFrictionAnalysis(c.full_data)
                    const risk = fa?.risk_level != null ? String(fa.risk_level) : ''
                    const hasFriction = c.full_data.friction_score != null && String(c.full_data.friction_score) !== ''
                    if (!hasFriction && !risk) {
                      return (
                        <td key={`f-${c.id}`} className="px-4 py-3.5 font-serif text-[#0D1B3E]/45 sm:px-6">
                          —
                        </td>
                      )
                    }
                    const fr = frictionTierLabelFr(n)
                    return (
                      <td key={`f-${c.id}`} className="px-4 py-3.5 sm:px-6">
                        <div className="flex flex-wrap items-center gap-2.5">
                          {hasFriction ? (
                            <span className="inline-flex items-center gap-1.5 font-serif text-sm font-semibold text-[#0D1B3E]">
                              <span className={`size-2 shrink-0 rounded-full ${fr.dot}`} aria-hidden />
                              {fr.label}
                            </span>
                          ) : null}
                          {risk ? (
                            <span className="inline-flex items-center gap-1.5 font-serif text-sm font-semibold text-[#0D1B3E]">
                              <span className={`size-2 shrink-0 rounded-full ${riskDotClass(risk)}`} aria-hidden />
                              {riskLevelFr(risk)}
                            </span>
                          ) : null}
                        </div>
                      </td>
                    )
                  })}
                  <td className="px-4 py-3.5 sm:px-6" />
                </tr>
                <tr>
                  <td className="px-4 py-3.5 text-xs font-bold text-[#0D1B3E]/80 sm:px-6">Délai R-V. (est.)</td>
                  {compareCountries.map((c) => {
                    const delay = cellStr(asFrictionAnalysis(c.full_data)?.real_delay)
                    return (
                      <td
                        key={`d-${c.id}`}
                        className="whitespace-pre-wrap px-4 py-3.5 font-serif text-sm font-semibold leading-snug text-[#0D1B3E] sm:px-6"
                      >
                        {delay}
                      </td>
                    )
                  })}
                  <td className="px-4 py-3.5 sm:px-6" />
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <GoogleAd slot="schengen_top" />

        {loading ? (
          <div className="flex justify-center p-20">
            <div
              className="h-12 w-12 animate-spin rounded-full border-2 border-[#0D1B3E]/20 border-t-[#0D1B3E]"
              aria-label="Chargement"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            <ul className="grid gap-3 md:hidden">
              {filtered.map((c) => {
                const full = c.full_data
                const acc = typeof full.acceptance_rate_morocco === 'string' ? full.acceptance_rate_morocco : '—'
                const accNum =
                  typeof acc === 'string' ? Number.parseInt(acc.replace(/[^\d]/g, ''), 10) || 0 : Number(acc) || 0
                const accWidth: string =
                  typeof acc === 'string' && acc.includes('%') ? acc : `${Math.min(100, accNum)}%`
                const frictionN = toNum(full.friction_score, 50)
                const embassy = typeof full.embassy_behavior === 'string' ? full.embassy_behavior : ''
                const fa = asFrictionAnalysis(full)
                const riskLvl = fa?.risk_level != null ? String(fa.risk_level) : '—'
                return (
                  <li
                    key={String(c.id)}
                    className="rounded-2xl border border-[#0D1B3E]/10 bg-white p-4 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/countries/${c.id}`}
                        className="flex min-w-0 items-center gap-2 font-black text-[#0D1B3E] hover:underline"
                      >
                        <CountryFlag
                          iso2={iso2ForCountryNameOrEmpty(c.name)}
                          className="shrink-0 rounded-sm !shadow-none text-base leading-none"
                        />
                        <span className="truncate">{c.name}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleCompare(String(c.id))}
                        className={`shrink-0 rounded-lg border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
                          compareIds.includes(String(c.id))
                            ? 'border-[#0D1B3E] bg-[#0D1B3E] text-white'
                            : 'border-[#0D1B3E]/20 bg-[#FDFBF4] text-[#0D1B3E]/80'
                        }`}
                      >
                        Comparer
                      </button>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="font-serif text-sm font-semibold text-[#0D1B3E]">{acc}</span>
                      <div className="h-2 min-w-[4rem] flex-1 overflow-hidden rounded-full bg-[#0D1B3E]/10">
                        <div
                          className={`h-full rounded-full ${
                            accNum > 70 ? 'bg-emerald-500' : accNum > 40 ? 'bg-sky-500' : 'bg-amber-500'
                          }`}
                          style={{ width: accWidth }}
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-lg border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${scoreClassLight(frictionN)}`}
                      >
                        Friction {frictionN}/100
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-[#0D1B3E]/55">
                        Risque · {riskLvl}
                      </span>
                    </div>
                    {embassy ? (
                      <p className="mt-3 line-clamp-4 text-xs italic leading-relaxed text-[#0D1B3E]/60">
                        &quot;{embassy}&quot;
                      </p>
                    ) : null}
                  </li>
                )
              })}
            </ul>

            <div className="hidden overflow-hidden rounded-2xl border border-[#0D1B3E]/10 bg-white shadow-lg md:block md:rounded-3xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#0D1B3E]/10 bg-[rgba(13,27,62,0.045)] text-[#0D1B3E]">
                      <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-[#0D1B3E]/60 lg:px-8 lg:py-5">
                        Pays
                      </th>
                      <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-[#0D1B3E]/60 lg:px-8 lg:py-5">
                        Acceptation (Maroc)
                      </th>
                      <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-[#0D1B3E]/60 lg:px-8 lg:py-5">
                        Friction RDV
                      </th>
                      <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-[#0D1B3E]/60 lg:px-8 lg:py-5">
                        Niveau de risque
                      </th>
                      <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-[#0D1B3E]/60 lg:px-8 lg:py-5">
                        Comportement ambassade
                      </th>
                      <th className="px-3 py-4 text-right text-[10px] font-black uppercase tracking-widest text-[#0D1B3E]/60 lg:px-4 lg:py-5">
                        Comparer
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => {
                      const full = c.full_data
                      const fa = asFrictionAnalysis(full)
                      const risk = fa?.risk_level != null ? String(fa.risk_level) : ''
                      const acceptRaw = full.acceptance_rate_morocco
                      const acceptStr = cellStr(acceptRaw, '0')
                      return (
                        <tr key={String(c.id)} className="group border-b border-[#0D1B3E]/8 transition-colors hover:bg-[rgba(13,27,62,0.03)]">
                          <td className="px-4 py-4 lg:px-8 lg:py-5">
                            <Link
                              href={`/countries/${c.id}`}
                              className="flex items-center gap-3 font-bold text-[#0D1B3E] transition-colors group-hover:underline"
                            >
                              <CountryFlag
                                iso2={iso2ForCountryNameOrEmpty(c.name)}
                                className="rounded-sm !shadow-none"
                              />
                              {c.name}
                            </Link>
                          </td>
                          <td className="px-4 py-4 lg:px-8 lg:py-5">
                            <div className="flex items-center gap-4">
                              <span className="w-14 font-serif text-base font-semibold tabular-nums text-[#0D1B3E]">
                                {cellStr(acceptRaw)}
                              </span>
                              <div className="h-2 w-32 overflow-hidden rounded-full bg-[#0D1B3E]/10">
                                <div
                                  className={`h-full rounded-full ${
                                    parseInt(String(acceptRaw ?? '0'), 10) > 70
                                      ? 'bg-emerald-500'
                                      : parseInt(String(acceptRaw ?? '0'), 10) > 40
                                        ? 'bg-sky-500'
                                        : 'bg-amber-500'
                                  }`}
                                  style={{
                                    width: acceptStr.includes('%') ? acceptStr : `${parseInt(String(acceptRaw ?? '0'), 10) || 0}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center lg:px-8 lg:py-5">
                            <span
                              className={`inline-block rounded-xl border px-3 py-1.5 font-serif text-sm font-semibold tabular-nums sm:px-4 sm:py-2 ${scoreClassLight(toNum(full.friction_score, 50))}`}
                            >
                              {`${cellStr(full.friction_score, '—')}/100`}
                            </span>
                          </td>
                          <td className="px-4 py-4 lg:px-8 lg:py-5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                                  risk === 'High' ? 'bg-red-500' : risk === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                              />
                              <span className="text-xs font-bold uppercase tracking-wider text-[#0D1B3E]">
                                {risk || '—'}
                              </span>
                            </div>
                          </td>
                          <td className="max-w-xs px-4 py-4 text-sm font-medium italic leading-relaxed text-[#0D1B3E]/65 lg:px-8 lg:py-5">
                            &quot;{cellStr(full.embassy_behavior, '')}&quot;
                          </td>
                          <td className="px-3 py-4 lg:px-4 lg:py-5">
                            <button
                              type="button"
                              onClick={() => toggleCompare(String(c.id))}
                              className={`rounded-lg border px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                                compareIds.includes(String(c.id))
                                  ? 'border-[#0D1B3E] bg-[#0D1B3E] text-white'
                                  : 'border-[#0D1B3E]/20 bg-[#FDFBF4] text-[#0D1B3E]/80 hover:border-[#0D1B3E]/35'
                              }`}
                            >
                              Comparer
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <GoogleAd slot="schengen_bottom" />
          </div>
        )}
      </div>
    </div>
  )
}
