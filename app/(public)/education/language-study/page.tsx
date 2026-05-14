'use client'

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ChevronDown,
  Diamond,
  Globe,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import GoogleAd from '@/components/GoogleAd'
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider'
import { educationHubExplorerHref } from '@/lib/cta-hrefs'

type EducationCostBucket = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'
type EducationBacBucket = 'NOT_REQUIRED' | 'REQUIRED' | 'SCHOOL_DEPENDENT' | 'UNKNOWN'

type LanguageProgramItem = {
  id: number
  bacBucket: EducationBacBucket
  costBucket: EducationCostBucket
  programType: string | null
  visaType: string | null
  costText: string | null
  estimatedCostText: string | null
  access: string | null
  insight: string | null
  country: { id: number; name: string; region: string }
}

type LanguageFilter = 'all' | 'anglais' | 'francais' | 'allemand' | 'espagnol' | 'italien'

const LANGUAGE_OPTIONS: { value: LanguageFilter; label: string }[] = [
  { value: 'all', label: 'Toutes les langues' },
  { value: 'anglais', label: 'Anglais' },
  { value: 'francais', label: 'Français' },
  { value: 'allemand', label: 'Allemand' },
  { value: 'espagnol', label: 'Espagnol' },
  { value: 'italien', label: 'Italien' },
]

const COST_OPTIONS: { value: 'all' | EducationCostBucket; label: string }[] = [
  { value: 'all', label: 'Tous budgets' },
  { value: 'LOW', label: 'Budget bas' },
  { value: 'MEDIUM', label: 'Budget moyen' },
  { value: 'HIGH', label: 'Budget élevé' },
]

const CERTIFICATIONS = [
  {
    id: 'ielts',
    language: 'anglais',
    languageLabel: 'Anglais',
    title: 'IELTS Academic',
    description:
      "Le standard mondial pour l'immigration étudiante anglophone. Requis par plus de 11 000 institutions à travers le monde.",
    metricA: { label: 'Score cible typique', value: '6.5 – 7.0' },
    metricB: { label: 'Durée de préparation', value: '8 – 12 semaines' },
    badge: true,
    wide: true,
  },
  {
    id: 'toefl',
    language: 'anglais',
    languageLabel: 'Anglais (USA)',
    title: 'TOEFL iBT',
    description: 'Privilégié par les universités nord-américaines.',
    metricA: { label: 'Score cible', value: '90 – 100+' },
  },
  {
    id: 'delf',
    language: 'francais',
    languageLabel: 'Français',
    title: 'DELF / DALF',
    description: "Certifications officielles délivrées par l'État français.",
    metricA: { label: 'Niveau requis (univ)', value: 'B2 – C1' },
  },
  {
    id: 'testdaf',
    language: 'allemand',
    languageLabel: 'Allemand',
    title: 'TestDaF',
    description: 'Examen d’allemand pour les études supérieures en Allemagne.',
    metricA: { label: 'Score cible', value: 'TDN 4' },
  },
]

function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function accessTag(access: string | null): { label: string; cls: string } {
  const a = (access ?? '').toLowerCase()
  if (a.includes('fac')) {
    return {
      label: 'Facile',
      cls: 'border-emerald-700/30 bg-emerald-50 text-emerald-800',
    }
  }
  if (a.includes('diff') || a.includes('sél') || a.includes('sel')) {
    return { label: 'Sélectif', cls: 'border-amber-700/30 bg-amber-50 text-amber-800' }
  }
  return { label: 'Moyen', cls: 'border-sky-700/30 bg-sky-50 text-sky-800' }
}

function costSummary(item: LanguageProgramItem): string {
  const raw =
    (item.estimatedCostText && item.estimatedCostText.trim()) ||
    (item.costText && item.costText.trim()) ||
    ''
  if (raw) return raw
  if (item.costBucket === 'LOW') return 'Budget bas'
  if (item.costBucket === 'MEDIUM') return 'Budget moyen'
  if (item.costBucket === 'HIGH') return 'Budget élevé'
  return '—'
}

