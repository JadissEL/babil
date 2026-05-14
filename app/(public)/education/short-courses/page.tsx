'use client'

import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Globe,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import GoogleAd from '@/components/GoogleAd'
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider'
import { educationHubExplorerHref } from '@/lib/cta-hrefs'

type EducationCostBucket = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'
type EducationBacBucket = 'NOT_REQUIRED' | 'REQUIRED' | 'SCHOOL_DEPENDENT' | 'UNKNOWN'

type DurationFilter = 'all' | 'short' | 'mid' | 'long' | 'extended'

type ShortCourseProgram = {
  id: number
  bacBucket: EducationBacBucket
  costBucket: EducationCostBucket
  programType: string | null
  visaType: string | null
  durationText: string | null
  costText: string | null
  estimatedCostText: string | null
  access: string | null
  insight: string | null
  types: string[] | null
  country: { id: number; name: string; region: string }
}

const TIMELINE: Array<{ id: string; window: string; title: string; description: string }> = [
  {
    id: 'micro',
    window: '2-4 semaines',
    title: 'Micro-certificats',
    description: 'Focus sur une compétence technique précise.',
  },
  {
    id: 'sprint',
    window: '1-2 mois',
    title: 'Sprint Académique',
    description: 'Immersion linguistique ou introduction sectorielle.',
  },
  {
    id: 'bootcamp',
    window: '3-6 mois',
    title: 'Professional Bootcamps',
    description: 'Reconversion accélérée et employabilité directe.',
  },
  {
    id: 'diploma',
    window: '6 mois +',
    title: 'Diplômes Courts',
    description: 'Programmes passerelles vers le long terme.',
  },
]

const BAC_OPTIONS: Array<{ value: 'all' | EducationBacBucket; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'NOT_REQUIRED', label: 'Non requis' },
  { value: 'REQUIRED', label: 'Requis' },
  { value: 'SCHOOL_DEPENDENT', label: 'Selon école' },
]

const DURATION_OPTIONS: Array<{ value: DurationFilter; label: string }> = [
  { value: 'all', label: 'Toutes durées' },
  { value: 'short', label: '2-4 semaines' },
  { value: 'mid', label: '1-2 mois' },
  { value: 'long', label: '3-6 mois' },
  { value: 'extended', label: '6 mois +' },
]

const BUDGET_OPTIONS: Array<{ value: 'all' | EducationCostBucket; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'LOW', label: 'Bas' },
  { value: 'MEDIUM', label: 'Moyen' },
  { value: 'HIGH', label: 'Élevé' },
]

function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function bacLabel(bucket: EducationBacBucket): string {
  switch (bucket) {
    case 'NOT_REQUIRED':
      return 'Non'
    case 'REQUIRED':
      return 'Oui'
    case 'SCHOOL_DEPENDENT':
      return 'École'
    default:
      return '—'
  }
}

function budgetDots(bucket: EducationCostBucket): number {
  switch (bucket) {
    case 'LOW':
      return 1
    case 'MEDIUM':
      return 2
    case 'HIGH':
      return 3
    default:
      return 0
  }
}

function durationBucketFromText(text: string | null): DurationFilter | 'unknown' {
  if (!text) return 'unknown'
  const t = text.toLowerCase()
  if (/(semaine|week)/.test(t) && /([1-4])/.test(t)) return 'short'
  if (/(2|3|4|5|6).{0,2}semaines?/i.test(text)) return 'short'
  if (/(1|2).{0,2}(mois|month)/i.test(text)) return 'mid'
  if (/(3|4|5|6).{0,2}(mois|month)/i.test(text)) return 'long'
  if (/(6\s*\+|6\s*mois\s*\+|>\s*6\s*mois|année|year)/i.test(text)) return 'extended'
  return 'unknown'
}

function durationMatches(filter: DurationFilter, text: string | null): boolean {
  if (filter === 'all') return true
  const bucket = durationBucketFromText(text)
  return bucket === filter
}

function programTitle(p: ShortCourseProgram): string {
  if (p.programType && p.programType.trim()) return p.programType.trim()
  if (p.types && p.types.length > 0) return p.types[0]
  return 'Programme intensif'
}

function durationLabel(p: ShortCourseProgram): string {
  if (p.durationText && p.durationText.trim()) return p.durationText.trim()
  const bucket = durationBucketFromText(p.durationText)
  switch (bucket) {
    case 'short':
      return '2-4 semaines'
    case 'mid':
      return '1-2 mois'
    case 'long':
      return '3-6 mois'
    case 'extended':
      return '6 mois +'
    default:
      return 'Flexible'
  }
}

function ClockMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <circle cx="60" cy="60" r="56" fill="none" stroke="#0D1B3E" strokeOpacity="0.16" strokeWidth="1.5" />
      <line x1="60" y1="14" x2="60" y2="22" stroke="#0D1B3E" strokeOpacity="0.5" strokeWidth="2" />
      <line x1="60" y1="98" x2="60" y2="106" stroke="#0D1B3E" strokeOpacity="0.5" strokeWidth="2" />
      <line x1="14" y1="60" x2="22" y2="60" stroke="#0D1B3E" strokeOpacity="0.5" strokeWidth="2" />
      <line x1="98" y1="60" x2="106" y2="60" stroke="#0D1B3E" strokeOpacity="0.5" strokeWidth="2" />
      <line x1="60" y1="60" x2="60" y2="30" stroke="#E07A2B" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="60" y1="60" x2="86" y2="74" stroke="#0D1B3E" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="60" cy="60" r="3.5" fill="#0D1B3E" />
    </svg>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">{label}</p>
      <div className="relative">
        <select
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-[#0D1B3E]/12 bg-white px-3 py-3 pr-9 font-serif text-sm font-medium text-[#0D1B3E] outline-none transition-colors focus:border-[#0D1B3E]/40"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0D1B3E]/45"
          aria-hidden
        />
      </div>
    </div>
  )
}

