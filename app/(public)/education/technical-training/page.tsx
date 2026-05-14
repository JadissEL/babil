'use client'

import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  ChevronDown,
  Coins,
  GraduationCap,
  Globe,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Stamp,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import GoogleAd from '@/components/GoogleAd'
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider'
import { iso2ForCountryNameOrEmpty } from '@/lib/country-card-mappers'
import { educationHubExplorerHref } from '@/lib/cta-hrefs'

type EducationBacBucket = 'NOT_REQUIRED' | 'REQUIRED' | 'SCHOOL_DEPENDENT' | 'UNKNOWN'
type EducationCostBucket = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'
type EducationWorkRightsBucket = 'ALLOWED' | 'LIMITED' | 'FORBIDDEN' | 'UNKNOWN'

type TechnicalTrainingProgram = {
  id: number
  bacBucket: EducationBacBucket
  costBucket: EducationCostBucket
  workRightsBucket: EducationWorkRightsBucket
  programType: string | null
  visaType: string | null
  durationText: string | null
  costText: string | null
  estimatedCostText: string | null
  bacRequiredText: string | null
  workRightsText: string | null
  insight: string | null
  types: string[] | null
  accessBac: boolean | null
  accessNoBac: boolean | null
  country: { id: number; name: string; region: string }
}

const BAC_OPTIONS: Array<{ value: 'all' | EducationBacBucket; label: string }> = [
  { value: 'all', label: 'Tous niveaux' },
  { value: 'NOT_REQUIRED', label: 'Sans Bac' },
  { value: 'REQUIRED', label: 'Bac requis' },
  { value: 'SCHOOL_DEPENDENT', label: 'Selon école' },
]

const WORK_OPTIONS: Array<{ value: 'all' | EducationWorkRightsBucket; label: string }> = [
  { value: 'all', label: 'Peu importe' },
  { value: 'ALLOWED', label: 'Autorisé' },
  { value: 'LIMITED', label: 'Limité' },
  { value: 'FORBIDDEN', label: 'Interdit' },
]

function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function bacAcademicLabel(p: TechnicalTrainingProgram): string {
  if (p.bacRequiredText && p.bacRequiredText.trim()) return p.bacRequiredText.trim()
  if (p.accessNoBac === true) return 'Accès sans Bac possible'
  switch (p.bacBucket) {
    case 'NOT_REQUIRED':
      return 'Accès sans Bac possible'
    case 'REQUIRED':
      return 'Bac requis'
    case 'SCHOOL_DEPENDENT':
      return 'Selon l’école'
    default:
      return '—'
  }
}

function workRightsLabel(p: TechnicalTrainingProgram): string {
  if (p.workRightsText && p.workRightsText.trim()) return p.workRightsText.trim()
  switch (p.workRightsBucket) {
    case 'ALLOWED':
      return 'Autorisé'
    case 'LIMITED':
      return 'Limité'
    case 'FORBIDDEN':
      return 'Interdit'
    default:
      return '—'
  }
}

function costEstimateLabel(p: TechnicalTrainingProgram): string {
  if (p.estimatedCostText && p.estimatedCostText.trim()) return p.estimatedCostText.trim()
  if (p.costText && p.costText.trim()) return p.costText.trim()
  switch (p.costBucket) {
    case 'LOW':
      return 'Coût bas'
    case 'MEDIUM':
      return 'Coût moyen'
    case 'HIGH':
      return 'Coût élevé'
    default:
      return '—'
  }
}

function programTitle(p: TechnicalTrainingProgram): string {
  if (p.programType && p.programType.trim()) return p.programType.trim()
  if (p.types && p.types.length > 0) return p.types[0]
  return 'Filière technique'
}

