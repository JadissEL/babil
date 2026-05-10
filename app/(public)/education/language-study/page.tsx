'use client'

import { GraduationCap, Languages, Search, Globe, BookOpen, Coins, CreditCard, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import GoogleAd from '@/components/GoogleAd'
import { normalizeCountriesApiListResponse } from '@/lib/country-full-data-materialize'

type CostLevel = 'all' | 'Bas' | 'Moyen' | 'Élevé'
type BacFilter = 'all' | 'requis' | 'non requis' | "dépend de l'école"

function normalize(value: unknown): string {
  return String(value ?? '').trim()
}

function toLower(value: unknown) {
  return normalize(value).toLowerCase()
}

function costLevelFromEstimatedCost(value: unknown): Exclude<CostLevel, 'all'> | 'Moyen' {
  const v = toLower(value)
  if (v.includes('bas') || v.includes('low')) return 'Bas'
  if (v.includes('élev') || v.includes('high')) return 'Élevé'
  return 'Moyen'
}

export default function LanguageStudyPage() {
  const [countries, setCountries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [bac, setBac] = useState<BacFilter>('all')
  const [cost, setCost] = useState<CostLevel>('all')
  const [programType, setProgramType] = useState<string>('all')
  const [visaType, setVisaType] = useState<string>('all')

  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => setCountries(normalizeCountriesApiListResponse(data)))
      .catch(() => setCountries([]))
      .finally(() => setLoading(false))
  }, [])

  const rows = useMemo(() => {
    return countries
      .map((c) => {
        const edu = c.full_data?.education_mobility?.language_study
        if (!edu) return null
        return {
          country: c,
          edu,
          bacRequired: normalize(edu.bac_required),
          estCostLevel: costLevelFromEstimatedCost(edu.estimated_cost),
          programType: normalize(edu.program_type),
          visaType: normalize(edu.visa_type || edu.visa),
          access: normalize(edu.access) || 'Moyen',
        }
      })
      .filter(Boolean) as Array<{
      country: any
      edu: any
      bacRequired: string
      estCostLevel: Exclude<CostLevel, 'all'> | 'Moyen'
      programType: string
      visaType: string
      access: string
    }>
  }, [countries])

  const programTypes = useMemo(() => {
    const set = new Set<string>()
    for (const r of rows) {
      const v = r.programType
      if (v) set.add(v)
    }
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [rows])

  const visaTypes = useMemo(() => {
    const set = new Set<string>()
    for (const r of rows) {
      const v = r.visaType
      if (v) set.add(v)
    }
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [rows])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchesSearch = toLower(r.country.name).includes(toLower(search))
      const bacLower = toLower(r.bacRequired)
      const matchesBac =
        bac === 'all' ||
        (bac === 'requis' && bacLower.includes('requis')) ||
        (bac === 'non requis' && bacLower.includes('non')) ||
        (bac === "dépend de l'école" && (bacLower.includes('dépend') || bacLower.includes('depend')))
      const matchesCost = cost === 'all' || r.estCostLevel === cost
      const matchesProgram = programType === 'all' || r.programType === programType
      const matchesVisa = visaType === 'all' || r.visaType === visaType
      return matchesSearch && matchesBac && matchesCost && matchesProgram && matchesVisa
    })
  }, [rows, search, bac, cost, programType, visaType])

  const accessBadge = (access: string) => {
    const a = toLower(access)
    const cls = a.includes('fac')
      ? 'border-emerald-500/35 bg-emerald-500/15 text-emerald-200'
      : a.includes('diff')
        ? 'border-red-500/35 bg-red-500/15 text-red-200'
        : 'border-blue-500/35 bg-blue-500/15 text-blue-200'
    return (
      <span className={`rounded-xl border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${cls}`}>
        {access || 'Moyen'}
      </span>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 pb-20 sm:px-8">
      <div className="mb-8">
        <Link
          href="/education"
          className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Hub Éducation
        </Link>
      </div>

      <div className="mb-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-[2rem] bg-blue-600 p-4 text-white shadow-xl shadow-blue-900/40">
            <Languages className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">Langues à l’étranger</h1>
            <p className="mt-1 font-medium text-slate-400">Parcours et contraintes par pays.</p>
          </div>
        </div>

        <div className="relative w-full lg:w-96">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Chercher un pays..."
            className="w-full rounded-2xl border border-white/15 bg-white/5 py-4 pl-12 pr-4 font-medium text-slate-100 outline-none placeholder:text-slate-500 transition-all focus:ring-2 focus:ring-blue-500/40"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-8 rounded-[2rem] border border-white/10 bg-[#111827] p-6 shadow-xl shadow-black/20">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Bac</p>
            <select
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-slate-100 outline-none"
              value={bac}
              onChange={(e) => setBac(e.target.value as BacFilter)}
            >
              <option value="all">Tous</option>
              <option value="non requis">Non requis</option>
              <option value="requis">Requis</option>
              <option value="dépend de l'école">Dépend de l’école</option>
            </select>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Coût (niveau)
            </p>
            <select
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-slate-100 outline-none"
              value={cost}
              onChange={(e) => setCost(e.target.value as CostLevel)}
            >
              <option value="all">Tous</option>
              <option value="Bas">Bas</option>
              <option value="Moyen">Moyen</option>
              <option value="Élevé">Élevé</option>
            </select>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Programme</p>
            <select
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-slate-100 outline-none"
              value={programType}
              onChange={(e) => setProgramType(e.target.value)}
            >
              {programTypes.map((v) => (
                <option key={v} value={v}>
                  {v === 'all' ? 'Tous' : v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Visa</p>
            <select
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-slate-100 outline-none"
              value={visaType}
              onChange={(e) => setVisaType(e.target.value)}
            >
              {visaTypes.map((v) => (
                <option key={v} value={v}>
                  {v === 'all' ? 'Tous' : v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <GoogleAd slot="education_language_top" />

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <div
              key={r.country.id}
              className="flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827] shadow-xl shadow-black/20 transition-all duration-300 hover:border-blue-500/35"
            >
              <div className="border-b border-white/10 p-8">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-white">{r.country.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                      <Globe className="h-3 w-3" /> {r.country.region}
                    </div>
                  </div>
                  {accessBadge(r.access)}
                </div>
                <p className="text-sm font-medium leading-relaxed text-slate-400">
                  {normalize(r.edu.insight) || 'Données en cours de collecte.'}
                </p>
              </div>

              <div className="flex-1 space-y-4 p-8">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-400">Bac</span>
                  </div>
                  <span className="text-xs font-black text-slate-100">{r.bacRequired || '—'}</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <Coins className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-400">Coût</span>
                  </div>
                  <span className="text-xs font-black text-slate-100">
                    {normalize(r.edu.cost) || normalize(r.edu.estimated_cost) || '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-400">Visa</span>
                  </div>
                  <span className="text-xs font-black text-slate-100">{r.visaType || '—'}</span>
                </div>
              </div>

              <div className="mt-auto border-t border-white/10 bg-white/[0.02] p-8">
                <Link
                  href={`/countries/${r.country.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-4 text-sm font-black text-white transition-colors hover:bg-blue-500/20 hover:border-blue-500/40"
                >
                  Voir détails pays <GraduationCap className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-16">
        <GoogleAd slot="education_language_bottom" />
      </div>
    </div>
  )
}

