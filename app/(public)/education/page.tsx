'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  GraduationCap, 
  Languages, 
  Wrench, 
  Zap, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  Coins,
  Search,
  BookOpen
} from 'lucide-react'
import GoogleAd from '@/components/GoogleAd'

type EducationCategory = 'languages' | 'technical' | 'short'

export default function EducationPage() {
  const [countries, setCountries] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<EducationCategory>('languages')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/countries')
      .then(res => res.json())
      .then(data => {
        setCountries(data)
        setLoading(false)
      })
  }, [])

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const tabs = [
    {
      id: 'languages',
      label: 'Apprendre une langue',
      icon: Languages,
      active: 'border-blue-500/40 bg-blue-500/15 text-blue-300 shadow-lg shadow-blue-900/25',
    },
    {
      id: 'technical',
      label: 'Formation technique',
      icon: Wrench,
      active: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-lg shadow-emerald-900/25',
    },
    {
      id: 'short',
      label: 'Formations courtes',
      icon: Zap,
      active: 'border-violet-500/40 bg-violet-500/15 text-violet-200 shadow-lg shadow-violet-900/25',
    },
  ] as const

  const getEducationData = (country: any, type: EducationCategory) => {
    const full = country.full_data || {}
    const edu = full.education_mobility || {}
    
    // Fallback if data is missing
    if (!edu[type]) {
      return {
        access: 'Moyen',
        bac_required: 'Dépend de l\'école',
        cost: 'Variable',
        visa: 'Étudiant / Tourisme',
        insight: 'Données en cours de collecte pour ce pays.',
        opportunities: []
      }
    }
    return edu[type]
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 pb-20 sm:px-8">
      <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-[2rem] bg-primary p-4 text-white shadow-soft">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-text md:text-4xl">Education & Training Hub</h1>
            <p className="mt-1 font-medium text-muted">Mobilité éducative pour citoyens marocains.</p>
          </div>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Chercher un pays..."
            className="w-full rounded-2xl border border-line bg-surface py-4 pl-12 pr-4 font-medium text-text outline-none placeholder:text-muted transition-all focus:ring-2 focus:ring-primary/40"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Link
          href="/education/language-study"
          className={`flex items-center gap-4 rounded-[2rem] border border-line bg-surface p-6 shadow-card transition-all hover:border-primary/35`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/35">
            <Languages className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Page dédiée</p>
            <p className="text-lg font-black text-text">Langues à l’étranger</p>
          </div>
        </Link>
        <Link
          href="/education/technical-training"
          className={`flex items-center gap-4 rounded-[2rem] border border-line bg-surface p-6 shadow-card transition-all hover:border-success/35`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/35">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Page dédiée</p>
            <p className="text-lg font-black text-text">Formations techniques</p>
          </div>
        </Link>
        <Link
          href="/education/short-courses"
          className={`flex items-center gap-4 rounded-[2rem] border border-line bg-surface p-6 shadow-card transition-all hover:border-accent/35`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/35">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Page dédiée</p>
            <p className="text-lg font-black text-text">Formations courtes</p>
          </div>
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as EducationCategory)}
            className={`flex items-center gap-3 rounded-2xl border px-8 py-4 text-sm font-black transition-all ${
              activeTab === tab.id
                ? tab.active
                : 'border-line bg-[#f8f2e8] text-muted hover:border-primary/20 hover:text-primary'
            }`}
          >
            <tab.icon className="h-5 w-5" />
            {tab.label}
          </button>
        ))}
      </div>

      <GoogleAd slot="education_top" />

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredCountries.map((c) => {
            const data = getEducationData(c, activeTab)
            return (
              <div
                key={c.id}
                className="group flex flex-col rounded-[2rem] border border-line bg-surface p-8 shadow-card transition-all duration-300 hover:border-primary/35 hover:shadow-soft"
              >
                <div className="mb-8 flex items-start justify-between">
                  <div>
                    <h3 className="mb-1 text-2xl font-black text-text">{c.name}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted">
                      <Globe className="h-3 w-3" /> {c.region}
                    </div>
                  </div>
                  <div
                    className={`rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-widest ${
                      data.access === 'Facile'
                        ? 'border-emerald-500/35 bg-emerald-500/15 text-emerald-200'
                        : data.access === 'Difficile'
                          ? 'border-red-500/35 bg-red-500/15 text-red-200'
                          : 'border-blue-500/35 bg-blue-500/15 text-blue-200'
                    }`}
                  >
                    Accès: {data.access}
                  </div>
                </div>

                <div className="mb-8 space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-line bg-[#f8f2e8] p-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-muted" />
                      <span className="text-xs font-bold text-muted">Bac requis</span>
                    </div>
                    <span className="text-xs font-black text-text">{data.bac_required}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-line bg-[#f8f2e8] p-4">
                    <div className="flex items-center gap-3">
                      <Coins className="h-4 w-4 text-muted" />
                      <span className="text-xs font-bold text-muted">Coût estimé</span>
                    </div>
                    <span className="text-xs font-black text-text">{data.cost}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-line bg-[#f8f2e8] p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-muted" />
                      <span className="text-xs font-bold text-muted">Visa</span>
                    </div>
                    <span className="text-xs font-black text-text">{data.visa}</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-primary-soft p-6 transition-colors group-hover:border-primary/40">
                    <h4 className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                      <AlertCircle className="h-3 w-3" /> Insight
                    </h4>
                    <p className="text-sm font-bold leading-relaxed text-text">&quot;{data.insight}&quot;</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
