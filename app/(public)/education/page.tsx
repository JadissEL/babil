'use client'

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
  BookOpen,
  Microscope,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import GoogleAd from '@/components/GoogleAd'
import {
  normalizeCountriesApiListResponse,
  type CountryApiListRow,
} from '@/lib/country-full-data-materialize'
import { hasCountryPhdStoredData } from '@/lib/country-phd-studies'

type EducationCategory = 'languages' | 'technical' | 'short'

/** Keys inside `full_data.education_mobility` (see data/countries.json). */
const EDUCATION_MOBILITY_TAB_KEY: Record<EducationCategory, string> = {
  languages: 'language_study',
  technical: 'technical_training',
  short: 'short_courses',
}

function eduText(v: unknown, fallback: string) {
  if (v == null) return fallback
  const s = typeof v === 'string' || typeof v === 'number' ? String(v) : ''
  return s.trim() ? s : fallback
}

export default function EducationPage() {
  const [countries, setCountries] = useState<CountryApiListRow[]>([])
  const [activeTab, setActiveTab] = useState<EducationCategory>('languages')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => setCountries(normalizeCountriesApiListResponse(data)))
      .catch(() => setCountries([]))
      .finally(() => setLoading(false))
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

  const getEducationData = (country: CountryApiListRow, type: EducationCategory) => {
    const full = country.full_data
    const edu = full.education_mobility as Record<string, unknown> | undefined
    const block = edu?.[EDUCATION_MOBILITY_TAB_KEY[type]]

    if (!block || typeof block !== 'object') {
      return {
        access: 'Moyen',
        bac_required: "Dépend de l'école",
        cost: 'Variable',
        visa: 'Étudiant / Tourisme',
        insight: 'Données en cours de collecte pour ce pays.',
        opportunities: [] as unknown[],
      }
    }
    return block as Record<string, unknown>
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 pb-20 sm:px-8">
      <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-[2rem] bg-primary p-4 text-white shadow-soft">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-text md:text-4xl">Hub éducation & formation</h1>
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

      <Link
        href="/explorer?goal=education"
        className="group mb-10 flex flex-col gap-4 rounded-[2rem] border border-primary/25 bg-surface p-6 shadow-card transition-all hover:border-primary/40 hover:shadow-soft sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
            <Microscope className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Volet Doctorat (PhD)</p>
            <p className="mt-1 text-lg font-black text-text">Décision par pays : visa long séjour, financement, reconnaissance des diplômes</p>
            <p className="mt-2 text-sm font-medium text-muted">
              Lorsque les données sont enrichies, un guide doctoral (
              <code className="rounded bg-inset px-1.5 py-0.5 text-xs font-bold">full_data.phd_studies</code>
              ) est disponible sur la fiche pays et une page dédiée. Sinon, la fiche reste utile pour visa, friction et
              mobilité étudiante. Choisissez un pays ci-dessous ou l&apos;explorateur.
            </p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-line bg-inset px-6 py-3 text-xs font-black uppercase tracking-widest text-text transition-colors group-hover:border-primary/40 group-hover:bg-primary-soft sm:justify-end">
          Explorer <ArrowRight className="h-4 w-4" />
        </span>
      </Link>

      <div className="mb-10 grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-3 md:items-stretch">
        <Link
          href="/education/language-study"
          className={`flex h-full min-w-0 items-center gap-4 rounded-[2rem] border border-line bg-surface p-6 shadow-card transition-all hover:border-primary/35`}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/35">
            <Languages className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Page dédiée</p>
            <p className="break-words text-lg font-black text-text">Langues à l’étranger</p>
          </div>
        </Link>
        <Link
          href="/education/technical-training"
          className={`flex h-full min-w-0 items-center gap-4 rounded-[2rem] border border-line bg-surface p-6 shadow-card transition-all hover:border-success/35`}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/35">
            <Wrench className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Page dédiée</p>
            <p className="break-words text-lg font-black text-text">Formations techniques</p>
          </div>
        </Link>
        <Link
          href="/education/short-courses"
          className={`flex h-full min-w-0 items-center gap-4 rounded-[2rem] border border-line bg-surface p-6 shadow-card transition-all hover:border-accent/35`}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/35">
            <Zap className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Page dédiée</p>
            <p className="break-words text-lg font-black text-text">Formations courtes</p>
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
                : 'border-line bg-inset text-muted hover:border-primary/20 hover:text-primary'
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
        <div className="grid auto-rows-fr grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredCountries.map((c) => {
            const data = getEducationData(c, activeTab)
            const accessLabel = eduText(data.access, 'Moyen')
            const hasPhd = hasCountryPhdStoredData((c.full_data ?? {}) as Record<string, unknown>)
            return (
              <div
                key={String(c.id)}
                className="group flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] border border-line bg-surface p-8 shadow-card transition-all duration-300 hover:border-primary/35 hover:shadow-soft"
              >
                <div className="mb-8 flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="mb-1 break-words text-2xl font-black text-text">{c.name}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted">
                      <Globe className="h-3 w-3" /> {String(c.region ?? '')}
                    </div>
                  </div>
                  <div
                    className={`shrink-0 rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-widest ${
                      accessLabel === 'Facile'
                        ? 'border-emerald-500/35 bg-emerald-500/15 text-emerald-200'
                        : accessLabel === 'Difficile'
                          ? 'border-red-500/35 bg-red-500/15 text-red-200'
                          : 'border-blue-500/35 bg-blue-500/15 text-blue-200'
                    }`}
                  >
                    Accès: {accessLabel}
                  </div>
                </div>

                <div className="mb-8 min-h-0 space-y-4">
                  <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-line bg-inset p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <BookOpen className="h-4 w-4 shrink-0 text-muted" />
                      <span className="text-xs font-bold text-muted">Bac requis</span>
                    </div>
                    <span className="min-w-0 max-w-[55%] text-right text-xs font-black break-words text-text sm:max-w-[60%]">
                      {eduText(data.bac_required, "Dépend de l'école")}
                    </span>
                  </div>

                  <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-line bg-inset p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Coins className="h-4 w-4 shrink-0 text-muted" />
                      <span className="text-xs font-bold text-muted">Coût estimé</span>
                    </div>
                    <span className="min-w-0 max-w-[55%] text-right text-xs font-black break-words text-text sm:max-w-[60%]">
                      {eduText(data.cost, 'Variable')}
                    </span>
                  </div>

                  <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-line bg-inset p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-muted" />
                      <span className="text-xs font-bold text-muted">Visa</span>
                    </div>
                    <span className="min-w-0 max-w-[55%] text-right text-xs font-black break-words text-text sm:max-w-[60%]">
                      {eduText(data.visa, 'Étudiant / Tourisme')}
                    </span>
                  </div>
                </div>

                <div className="mt-auto min-h-0">
                  <div className="relative max-h-[min(12rem,32vh)] overflow-y-auto overflow-x-hidden rounded-3xl border border-primary/25 bg-primary-soft p-6 transition-colors group-hover:border-primary/40">
                    <h4 className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                      <AlertCircle className="h-3 w-3" /> Insight
                    </h4>
                    <p className="break-words text-sm font-bold leading-relaxed text-text">
                      &quot;{eduText(data.insight, 'Données en cours de collecte pour ce pays.')}&quot;
                    </p>
                  </div>
                  <div className="mt-4 flex min-w-0 flex-col gap-2">
                    <Link
                      href={`/countries/${c.id}`}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-inset py-3 text-[10px] font-black uppercase tracking-widest text-primary transition-colors hover:border-primary/35 hover:bg-primary-soft"
                    >
                      Fiche pays — visa &amp; mobilité <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    </Link>
                    {hasPhd ? (
                      <Link
                        href={`/countries/${c.id}/doctorat`}
                        className="flex items-center justify-center gap-2 rounded-2xl border border-primary/25 bg-primary-soft/40 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary transition-colors hover:border-primary/40 hover:bg-primary-soft"
                      >
                        Guide doctoral PhD <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                      </Link>
                    ) : null}
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