export default function LanguageStudyPage() {
  const { preference } = useObjectivePreference()
  const explorerHubHref = useMemo(
    () => educationHubExplorerHref(preference.primarySlug),
    [preference.primarySlug],
  )

  const [language, setLanguage] = useState<LanguageFilter>('all')
  const [programType, setProgramType] = useState<string>('all')
  const [cost, setCost] = useState<'all' | EducationCostBucket>('all')

  const [pendingLanguage, setPendingLanguage] = useState<LanguageFilter>('all')
  const [pendingProgramType, setPendingProgramType] = useState<string>('all')
  const [pendingCost, setPendingCost] = useState<'all' | EducationCostBucket>('all')

  const [items, setItems] = useState<LanguageProgramItem[]>([])
  const [allItems, setAllItems] = useState<LanguageProgramItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = new URL('/api/education/programs', window.location.origin)
    url.searchParams.set('kind', 'LANGUAGE_STUDY')
    if (cost !== 'all') url.searchParams.set('cost', cost)
    if (programType !== 'all') url.searchParams.set('programType', programType)
    setLoading(true)
    fetch(url.toString())
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data?.items) ? (data.items as LanguageProgramItem[]) : []
        setItems(list)
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [cost, programType])

  useEffect(() => {
    const url = new URL('/api/education/programs', window.location.origin)
    url.searchParams.set('kind', 'LANGUAGE_STUDY')
    fetch(url.toString())
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data?.items) ? (data.items as LanguageProgramItem[]) : []
        setAllItems(list)
      })
      .catch(() => setAllItems([]))
  }, [])

  const programTypes = useMemo(() => {
    const set = new Set<string>()
    for (const r of allItems) {
      if (r.programType && r.programType.trim()) set.add(r.programType.trim())
    }
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [allItems])

  const certifications = useMemo(() => {
    if (language === 'all') return CERTIFICATIONS
    return CERTIFICATIONS.filter((c) => c.language === language)
  }, [language])

  const onApplyFilters = () => {
    setLanguage(pendingLanguage)
    setProgramType(pendingProgramType)
    setCost(pendingCost)
  }

  return (
    <div className="min-h-screen bg-[#FDFBF4] bg-[linear-gradient(rgba(13,27,62,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(13,27,62,0.035)_1px,transparent_1px)] bg-[length:22px_22px]">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:px-8">
        <div className="mb-10 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.24em] text-[#0D1B3E]/65">
          <Link
            href="/education"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-[#0D1B3E]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Hub Éducation
          </Link>
          <span aria-hidden>·</span>
          <span>Section 04 / Language Programs</span>
        </div>

        <header className="mb-12 max-w-3xl">
          <h1 className="font-serif text-4xl font-black tracking-tight text-[#0D1B3E] sm:text-5xl md:text-6xl">
            Apprendre une langue.
          </h1>
          <p className="mt-5 max-w-2xl font-serif text-base font-medium leading-relaxed text-[#0D1B3E]/80 sm:text-lg">
            Stratégies d&apos;immersion linguistique, préparation certifiée (IELTS/TOEFL) et analyse
            des visas étudiants dédiés pour une maîtrise accélérée.
          </p>
        </header>

        <section
          aria-label="Filtres"
          className="mb-16 rounded-2xl border border-[#0D1B3E]/12 bg-white/70 p-4 shadow-sm backdrop-blur sm:p-5"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <label className="group relative flex items-center gap-3 rounded-xl border border-[#0D1B3E]/12 bg-white px-4 py-3 transition-colors focus-within:border-[#0D1B3E]/40">
              <Globe className="h-4 w-4 shrink-0 text-[#0D1B3E]/55" aria-hidden />
              <select
                aria-label="Sélectionner une langue"
                value={pendingLanguage}
                onChange={(e) => setPendingLanguage(e.target.value as LanguageFilter)}
                className="w-full appearance-none bg-transparent pr-6 font-serif text-sm font-medium text-[#0D1B3E] outline-none"
              >
                {LANGUAGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.value === 'all' ? 'Sélectionner une langue…' : o.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0D1B3E]/45"
                aria-hidden
              />
            </label>

            <label className="group relative flex items-center gap-3 rounded-xl border border-[#0D1B3E]/12 bg-white px-4 py-3 transition-colors focus-within:border-[#0D1B3E]/40">
              <Diamond className="h-4 w-4 shrink-0 text-[#0D1B3E]/55" aria-hidden />
              <select
                aria-label="Type de programme"
                value={pendingProgramType}
                onChange={(e) => setPendingProgramType(e.target.value)}
                className="w-full appearance-none bg-transparent pr-6 font-serif text-sm font-medium text-[#0D1B3E] outline-none"
              >
                {programTypes.map((v) => (
                  <option key={v} value={v}>
                    {v === 'all' ? 'Type de programme…' : v}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0D1B3E]/45"
                aria-hidden
              />
            </label>

            <button
              type="button"
              onClick={onApplyFilters}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D1B3E] px-6 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
            >
              <BarChart3 className="h-4 w-4" aria-hidden /> Filtrer
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/55">
            <span>Budget :</span>
            {COST_OPTIONS.map((opt) => {
              const active = pendingCost === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPendingCost(opt.value)}
                  className={classNames(
                    'rounded-full border px-3 py-1 transition-colors',
                    active
                      ? 'border-[#0D1B3E] bg-[#0D1B3E] text-white'
                      : 'border-[#0D1B3E]/15 text-[#0D1B3E]/65 hover:border-[#0D1B3E]/35',
                  )}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </section>

        <section aria-label="Préparation aux certifications" className="mb-16">
          <h2 className="mb-6 border-b border-[#0D1B3E]/15 pb-3 font-serif text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">
            Préparation aux Certifications
          </h2>

          <div className="grid gap-5 lg:grid-cols-3 lg:grid-rows-[auto_auto]">
            {certifications.map((cert, index) => {
              const isHero = cert.id === 'ielts'
              return (
                <article
                  key={cert.id}
                  className={classNames(
                    'flex flex-col rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md sm:p-7',
                    isHero ? 'lg:col-span-2 lg:row-span-1' : '',
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="rounded-md border border-[#0D1B3E]/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/65">
                      {cert.languageLabel}
                    </span>
                    {cert.badge ? <BadgeCheck className="h-5 w-5 text-emerald-700" aria-hidden /> : null}
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-black text-[#0D1B3E]">{cert.title}</h3>
                  <p className="mt-2 font-serif text-sm leading-relaxed text-[#0D1B3E]/75">
                    {cert.description}
                  </p>
                  <dl
                    className={classNames(
                      'mt-6 grid gap-5 text-[#0D1B3E] sm:gap-8',
                      cert.metricB ? 'grid-cols-2' : 'grid-cols-1',
                    )}
                  >
                    <div>
                      <dt className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                        {cert.metricA.label}
                      </dt>
                      <dd className="mt-1 font-serif text-lg font-black tabular-nums">
                        {cert.metricA.value}
                      </dd>
                    </div>
                    {cert.metricB ? (
                      <div>
                        <dt className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                          {cert.metricB.label}
                        </dt>
                        <dd className="mt-1 font-serif text-lg font-black tabular-nums">
                          {cert.metricB.value}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                  {index < certifications.length - 1 ? null : null}
                </article>
              )
            })}

            <article className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-[#0D1B3E] p-7 text-center text-white shadow-md">
              <BarChart3 className="h-7 w-7 text-white/80" aria-hidden />
              <p className="font-serif text-4xl font-black tabular-nums sm:text-5xl">85%</p>
              <p className="max-w-[20ch] text-[10px] font-black uppercase tracking-[0.22em] text-white/80">
                Taux de réussite après programme intensif
              </p>
            </article>
          </div>
        </section>

        <GoogleAd slot="education_language_top" />

        <section aria-label="Destinations d'immersion" className="mt-12">
          <h2 className="mb-6 border-b border-[#0D1B3E]/15 pb-3 font-serif text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">
            Destinations d&apos;Immersion
          </h2>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#0D1B3E]" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#0D1B3E]/20 bg-white/60 p-10 text-center">
              <p className="font-serif text-base text-[#0D1B3E]/75">
                Aucune destination ne correspond à ces critères. Élargissez les filtres ou ouvrez
                l&apos;<Link href={explorerHubHref} className="font-bold underline">explorateur</Link>.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {items.map((item) => {
                const tag = accessTag(item.access)
                return (
                  <Link
                    key={item.id}
                    href={`/countries/${item.country.id}`}
                    className="group flex overflow-hidden rounded-2xl border border-[#0D1B3E]/12 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div
                      aria-hidden
                      className="hidden h-auto w-32 shrink-0 bg-[linear-gradient(135deg,#2a3a5a_0%,#0D1B3E_100%)] sm:block"
                    >
                      <div className="flex h-full w-full items-center justify-center text-white/40">
                        <Globe className="h-8 w-8" aria-hidden />
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-serif text-xl font-black text-[#0D1B3E]">
                            {item.country.name}
                          </h3>
                          <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                            {item.country.region}
                          </p>
                        </div>
                        <span
                          className={classNames(
                            'rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em]',
                            tag.cls,
                          )}
                        >
                          {tag.label}
                        </span>
                      </div>

                      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex items-center justify-between gap-3 border-b border-[#0D1B3E]/8 pb-2 sm:block sm:border-0">
                          <dt className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/55">
                            Coût mensuel moyen
                          </dt>
                          <dd className="font-serif text-sm font-bold tabular-nums text-[#0D1B3E]">
                            {costSummary(item)}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-3 sm:block">
                          <dt className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/55">
                            Type de visa
                          </dt>
                          <dd className="font-serif text-sm font-bold text-[#0D1B3E]">
                            {item.visaType || '—'}
                          </dd>
                        </div>
                      </dl>

                      {item.insight ? (
                        <p className="mt-4 font-serif text-xs italic leading-relaxed text-[#0D1B3E]/65">
                          &laquo;&nbsp;{item.insight}&nbsp;&raquo;
                        </p>
                      ) : null}

                      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] transition-transform group-hover:translate-x-0.5">
                        Ouvrir la fiche pays <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#0D1B3E]/10 bg-white/60 p-6 sm:p-7">
          <p className="max-w-md font-serif text-sm leading-relaxed text-[#0D1B3E]/75">
            Comparer les coûts de vie, scores de mobilité et visas pour ces destinations dans
            l&apos;explorateur global.
          </p>
          <Link
            href={explorerHubHref}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0D1B3E] px-5 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
          >
            Ouvrir l&apos;explorateur <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-12">
          <GoogleAd slot="education_language_bottom" />
        </div>
      </div>
    </div>
  )
}
