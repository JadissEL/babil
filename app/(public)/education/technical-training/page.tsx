'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Wrench, Search, Globe, BookOpen, Coins, CreditCard, Briefcase, ArrowLeft, BadgeCheck, BadgeX } from 'lucide-react'
import GoogleAd from '@/components/GoogleAd'
import { normalizeCountriesApiListResponse } from '@/lib/country-full-data-materialize'

type YesNoAll = 'all' | 'oui' | 'non'
type WorkRights = 'all' | 'autorisé' | 'limité' | 'interdit'
type CostLevel = 'all' | 'Bas' | 'Moyen' | 'Élevé'

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

function workRightsBucket(value: unknown): Exclude<WorkRights, 'all'> | 'limité' {
  const v = toLower(value)
  if (!v) return 'limité'
  if (v.includes('interdit') || v.includes('forbid')) return 'interdit'
  if (v.includes('autor') || v.includes('allow')) return 'autorisé'
  return 'limité'
}

export default function TechnicalTrainingPage() {
  const [countries, setCountries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [bacAccess, setBacAccess] = useState<YesNoAll>('all')
  const [noBacAccess, setNoBacAccess] = useState<YesNoAll>('all')
  const [domain, setDomain] = useState<string>('all')
  const [work, setWork] = useState<WorkRights>('all')
  const [cost, setCost] = useState<CostLevel>('all')

  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => {
        setCountries(normalizeCountriesApiListResponse(data))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const rows = useMemo(() => {
    return countries
      .map((c) => {
        const edu = c.full_data?.education_mobility?.technical_training
        if (!edu) return null
        const types: string[] = Array.isArray(edu.types) ? edu.types : []
        const accessBac = Boolean(edu.access_bac)
        const accessNoBac = Boolean(edu.access_no_bac)
        return {
          country: c,
          edu,
          types,
          accessBac,
          accessNoBac,
          workRights: normalize(edu.work_rights),
          workBucket: workRightsBucket(edu.work_rights),
          visa: normalize(edu.visa),
          costText: normalize(edu.cost),
          costLevel: costLevelFromCostText(edu.cost),
          access: normalize(edu.access) || 'Moyen',
          insight: normalize(edu.market_insight || edu.insight),
        }
      })
      .filter(Boolean) as Array<{
      country: any
      edu: any
      types: string[]
      accessBac: boolean
      accessNoBac: boolean
      workRights: string
      workBucket: Exclude<WorkRights, 'all'> | 'limité'
      visa: string
      costText: string
      costLevel: Exclude<CostLevel, 'all'> | 'Moyen'
      access: string
      insight: string
    }>
  }, [countries])

  const domains = useMemo(() => {
    const set = new Set<string>()
    for (const r of rows) for (const t of r.types) if (t) set.add(t)
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [rows])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchesSearch = toLower(r.country.name).includes(toLower(search))

      const matchesBac =
        bacAccess === 'all' ||
        (bacAccess === 'oui' && r.accessBac) ||
        (bacAccess === 'non' && !r.accessBac)

      const matchesNoBac =
        noBacAccess === 'all' ||
        (noBacAccess === 'oui' && r.accessNoBac) ||
        (noBacAccess === 'non' && !r.accessNoBac)

      const matchesDomain = domain === 'all' || r.types.includes(domain)
      const matchesWork = work === 'all' || r.workBucket === work
      const matchesCost = cost === 'all' || r.costLevel === cost

      return matchesSearch && matchesBac && matchesNoBac && matchesDomain && matchesWork && matchesCost
    })
  }, [rows, search, bacAccess, noBacAccess, domain, work, cost])

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

  const filterSelect =
    'w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-slate-100 outline-none'

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
          <div className="rounded-[2rem] bg-emerald-600 p-4 text-white shadow-xl shadow-emerald-900/40">
            <Wrench className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              Formations techniques (long terme)
            </h1>
            <p className="mt-1 font-medium text-slate-400">
              IT, cuisine, artisanat… avec ou sans bac.
            </p>
          </div>
        </div>

        <div className="relative w-full lg:w-96">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Chercher un pays..."
            className="w-full rounded-2xl border border-white/15 bg-white/5 py-4 pl-12 pr-4 font-medium text-slate-100 outline-none placeholder:text-slate-500 transition-all focus:ring-2 focus:ring-emerald-500/40"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-8 rounded-[2rem] border border-white/10 bg-[#111827] p-6 shadow-xl shadow-black/20">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Accès avec bac
            </p>
            <select className={filterSelect} value={bacAccess} onChange={(e) => setBacAccess(e.target.value as YesNoAll)}>
              <option value="all">Tous</option>
              <option value="oui">Oui</option>
              <option value="non">Non</option>
            </select>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Accès sans bac
            </p>
            <select className={filterSelect} value={noBacAccess} onChange={(e) => setNoBacAccess(e.target.value as YesNoAll)}>
              <option value="all">Tous</option>
              <option value="oui">Oui</option>
              <option value="non">Non</option>
            </select>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Domaine</p>
            <select className={filterSelect} value={domain} onChange={(e) => setDomain(e.target.value)}>
              {domains.map((v) => (
                <option key={v} value={v}>
                  {v === 'all' ? 'Tous' : v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Travail</p>
            <select className={filterSelect} value={work} onChange={(e) => setWork(e.target.value as WorkRights)}>
              <option value="all">Tous</option>
              <option value="autorisé">Autorisé</option>
              <option value="limité">Limité</option>
              <option value="interdit">Interdit</option>
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
        </div>
      </div>

      <GoogleAd slot="education_technical_top" />

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-500" />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <div
              key={r.country.id}
              className="flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827] shadow-xl shadow-black/20 transition-all duration-300 hover:border-emerald-500/35"
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
                  {r.insight || 'Données en cours de collecte.'}
                </p>
              </div>

              <div className="flex-1 space-y-4 p-8">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Avec bac
                    </span>
                    {r.accessBac ? (
                      <BadgeCheck className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <BadgeX className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Sans bac
                    </span>
                    {r.accessNoBac ? (
                      <BadgeCheck className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <BadgeX className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-400">Domaines</span>
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

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-400">Travail</span>
                  </div>
                  <span className="text-xs font-black text-slate-100">{r.workRights || '—'}</span>
                </div>
              </div>

              <div className="mt-auto border-t border-white/10 bg-white/[0.02] p-8">
                <Link
                  href={`/countries/${r.country.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-4 text-sm font-black text-white transition-colors hover:bg-emerald-500/15 hover:border-emerald-500/40"
                >
                  Voir détails pays <Wrench className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-16">
        <GoogleAd slot="education_technical_bottom" />
      </div>
    </div>
  )
}