export default function ShortCoursesPage() {
  const { preference } = useObjectivePreference()
  const explorerHubHref = useMemo(
    () => educationHubExplorerHref(preference.primarySlug),
    [preference.primarySlug],
  )

  const [pendingSearch, setPendingSearch] = useState('')
  const [pendingBac, setPendingBac] = useState<'all' | EducationBacBucket>('all')
  const [pendingDuration, setPendingDuration] = useState<DurationFilter>('all')
  const [pendingBudget, setPendingBudget] = useState<'all' | EducationCostBucket>('all')

  const [search, setSearch] = useState('')
  const [bac, setBac] = useState<'all' | EducationBacBucket>('all')
  const [duration, setDuration] = useState<DurationFilter>('all')
  const [budget, setBudget] = useState<'all' | EducationCostBucket>('all')

  const [items, setItems] = useState<ShortCourseProgram[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = new URL('/api/education/programs', window.location.origin)
    url.searchParams.set('kind', 'SHORT_COURSES')
    if (bac !== 'all') url.searchParams.set('bac', bac)
    if (budget !== 'all') url.searchParams.set('cost', budget)
    if (search.trim()) url.searchParams.set('q', search.trim())
    setLoading(true)
    fetch(url.toString())
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data?.items) ? (data.items as ShortCourseProgram[]) : []
        setItems(list)
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [bac, budget, search])

  const filtered = useMemo(() => {
    return items.filter((p) => durationMatches(duration, p.durationText))
  }, [items, duration])

  const onApplyFilters = () => {
    setSearch(pendingSearch)
    setBac(pendingBac)
    setDuration(pendingDuration)
    setBudget(pendingBudget)
  }

  return (
    <div className="min-h-screen bg-[#FDFBF4] bg-[linear-gradient(rgba(13,27,62,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(13,27,62,0.035)_1px,transparent_1px)] bg-[length:22px_22px]">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:px-8">
        <div className="mb-8 flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-[0.24em] text-[#0D1B3E]/65">
          <Link
            href="/education"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-[#0D1B3E]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to Campus
          </Link>
        </div>

        <header className="mb-12 grid items-start gap-8 sm:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <p className="mb-3 text-[11px] font-black uppercase tracking-[0.28em] text-[#E07A2B]">
              Sprint Hub
            </p>
            <h1 className="font-serif text-4xl font-black tracking-tight text-[#0D1B3E] sm:text-5xl md:text-[3.5rem]">
              Formations courtes &amp; Bootcamps
            </h1>
            <p className="mt-5 max-w-xl font-serif text-base font-medium leading-relaxed text-[#0D1B3E]/75 sm:text-lg">
              Upskilling rapide à l&apos;étranger. Des programmes intensifs de 2 semaines à 6 mois
              pour un ROI temps maximal.
            </p>
          </div>
          <ClockMark className="hidden h-24 w-24 self-start sm:block lg:h-28 lg:w-28" />
        </header>

        <section
          aria-label="Filtres"
          className="mb-16 rounded-2xl border border-[#0D1B3E]/12 bg-white/75 p-4 shadow-sm backdrop-blur sm:p-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
            <div>
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                Recherche
              </p>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0D1B3E]/45"
                  aria-hidden
                />
                <input
                  type="search"
                  placeholder="Domaine, compétence…"
                  value={pendingSearch}
                  onChange={(e) => setPendingSearch(e.target.value)}
                  className="w-full rounded-xl border border-[#0D1B3E]/12 bg-white px-3 py-3 pl-9 font-serif text-sm font-medium text-[#0D1B3E] outline-none transition-colors focus:border-[#0D1B3E]/40"
                />
              </div>
            </div>

            <FilterSelect
              label="Bac requis"
              value={pendingBac}
              onChange={(v) => setPendingBac(v as 'all' | EducationBacBucket)}
              options={BAC_OPTIONS}
            />

            <FilterSelect
              label="Durée"
              value={pendingDuration}
              onChange={(v) => setPendingDuration(v as DurationFilter)}
              options={DURATION_OPTIONS}
            />

            <FilterSelect
              label="Budget"
              value={pendingBudget}
              onChange={(v) => setPendingBudget(v as 'all' | EducationCostBucket)}
              options={BUDGET_OPTIONS}
            />

            <div className="flex items-end">
              <button
                type="button"
                onClick={onApplyFilters}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D1B3E] px-6 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filtrer
              </button>
            </div>
          </div>
        </section>

        <section aria-label="Timeline of Intensity" className="mb-16">
          <h2 className="mb-5 font-serif text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">
            Timeline of Intensity
          </h2>
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TIMELINE.map((step, index) => {
              const active = index < 3
              return (
                <li
                  key={step.id}
                  className="relative rounded-2xl border border-[#0D1B3E]/10 bg-white p-5 shadow-sm sm:p-6"
                >
                  <span
                    className={classNames(
                      'absolute left-5 top-5 inline-block h-2.5 w-2.5 rounded-full',
                      active ? 'bg-[#0D1B3E]' : 'bg-[#0D1B3E]/15',
                    )}
                    aria-hidden
                  />
                  <p className="ml-6 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                    {step.window}
                  </p>
                  <h3
                    className={classNames(
                      'mt-4 font-serif text-base font-black',
                      active ? 'text-[#0D1B3E]' : 'text-[#0D1B3E]/60',
                    )}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-2 font-serif text-xs leading-relaxed text-[#0D1B3E]/65">
                    {step.description}
                  </p>
                </li>
              )
            })}
          </ol>
        </section>

        <section aria-label="Programmes courts" className="mb-16">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#0D1B3E]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#0D1B3E]/20 bg-white/60 p-10 text-center">
              <p className="font-serif text-base text-[#0D1B3E]/75">
                Aucun programme court ne correspond à ces critères. Essayez d&apos;élargir les
                filtres ou ouvrez{' '}
                <Link href={explorerHubHref} className="font-bold underline">
                  l&apos;explorateur
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => {
                const dots = budgetDots(p.costBucket)
                return (
                  <Link
                    key={p.id}
                    href={`/countries/${p.country.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#0D1B3E]/10 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div
                      aria-hidden
                      className="relative h-36 bg-[linear-gradient(135deg,#1e2c4e_0%,#0D1B3E_100%)]"
                    >
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-[#E07A2B] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-sm">
                        {durationLabel(p)}
                      </span>
                      <div className="flex h-full w-full items-center justify-center text-white/30">
                        <Globe className="h-10 w-10" aria-hidden />
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                        {p.country.name}
                      </p>
                      <h3 className="mt-2 font-serif text-lg font-black text-[#0D1B3E]">
                        {programTitle(p)}
                      </h3>

                      <dl className="mt-4 grid grid-cols-1 gap-2 border-t border-[#0D1B3E]/10 pt-4 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/55">
                            Type
                          </dt>
                          <dd className="font-serif font-bold text-[#0D1B3E]">
                            {p.programType || (p.types?.[0] ?? '—')}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/55">
                            Bac requis
                          </dt>
                          <dd className="font-serif font-bold text-[#0D1B3E]">{bacLabel(p.bacBucket)}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/55">
                            Budget
                          </dt>
                          <dd className="flex items-center gap-1" aria-label={`Budget ${dots} sur 3`}>
                            {[0, 1, 2].map((i) => (
                              <span
                                key={i}
                                className={classNames(
                                  'h-2 w-2 rounded-full',
                                  i < dots ? 'bg-[#E07A2B]' : 'bg-[#0D1B3E]/15',
                                )}
                                aria-hidden
                              />
                            ))}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/55">
                            Visa
                          </dt>
                          <dd className="font-serif font-bold text-[#0D1B3E]">{p.visaType || '—'}</dd>
                        </div>
                      </dl>

                      {p.insight ? (
                        <p className="mt-4 font-serif text-xs italic leading-relaxed text-[#0D1B3E]/65">
                          &laquo;&nbsp;{p.insight}&nbsp;&raquo;
                        </p>
                      ) : null}

                      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] transition-transform group-hover:translate-x-0.5">
                        Voir la fiche pays <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        <div className="mb-16 flex justify-center">
          <Link
            href={explorerHubHref}
            className="group inline-flex flex-col items-center gap-3 text-[11px] font-black uppercase tracking-[0.24em] text-[#0D1B3E]/75 transition-colors hover:text-[#0D1B3E]"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#E07A2B] text-[#E07A2B] transition-colors group-hover:bg-[#E07A2B] group-hover:text-white">
              <ArrowRight className="h-5 w-5" aria-hidden />
            </span>
            Explore with Objective
          </Link>
        </div>

        <GoogleAd slot="education_short_bottom" />
      </div>
    </div>
  )
}
