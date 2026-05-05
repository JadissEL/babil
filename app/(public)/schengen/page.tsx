'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ShieldCheck, 
  Globe,
  Search, 
  Scale,
  X
} from 'lucide-react'
import GoogleAd from '@/components/GoogleAd'

const flagByCountry: Record<string, string> = {
  France: 'fr',
  Italie: 'it',
  Germany: 'de',
  Allemagne: 'de',
  Espagne: 'es',
  Spain: 'es',
  Portugal: 'pt',
  Belgium: 'be',
  Belgique: 'be',
  Netherlands: 'nl',
  Austria: 'at',
  Greece: 'gr',
  Sweden: 'se',
  Denmark: 'dk',
  Finland: 'fi',
  Poland: 'pl',
  Czechia: 'cz',
  Hungary: 'hu',
  Slovakia: 'sk',
  Slovenia: 'si',
  Croatia: 'hr',
  Malta: 'mt',
  Luxembourg: 'lu',
  Estonia: 'ee',
  Latvia: 'lv',
  Lithuania: 'lt',
  Romania: 'ro',
  Bulgaria: 'bg',
}

function toNum(value: any, fallback = 0) {
  const n = Number.parseInt(String(value || ''), 10)
  return Number.isFinite(n) ? n : fallback
}

function scoreClass(score: number) {
  if (score >= 75) return 'bg-red-500/15 text-red-300 border-red-500/35'
  if (score >= 55) return 'bg-amber-500/15 text-amber-200 border-amber-500/35'
  if (score >= 35) return 'bg-blue-500/15 text-blue-200 border-blue-500/35'
  return 'bg-emerald-500/15 text-emerald-200 border-emerald-500/35'
}

