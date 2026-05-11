'use client'

import { Zap, Search, Globe, BookOpen, Coins, CreditCard, Timer, ArrowLeft, Layers } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import GoogleAd from '@/components/GoogleAd'
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider'
import {
  normalizeCountriesApiListResponse,
  type CountryApiListRow,
} from '@/lib/country-full-data-materialize'
import { educationHubExplorerHref } from '@/lib/cta-hrefs'

type CostLevel = 'all' | 'Bas' | 'Moyen' | 'Élevé'
type BacFilter = 'all' | 'oui' | 'non'
type DurationFilter = 'all' | '2 semaines' | '1 mois' | 'flexible'

function normalize(value: unknown): string {
  return String(value ?? '').trim()
}

function toLower(value: unknown) {
  return normalize(value).toLowerCase()
}

function costLevelFromCostText(value: unknown): Exclude<CostLevel, 'all'> | 'Moyen' {
  const v = toLower(value)
  if (v.includes('bas') || v.includes('low')) return 'Bas'
  if (v.includes('élev') || v.includes('high')) return 'Élevé'
  if (v.includes('moy')) return 'Moyen'
  return 'Moyen'
}

function durationBucket(value: unknown): Exclude<DurationFilter, 'all'> | 'flexible' {
  const v = toLower(value)
  if (!v) return 'flexible'
  if (v.includes('2')) return '2 semaines'
  if (v.includes('mois') || v.includes('1')) return '1 mois'
  return 'flexible'
}

type ShortCourseRow = {
  country: CountryApiListRow
  edu: Record<string, unknown>
  types: string[]
  bacRequired: string
  bacYesNo: 'oui' | 'non'
  durationText: string
  durationBucket: Exclude<DurationFilter, 'all'> | 'flexible'
  visa: string
  costText: string
  costLevel: Exclude<CostLevel, 'all'> | 'Moyen'
  access: string
  insight: string
}