function GearMark({ className, mirrored = false }: { className?: string; mirrored?: boolean }) {
  return (
    <svg
      viewBox="0 0 160 160"
      aria-hidden
      className={className}
      style={mirrored ? { transform: 'scaleX(-1)' } : undefined}
    >
      <g stroke="#0D1B3E" strokeOpacity="0.18" strokeWidth="1.5" fill="none">
        <circle cx="46" cy="46" r="20" />
        <circle cx="46" cy="46" r="8" />
        <line x1="46" y1="18" x2="46" y2="26" />
        <line x1="46" y1="66" x2="46" y2="74" />
        <line x1="18" y1="46" x2="26" y2="46" />
        <line x1="66" y1="46" x2="74" y2="46" />
        <line x1="28" y1="28" x2="34" y2="34" />
        <line x1="58" y1="58" x2="64" y2="64" />
        <line x1="64" y1="28" x2="58" y2="34" />
        <line x1="34" y1="58" x2="28" y2="64" />
      </g>
      <g stroke="#0D1B3E" strokeOpacity="0.12" strokeWidth="1.5" fill="none">
        <path d="M100 130 L120 110 L130 120 L150 100" />
        <path d="M104 134 L108 130" />
        <path d="M124 114 L128 110" />
        <path d="M140 110 L144 106" />
      </g>
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

function CardRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="mt-0.5 flex h-5 w-5 items-center justify-center text-[#0D1B3E]/65">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[9.5px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">{label}</p>
        <p className="mt-0.5 font-serif text-[13px] font-medium leading-snug text-[#0D1B3E]">{value}</p>
      </div>
    </div>
  )
}

export default function TechnicalTrainingPage() {
  const { preference } = useObjectivePreference()
  const explorerHubHref = useMemo(
    () => educationHubExplorerHref(preference.primarySlug),
    [preference.primarySlug],
  )

  const [pendingSearch, setPendingSearch] = useState('')
  const [pendingBac, setPendingBac] = useState<'all' | EducationBacBucket>('all')
  const [pendingDomain, setPendingDomain] = useState<string>('all')
  const [pendingWork, setPendingWork] = useState<'all' | EducationWorkRightsBucket>('all')

  const [search, setSearch] = useState('')
  const [bac, setBac] = useState<'all' | EducationBacBucket>('all')
  const [domain, setDomain] = useState<string>('all')
  const [work, setWork] = useState<'all' | EducationWorkRightsBucket>('all')

  const [items, setItems] = useState<TechnicalTrainingProgram[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = new URL('/api/education/programs', window.location.origin)
    url.searchParams.set('kind', 'TECHNICAL_TRAINING')
    if (bac !== 'all') url.searchParams.set('bac', bac)
    if (work !== 'all') url.searchParams.set('work', work)
    if (domain !== 'all') url.searchParams.set('programType', domain)
    if (search.trim()) url.searchParams.set('q', search.trim())
    setLoading(true)
    fetch(url.toString())
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data?.items) ? (data.items as TechnicalTrainingProgram[]) : []
        setItems(list)
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [bac, work, domain, search])

  const domainOptions = useMemo(() => {
    const set = new Set<string>()
    for (const p of items) {
      if (p.programType) set.add(p.programType)
      if (Array.isArray(p.types)) for (const t of p.types) if (t) set.add(t)
    }
    return [
      { value: 'all', label: 'Tous domaines' },
      ...Array.from(set)
        .sort((a, b) => a.localeCompare(b))
        .map((v) => ({ value: v, label: v })),
    ]
  }, [items])

  const onApplyFilters = () => {
    setSearch(pendingSearch)
    setBac(pendingBac)
    setDomain(pendingDomain)
    setWork(pendingWork)
  }

  return (
    <div className="min-h-screen bg-[#FDFBF4] bg-[linear-gradient(rgba(13,27,62,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(13,27,62,0.035)_1px,transparent_1px)] bg-[length:22px_22px]">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:px-8">
        <div className="mb-8 flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-[0.24em] text-[#0D1B3E]/65">
          <Link
            href="/education"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-[#0D1B3E]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Education
          </Link>
        </div>

        <header className="relative mb-12 overflow-hidden rounded-3xl border border-[#0D1B3E]/10 bg-white/55 px-6 py-12 text-center backdrop-blur sm:px-12 sm:py-16">
          <GearMark className="pointer-events-none absolute -left-6 top-2 h-32 w-32 opacity-90" />
          <GearMark
            className="pointer-events-none absolute -right-6 bottom-0 h-32 w-32 opacity-90"
            mirrored
          />
          <div className="relative mx-auto max-w-2xl">
            <p className="mb-4 inline-flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/70">
              <Briefcase className="h-3.5 w-3.5" aria-hidden /> Pôle Atelier
            </p>
            <h1 className="font-serif text-4xl font-black tracking-tight text-[#0D1B3E] sm:text-5xl">
              Formations techniques &amp; métiers
            </h1>
            <p className="mt-5 font-serif text-base font-medium leading-relaxed text-[#0D1B3E]/75 sm:text-lg">
              Analyse pragmatique des filières professionnalisantes. Évaluer les voies d&apos;accès,
              les requis académiques et les opportunités d&apos;intégration sur les marchés de
              l&apos;emploi internationaux.
            </p>
          </div>
        </header>

        <section
          aria-label="Filtres"
          className="mb-16 rounded-2xl border border-[#0D1B3E]/12 bg-white/75 p-4 shadow-sm backdrop-blur sm:p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                Recherche globale
              </p>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0D1B3E]/45"
                  aria-hidden
                />
                <input
                  type="search"
                  placeholder="Pays, domaine, métier…"
                  value={pendingSearch}
                  onChange={(e) => setPendingSearch(e.target.value)}
                  className="w-full rounded-xl border border-[#0D1B3E]/12 bg-white px-3 py-3 pl-9 font-serif text-sm font-medium text-[#0D1B3E] outline-none transition-colors focus:border-[#0D1B3E]/40"
                />
              </div>
            </div>

            <FilterSelect
              label="Niveau requis"
              value={pendingBac}
              onChange={(v) => setPendingBac(v as 'all' | EducationBacBucket)}
              options={BAC_OPTIONS}
            />

            <FilterSelect
              label="Domaine d'activité"
              value={pendingDomain}
              onChange={(v) => setPendingDomain(v)}
              options={domainOptions}
            />

            <FilterSelect
              label="Droits au travail"
              value={pendingWork}
              onChange={(v) => setPendingWork(v as 'all' | EducationWorkRightsBucket)}
              options={WORK_OPTIONS}
            />
          </div>
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={onApplyFilters}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0D1B3E] px-6 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filtrer la matrice
            </button>
          </div>
        </section>

        <section aria-label="Matrice des destinations" className="mb-16">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-serif text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">
              Matrice des destinations
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
              {loading
                ? 'Chargement…'
                : `${items.length} ${items.length > 1 ? 'opportunités identifiées' : 'opportunité identifiée'}`}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#0D1B3E]" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#0D1B3E]/20 bg-white/60 p-10 text-center">
              <p className="font-serif text-base text-[#0D1B3E]/75">
                Aucune filière technique ne correspond à ces critères. Essayez d&apos;élargir les
                filtres ou ouvrez{' '}
                <Link href={explorerHubHref} className="font-bold underline">
                  l&apos;explorateur
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => {
                const iso2 = iso2ForCountryNameOrEmpty(p.country.name)
                return (
                  <Link
                    key={p.id}
                    href={`/countries/${p.country.id}`}
                    className="group flex flex-col rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                        {p.country.name}
                      </p>
                      {iso2 ? (
                        <span className="rounded-md border border-[#0D1B3E]/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#0D1B3E]/75">
                          {iso2.toUpperCase()}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="font-serif text-lg font-black leading-snug text-[#0D1B3E]">
                      {programTitle(p)}
                    </h3>

                    <div className="mt-5 space-y-2 border-t border-[#0D1B3E]/10 pt-4">
                      <CardRow
                        icon={<GraduationCap className="h-4 w-4" aria-hidden />}
                        label="Requis académique"
                        value={bacAcademicLabel(p)}
                      />
                      <CardRow
                        icon={<ShieldCheck className="h-4 w-4" aria-hidden />}
                        label="Droits au travail"
                        value={workRightsLabel(p)}
                      />
                      <CardRow
                        icon={<Coins className="h-4 w-4" aria-hidden />}
                        label="Coût estimé"
                        value={costEstimateLabel(p)}
                      />
                      <CardRow
                        icon={<Stamp className="h-4 w-4" aria-hidden />}
                        label="Type de visa"
                        value={p.visaType || '—'}
                      />
                    </div>

                    {p.insight ? (
                      <p className="mt-5 border-t border-[#0D1B3E]/10 pt-4 font-serif text-xs italic leading-relaxed text-[#0D1B3E]/65">
                        &laquo;&nbsp;{p.insight}&nbsp;&raquo;
                      </p>
                    ) : null}

                    <span className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] transition-transform group-hover:translate-x-0.5">
                      Voir la fiche pays <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        <div className="mb-12">
          <GoogleAd slot="education_technical_bottom" />
        </div>

        <section
          aria-label="Poursuivre l'analyse sectorielle"
          className="rounded-2xl border border-[#0D1B3E]/10 bg-[#F4EFE2] px-6 py-10 text-center sm:px-12"
        >
          <div className="mx-auto flex max-w-2xl flex-col items-center">
            <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#0D1B3E]/20 bg-white text-[#0D1B3E]">
              <Globe className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="font-serif text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">
              Poursuivre l&apos;analyse sectorielle
            </h3>
            <p className="mt-3 font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/75 sm:text-base">
              Explore les scores d&apos;employabilité globaux et les bassins d&apos;emploi pour ces
              pays dans notre terminal d&apos;intelligence économique.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={explorerHubHref}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0D1B3E] px-6 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
              >
                Ouvrir l&apos;explorer
              </Link>
              <Link
                href="/business"
                className="inline-flex items-center gap-2 rounded-xl border border-[#0D1B3E]/25 bg-white px-6 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] transition-transform hover:-translate-y-0.5"
              >
                Consulter le business hub
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
