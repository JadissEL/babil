'use client'

import { 
  ShieldCheck, 
  Search, 
  Scale,
  X
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import CountryFlag from '@/components/country/CountryFlag'
import GoogleAd from '@/components/GoogleAd'
import { iso2ForCountryNameOrEmpty } from '@/lib/country-card-mappers'
import {
  normalizeCountriesApiListResponse,
  type CountryApiListRow,
} from '@/lib/country-full-data-materialize'
import { isSchengenMember } from '@/lib/schengen-members'

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

function scoreClass(score: number) {
  if (score >= 75) return 'bg-red-500/15 text-red-300 border-red-500/35'
  if (score >= 55) return 'bg-amber-500/15 text-amber-200 border-amber-500/35'
  if (score >= 35) return 'bg-blue-500/15 text-blue-200 border-blue-500/35'
  return 'bg-emerald-500/15 text-emerald-200 border-emerald-500/35'
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
        // Same rule as Explorer + API merge: canonical membership by name, not raw schengen_flag alone.
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

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 pb-16 sm:space-y-8 sm:px-6 sm:py-10 sm:pb-20 lg:px-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-5 sm:mb-10 sm:gap-6 md:flex-row md:items-center">
        <div className="min-w-0">
          <h1 className="mb-2 flex flex-wrap items-center gap-2 text-2xl font-black tracking-tight text-text sm:gap-3 sm:text-3xl md:text-4xl">
            <ShieldCheck className="h-8 w-8 shrink-0 text-primary sm:h-9 sm:w-9 md:h-10 md:w-10" /> Schengen · Intelligence
          </h1>
          <p className="text-sm font-medium text-muted sm:text-base">
            Analyse comparative des pays de l&apos;espace Schengen pour les citoyens marocains.
          </p>
        </div>

        <div className="relative w-full md:max-w-md md:flex-shrink-0 lg:w-96">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Chercher un pays Schengen..."
            className="w-full rounded-2xl border border-line bg-surface py-3.5 pl-11 pr-3 text-sm font-medium text-text outline-none placeholder:text-muted transition-all focus:ring-2 focus:ring-primary/40 sm:py-4 sm:pl-12 sm:pr-4 sm:text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface p-3 shadow-card sm:rounded-[2rem] sm:p-4">
        <span className="text-xs font-black uppercase tracking-widest text-muted">Comparer (2–4)</span>
        {compareCountries.map((c) => (
          <button
            key={String(c.id)}
            type="button"
            onClick={() => toggleCompare(String(c.id))}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-inset px-3 py-1.5 text-xs font-black text-text hover:bg-primary-soft"
          >
            <CountryFlag iso2={iso2ForCountryNameOrEmpty(c.name)} className="!h-3 !w-4 !shadow-none rounded-sm" />
            {c.name}
            <X className="h-3 w-3 opacity-70" />
          </button>
        ))}
        {compareCountries.length === 0 && (
          <span className="text-sm font-medium text-muted">Sélectionnez des pays dans le tableau pour comparer.</span>
        )}
      </div>

      {compareCountries.length >= 2 && (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface p-4 shadow-card sm:rounded-[2rem] sm:p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-black text-text sm:mb-4 sm:text-base">
            <Scale className="h-4 w-4 shrink-0 text-primary" /> Comparaison côte à côte
          </div>
          <table className="min-w-[520px] w-full text-sm">
            <thead>
              <tr className="text-muted">
                <th className="p-3 text-left font-black uppercase tracking-wider text-muted">Indicateur</th>
                {compareCountries.map((c) => (
                  <th key={String(c.id)} className="whitespace-nowrap p-3 text-left font-bold text-text">
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompareRow
                label="Acceptation (Maroc)"
                values={compareCountries.map((c) => cellStr(c.full_data.acceptance_rate_morocco))}
              />
              <CompareRow
                label="Score de friction"
                values={compareCountries.map((c) => `${toNum(c.full_data.friction_score, 50)}/100`)}
              />
              <CompareRow
                label="Niveau de risque"
                values={compareCountries.map((c) => cellStr(asFrictionAnalysis(c.full_data)?.risk_level))}
              />
              <CompareRow
                label="Délai rendez-vous"
                values={compareCountries.map((c) => cellStr(asFrictionAnalysis(c.full_data)?.real_delay))}
              />
            </tbody>
          </table>
        </div>
      )}

      <GoogleAd slot="schengen_top" />

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
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
                  className="rounded-2xl border border-line bg-surface p-4 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/countries/${c.id}`}
                      className="flex min-w-0 items-center gap-2 font-black text-text hover:text-primary"
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
                          ? 'border-primary bg-primary text-white'
                          : 'border-line bg-inset text-muted'
                      }`}
                    >
                      Comparer
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-sm font-black text-text">{acc}</span>
                    <div className="h-2 min-w-[4rem] flex-1 overflow-hidden rounded-full bg-[#eadfcf]">
                      <div
                        className={`h-full rounded-full ${
                          accNum > 70 ? 'bg-emerald-500' : accNum > 40 ? 'bg-blue-500' : 'bg-amber-500'
                        }`}
                        style={{ width: accWidth }}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-lg border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${scoreClass(frictionN)}`}
                    >
                      Friction {frictionN}/100
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-muted">Risque · {riskLvl}</span>
                  </div>
                  {embassy ? (
                    <p className="mt-3 line-clamp-4 text-xs italic leading-relaxed text-muted">&quot;{embassy}&quot;</p>
                  ) : null}
                </li>
              )
            })}
          </ul>

          <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface shadow-card md:block md:rounded-[2rem]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="bg-inset text-text">
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest lg:px-8 lg:py-6">Pays</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest lg:px-8 lg:py-6">Acceptation (Maroc)</th>
                    <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest lg:px-8 lg:py-6">
                      Friction RDV
                    </th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest lg:px-8 lg:py-6">Niveau de Risque</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest lg:px-8 lg:py-6">
                      Comportement Ambassade
                    </th>
                    <th className="px-3 py-4 text-right text-[10px] font-black uppercase tracking-widest lg:px-4 lg:py-6">
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
                    <tr key={String(c.id)} className="group border-b border-line transition-colors hover:bg-inset">
                      <td className="px-4 py-4 lg:px-8 lg:py-6">
                        <Link
                          href={`/countries/${c.id}`}
                          className="flex items-center gap-3 font-black text-text transition-colors group-hover:text-primary"
                        >
                          {(() => {
                            const iso = iso2ForCountryNameOrEmpty(c.name)
                            return iso ? (
                              <CountryFlag iso2={iso} className="rounded-sm !shadow-none" />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-inset text-muted transition-colors group-hover:bg-primary-soft group-hover:text-primary">
                                <CountryFlag iso2="" className="!h-4 !w-4 !shadow-none" />
                              </div>
                            )
                          })()}
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-4 py-4 lg:px-8 lg:py-6">
                        <div className="flex items-center gap-4">
                          <span className="w-12 font-black text-text">{cellStr(acceptRaw)}</span>
                          <div className="h-2 w-32 overflow-hidden rounded-full bg-[#eadfcf]">
                            <div
                              className={`h-full rounded-full ${
                                parseInt(String(acceptRaw ?? '0'), 10) > 70
                                  ? 'bg-emerald-500'
                                  : parseInt(String(acceptRaw ?? '0'), 10) > 40
                                    ? 'bg-blue-500'
                                    : 'bg-amber-500'
                              }`}
                              style={{ width: acceptStr.includes('%') ? acceptStr : `${parseInt(String(acceptRaw ?? '0'), 10) || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center lg:px-8 lg:py-6">
                        <span
                          className={`rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest sm:px-4 sm:py-2 ${scoreClass(toNum(full.friction_score, 50))}`}
                        >
                          {`${cellStr(full.friction_score, '—')}/100`}
                        </span>
                      </td>
                      <td className="px-4 py-4 lg:px-8 lg:py-6">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              risk === 'High' ? 'bg-red-400' : 'bg-amber-400'
                            }`}
                          />
                          <span
                            className={`text-xs font-black uppercase tracking-widest ${
                              risk === 'High' ? 'text-red-400' : 'text-amber-300'
                            }`}
                          >
                            {risk || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="max-w-xs px-4 py-4 text-sm font-medium italic leading-relaxed text-slate-400 lg:px-8 lg:py-6">
                        &quot;{cellStr(full.embassy_behavior, '')}&quot;
                      </td>
                      <td className="px-3 py-4 lg:px-4 lg:py-6">
                        <button
                          type="button"
                          onClick={() => toggleCompare(String(c.id))}
                          className={`rounded-lg border px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                            compareIds.includes(String(c.id))
                              ? 'border-primary bg-primary text-white'
                              : 'border-line bg-inset text-muted hover:border-primary/40'
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
  )
}

function CompareRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr className="border-t border-line">
      <td className="p-3 font-black text-muted">{label}</td>
      {values.map((value, idx) => (
        <td key={`${label}-${idx}`} className="whitespace-nowrap p-3 font-medium text-muted">
          {value}
        </td>
      ))}
    </tr>
  )
}