export default function ShortCoursesPage() {
  const { preference } = useObjectivePreference()
  const explorerHubHref = useMemo(
    () => educationHubExplorerHref(preference.primarySlug),
    [preference.primarySlug],
  )
  const [countries, setCountries] = useState<CountryApiListRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [bac, setBac] = useState<BacFilter>('all')
  const [duration, setDuration] = useState<DurationFilter>('all')
  const [cost, setCost] = useState<CostLevel>('all')
  const [type, setType] = useState<string>('all')
  const [visa, setVisa] = useState<string>('all')

  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => setCountries(normalizeCountriesApiListResponse(data)))
      .catch(() => setCountries([]))
      .finally(() => setLoading(false))
  }, [])

  const rows = useMemo((): ShortCourseRow[] => {
    return countries
      .map((c) => {
        const mob = c.full_data['education_mobility']
        if (!mob || typeof mob !== 'object' || Array.isArray(mob)) return null
        const eduRaw = (mob as Record<string, unknown>)['short_courses']
        if (!eduRaw || typeof eduRaw !== 'object' || Array.isArray(eduRaw)) return null
        const edu = eduRaw as Record<string, unknown>
        const types: string[] = Array.isArray(edu.types) ? (edu.types as string[]) : []
        const bacRequired = normalize(edu.bac_required)
        return {
          country: c,
          edu,
          types,
          bacRequired,
          bacYesNo: toLower(bacRequired).includes('non') ? 'non' : 'oui',
          durationText: normalize(edu.duration),
          durationBucket: durationBucket(edu.duration),
          visa: normalize(edu.visa),
          costText: normalize(edu.cost),
          costLevel: costLevelFromCostText(edu.cost),
          access: normalize(edu.access) || 'Moyen',
          insight: normalize(edu.insight),
        }
      })
      .filter((r): r is ShortCourseRow => r !== null)
  }, [countries])

  const types = useMemo(() => {
    const set = new Set<string>()
    for (const r of rows) for (const t of r.types) if (t) set.add(t)
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [rows])

  const visaTypes = useMemo(() => {
    const set = new Set<string>()
    for (const r of rows) if (r.visa) set.add(r.visa)
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [rows])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchesSearch = toLower(r.country.name).includes(toLower(search))
      const matchesBac = bac === 'all' || r.bacYesNo === bac
      const matchesDuration = duration === 'all' || r.durationBucket === duration
      const matchesCost = cost === 'all' || r.costLevel === cost
      const matchesType = type === 'all' || r.types.includes(type)
      const matchesVisa = visa === 'all' || r.visa === visa
      return matchesSearch && matchesBac && matchesDuration && matchesCost && matchesType && matchesVisa
    })
  }, [rows, search, bac, duration, cost, type, visa])

  const accessBadge = (access: string) => {
    const a = toLower(access)
    const cls = a.includes('fac')
      ? 'border-emerald-500/35 bg-emerald-500/15 text-emerald-200'
      : a.includes('diff')
        ? 'border-red-500/35 bg-red-500/15 text-red-200'
        : 'border-violet-500/35 bg-violet-500/15 text-violet-200'
    return (
      <span className={`rounded-xl border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${cls}`}>
        {access || 'Moyen'}
      </span>
    )
  }

  const filterSelect =
    'w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-slate-100 outline-none'

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 pb-20 sm:px-8">
      <div className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-2">
        <Link
          href="/education"
          className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Hub Éducation
        </Link>
        <span className="hidden text-slate-600 sm:inline" aria-hidden>
          ·
        </span>
        <Link
          href={explorerHubHref}
          className="inline-flex items-center gap-2 text-sm font-black text-violet-400 transition-colors hover:text-white"
        >
          <Globe className="h-4 w-4" /> Explorer
        </Link>
      </div>

      <div className="mb-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-[2rem] bg-purple-600 p-4 text-white shadow-xl shadow-purple-900/40">
            <Zap className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              Formations courtes (2 semaines → 1 mois)
            </h1>
            <p className="mt-1 font-medium text-slate-400">
              Cuisine, digital, langues, bootcamps courts.
            </p>
          </div>
        </div>

        <div className="relative w-full lg:w-96">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Chercher un pays..."
            className="w-full rounded-2xl border border-white/15 bg-white/5 py-4 pl-12 pr-4 font-medium text-slate-100 outline-none placeholder:text-slate-500 transition-all focus:ring-2 focus:ring-violet-500/40"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-8 rounded-[2rem] border border-white/10 bg-[#111827] p-6 shadow-xl shadow-black/20">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Bac</p>
            <select className={filterSelect} value={bac} onChange={(e) => setBac(e.target.value as BacFilter)}>
              <option value="all">Tous</option>
              <option value="non">Non requis</option>
              <option value="oui">Requis</option>
            </select>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Durée</p>
            <select className={filterSelect} value={duration} onChange={(e) => setDuration(e.target.value as DurationFilter)}>
              <option value="all">Toutes</option>
              <option value="2 semaines">2 semaines</option>
              <option value="1 mois">1 mois</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Coût (niveau)
            </p>
            <select className={filterSelect} value={cost} onChange={(e) => setCost(e.target.value as CostLevel)}>
              <option value="all">Tous</option>
              <option value="Bas">Bas</option>
              <option value="Moyen">Moyen</option>
              <option value="Élevé">Élevé</option>
            </select>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Type</p>
            <select className={filterSelect} value={type} onChange={(e) => setType(e.target.value)}>
              {types.map((v) => (
                <option key={v} value={v}>
                  {v === 'all' ? 'Tous' : v}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Visa</p>
            <select className={filterSelect} value={visa} onChange={(e) => setVisa(e.target.value)}>
              {visaTypes.map((v) => (
                <option key={v} value={v}>
                  {v === 'all' ? 'Tous' : v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <GoogleAd slot="education_short_top" />

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-violet-500" />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <div
              key={String(r.country.id)}
              className="flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827] shadow-xl shadow-black/20 transition-all duration-300 hover:border-violet-500/35"
            >
              <div className="border-b border-white/10 p-8">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-white">{r.country.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                      <Globe className="h-3 w-3" /> {String(r.country.region ?? '')}
                    </div>
                  </div>
                  {accessBadge(r.access)}
                </div>
                <p className="text-sm font-medium leading-relaxed text-slate-400">
                  {r.insight || 'Données en cours de collecte.'}
                </p>
              </div>

              <div className="flex-1 space-y-4 p-8">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <Timer className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-400">Durée</span>
                  </div>
                  <span className="text-xs font-black text-slate-100">{r.durationText || '—'}</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-400">Bac</span>
                  </div>
                  <span className="text-xs font-black text-slate-100">{r.bacRequired || '—'}</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <Layers className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-400">Types</span>
                  </div>
                  <span className="text-right text-xs font-black text-slate-100">
                    {r.types?.length ? r.types.join(', ') : '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <Coins className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-400">Coût</span>
                  </div>
                  <span className="text-xs font-black text-slate-100">{r.costText || '—'}</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-400">Visa</span>
                  </div>
                  <span className="text-xs font-black text-slate-100">{r.visa || '—'}</span>
                </div>
              </div>

              <div className="mt-auto border-t border-white/10 bg-white/[0.02] p-8">
                <Link
                  href={`/countries/${r.country.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-4 text-sm font-black text-white transition-colors hover:bg-violet-500/15 hover:border-violet-500/40"
                >
                  Voir détails pays <Zap className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-16">
        <GoogleAd slot="education_short_bottom" />
      </div>
    </div>
  )
}