export default function SchengenPage() {
  const [countries, setCountries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [compareIds, setCompareIds] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/countries')
      .then(res => res.json())
      .then(data => {
        setCountries(data.filter((c: any) => c.schengen_flag))
        setLoading(false)
      })
  }, [])

  const filtered = countries.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  )
  const compareCountries = countries.filter((c) => compareIds.includes(String(c.id)))

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 4) return prev
      return [...prev, id]
    })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-10 pb-20 sm:px-8">
      <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="mb-2 flex items-center gap-3 text-3xl font-black tracking-tight text-white md:text-4xl">
            <ShieldCheck className="h-9 w-9 text-blue-400 md:h-10 md:w-10" /> Schengen Intelligence
          </h1>
          <p className="font-medium text-slate-400">
            Analyse comparative des pays de l&apos;espace Schengen pour les citoyens marocains.
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Chercher un pays Schengen..."
            className="w-full rounded-2xl border border-white/15 bg-white/5 py-4 pl-12 pr-4 font-medium text-slate-100 outline-none placeholder:text-slate-500 transition-all focus:ring-2 focus:ring-blue-500/40"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-[2rem] border border-white/10 bg-[#111827]/90 p-4 shadow-xl shadow-black/20">
        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Compare (2–4)</span>
        {compareCountries.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => toggleCompare(String(c.id))}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-black text-slate-200 hover:bg-white/10"
          >
            {flagByCountry[c.name] ? <span className={`fi fi-${flagByCountry[c.name]}`} /> : <Globe className="h-3 w-3" />}
            {c.name}
            <X className="h-3 w-3 opacity-70" />
          </button>
        ))}
        {compareCountries.length === 0 && (
          <span className="text-sm font-medium text-slate-500">Sélectionnez des pays dans le tableau pour comparer.</span>
        )}
      </div>

      {compareCountries.length >= 2 && (
        <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-[#111827]/90 p-6 shadow-xl shadow-black/20">
          <div className="mb-4 flex items-center gap-2 font-black text-white">
            <Scale className="h-4 w-4 text-blue-400" /> Side-by-side comparison
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="p-3 text-left font-black uppercase tracking-wider text-slate-400">Metric</th>
                {compareCountries.map((c) => (
                  <th key={c.id} className="whitespace-nowrap p-3 text-left font-bold text-slate-200">
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompareRow label="Acceptance (Morocco)" values={compareCountries.map((c) => c.full_data?.acceptance_rate_morocco || '—')} />
              <CompareRow label="Friction score" values={compareCountries.map((c) => `${toNum(c.full_data?.friction_score, 50)}/100`)} />
              <CompareRow label="Risk level" values={compareCountries.map((c) => c.full_data?.friction_analysis?.risk_level || '—')} />
              <CompareRow label="Appointment delay" values={compareCountries.map((c) => c.full_data?.friction_analysis?.real_delay || '—')} />
            </tbody>
          </table>
        </div>
      )}

      <GoogleAd slot="schengen_top" />

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827] shadow-xl shadow-black/25">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[#1e293b] text-white">
                    <th className="px-8 py-6 font-black text-[10px] uppercase tracking-widest">Pays</th>
                    <th className="px-8 py-6 font-black text-[10px] uppercase tracking-widest">Acceptation (Maroc)</th>
                    <th className="px-8 py-6 font-black text-[10px] uppercase tracking-widest text-center">Friction RDV</th>
                    <th className="px-8 py-6 font-black text-[10px] uppercase tracking-widest">Niveau de Risque</th>
                    <th className="px-8 py-6 font-black text-[10px] uppercase tracking-widest">Comportement Ambassade</th>
                    <th className="px-4 py-6 font-black text-[10px] uppercase tracking-widest text-right">Compare</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="group border-b border-white/5 transition-colors hover:bg-white/[0.04]">
                      <td className="px-8 py-6">
                        <Link
                          href={`/countries/${c.id}`}
                          className="flex items-center gap-3 font-black text-white transition-colors group-hover:text-blue-400"
                        >
                          {flagByCountry[c.name] ? (
                            <span className={`fi fi-${flagByCountry[c.name]} rounded-sm`} />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-slate-400 transition-colors group-hover:bg-blue-500/20 group-hover:text-blue-400">
                              <Globe className="h-4 w-4" />
                            </div>
                          )}
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <span className="w-12 font-black text-white">{c.full_data.acceptance_rate_morocco}</span>
                          <div className="h-2 w-32 overflow-hidden rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full ${
                                parseInt(c.full_data.acceptance_rate_morocco, 10) > 70
                                  ? 'bg-emerald-500'
                                  : parseInt(c.full_data.acceptance_rate_morocco, 10) > 40
                                    ? 'bg-blue-500'
                                    : 'bg-amber-500'
                              }`}
                              style={{ width: c.full_data.acceptance_rate_morocco }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span
                          className={`rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-widest ${scoreClass(toNum(c.full_data.friction_score, 50))}`}
                        >
                          {c.full_data.friction_score}/100
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              c.full_data.friction_analysis?.risk_level === 'High' ? 'bg-red-400' : 'bg-amber-400'
                            }`}
                          />
                          <span
                            className={`text-xs font-black uppercase tracking-widest ${
                              c.full_data.friction_analysis?.risk_level === 'High' ? 'text-red-400' : 'text-amber-300'
                            }`}
                          >
                            {c.full_data.friction_analysis?.risk_level}
                          </span>
                        </div>
                      </td>
                      <td className="max-w-xs px-8 py-6 text-sm font-medium italic leading-relaxed text-slate-400">
                        &quot;{c.full_data.embassy_behavior}&quot;
                      </td>
                      <td className="px-4 py-6">
                        <button
                          type="button"
                          onClick={() => toggleCompare(String(c.id))}
                          className={`rounded-lg border px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                            compareIds.includes(String(c.id))
                              ? 'border-blue-500 bg-blue-600 text-white'
                              : 'border-white/15 bg-white/5 text-slate-300 hover:border-blue-500/40'
                          }`}
                        >
                          Compare
                        </button>
                      </td>
                    </tr>
                  ))}
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
    <tr className="border-t border-white/10">
      <td className="p-3 font-black text-slate-300">{label}</td>
      {values.map((value, idx) => (
        <td key={`${label}-${idx}`} className="whitespace-nowrap p-3 font-medium text-slate-400">
          {value}
        </td>
      ))}
    </tr>
  )
}

