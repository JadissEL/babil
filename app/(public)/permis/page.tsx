'use client'

import {
  ChevronDown,
  Info,
  Search,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import GoogleAd from '@/components/GoogleAd'
import { normalizeCountriesApiListResponse } from '@/lib/country-full-data-materialize'
import {
  materializeDrivingRightsIntel,
  residencyCategoryMatchesFilter,
  type DrivingRightsIntelV1,
  type ResidencyDrivingCategory,
} from '@/lib/driving-rights-intel'

type CountryRow = {
  id: number
  name: string
  intel: DrivingRightsIntelV1
}

const RESIDENCY_OPTIONS: Array<{ id: ResidencyDrivingCategory | 'all'; label: string }> = [
  { id: 'tourist', label: 'Touriste' },
  { id: 'student', label: 'Étudiant' },
  { id: 'worker', label: 'Travail / salarié' },
  { id: 'temporary_resident', label: 'Résidence temporaire' },
  { id: 'permanent_resident', label: 'Résidence permanente' },
  { id: 'refugee_asylum', label: 'Protection internationale' },
  { id: 'all', label: 'Tous profils' },
]

const MAX_MATRIX_COLUMNS = 4
const DEFAULT_COLUMN_COUNT = 3

function durationForResidency(
  intel: DrivingRightsIntelV1,
  residency: ResidencyDrivingCategory | 'all',
): string {
  const d = intel.durations
  switch (residency) {
    case 'student':
      return d.student || d.tourist || '—'
    case 'worker':
      return d.worker || d.temporaryResident || '—'
    case 'temporary_resident':
      return d.temporaryResident || d.worker || '—'
    case 'permanent_resident':
      return d.permanentResident || d.temporaryResident || '—'
    case 'tourist':
    case 'refugee_asylum':
    case 'all':
    default:
      return d.tourist || d.student || '—'
  }
}

function idpLabel(intel: DrivingRightsIntelV1): { label: string; tone: 'danger' | 'info' | 'muted' } {
  switch (intel.eligibility.idpRequired) {
    case true:
      return { label: 'Obligatoire', tone: 'danger' }
    case false:
      return { label: 'Non requis', tone: 'muted' }
    default:
      return { label: 'Recommandé', tone: 'info' }
  }
}

function exchangeLabel(intel: DrivingRightsIntelV1): string {
  const reqs = intel.conversion.requirements ?? []
  const hasDirect = reqs.includes('direct_exchange')
  const hasExam = reqs.includes('theory_exam') || reqs.includes('practical_exam')
  const hasBilateral = Boolean(intel.eligibility.bilateralAgreementWithMorocco?.exists)
  if (intel.conversion.possible === true) {
    if (hasBilateral || hasDirect) return 'Possible (Accord bilatéral)'
    if (hasExam) return 'Examen théorique/pratique'
    return 'Possible'
  }
  if (intel.conversion.possible === false) return 'Non indiquée'
  if (hasExam) return 'Examen théorique/pratique'
  if (hasDirect || hasBilateral) return 'Accord bilatéral'
  const summary = intel.conversion.summary?.trim()
  return summary || 'À confirmer'
}

function conversionDeadlineLabel(intel: DrivingRightsIntelV1): string {
  const note = intel.conversion.deadlineNotes
  if (note && note.trim()) return note.trim()
  if (intel.conversion.possible === false) return 'N/A'
  return 'Variable'
}

function NightEarthHeroDecor() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: [
          'radial-gradient(circle at 18% 32%, rgba(255,196,120,0.55) 0px, rgba(255,196,120,0) 8px)',
          'radial-gradient(circle at 22% 38%, rgba(255,196,120,0.42) 0px, rgba(255,196,120,0) 6px)',
          'radial-gradient(circle at 32% 30%, rgba(255,210,150,0.32) 0px, rgba(255,210,150,0) 5px)',
          'radial-gradient(circle at 28% 44%, rgba(255,196,120,0.4) 0px, rgba(255,196,120,0) 5px)',
          'radial-gradient(circle at 48% 50%, rgba(255,180,90,0.5) 0px, rgba(255,180,90,0) 7px)',
          'radial-gradient(circle at 56% 58%, rgba(255,210,150,0.35) 0px, rgba(255,210,150,0) 5px)',
          'radial-gradient(circle at 64% 44%, rgba(255,196,120,0.5) 0px, rgba(255,196,120,0) 7px)',
          'radial-gradient(circle at 72% 56%, rgba(255,180,90,0.35) 0px, rgba(255,180,90,0) 5px)',
          'radial-gradient(circle at 78% 38%, rgba(255,210,150,0.4) 0px, rgba(255,210,150,0) 5px)',
          'radial-gradient(circle at 86% 60%, rgba(255,196,120,0.45) 0px, rgba(255,196,120,0) 6px)',
          'radial-gradient(circle at 12% 70%, rgba(255,196,120,0.3) 0px, rgba(255,196,120,0) 4px)',
          'radial-gradient(circle at 36% 78%, rgba(255,210,150,0.35) 0px, rgba(255,210,150,0) 4px)',
          'radial-gradient(circle at 58% 80%, rgba(255,196,120,0.3) 0px, rgba(255,196,120,0) 4px)',
          'radial-gradient(circle at 80% 78%, rgba(255,180,90,0.35) 0px, rgba(255,180,90,0) 4px)',
          'radial-gradient(ellipse at 50% 60%, rgba(13,27,62,0) 30%, rgba(13,27,62,0.7) 100%)',
          'linear-gradient(135deg, #0d1b3e 0%, #1f2d52 55%, #2a3a72 100%)',
        ].join(', '),
      }}
    />
  )
}

function MatrixCell({
  children,
  tone = 'default',
}: {
  children: React.ReactNode
  tone?: 'default' | 'danger' | 'info' | 'muted'
}) {
  const colorClass =
    tone === 'danger'
      ? 'text-rose-700'
      : tone === 'info'
        ? 'text-blue-700'
        : tone === 'muted'
          ? 'text-[#0D1B3E]/60'
          : 'text-[#0D1B3E]'
  return (
    <td className={`px-4 py-5 align-top font-serif text-sm font-medium ${colorClass}`}>{children}</td>
  )
}

function PermisPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [countries, setCountries] = useState<CountryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [residency, setResidency] = useState<ResidencyDrivingCategory | 'all'>('tourist')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const compareIds = useMemo(() => {
    const raw = searchParams?.get('compare')
    if (!raw) return [] as number[]
    return raw
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n) && n > 0)
      .slice(0, MAX_MATRIX_COLUMNS)
  }, [searchParams])

  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => {
        const list = normalizeCountriesApiListResponse(data)
        const rows: CountryRow[] = list.map((c) => ({
          id: Number(c.id),
          name: String(c.name),
          intel: materializeDrivingRightsIntel((c.full_data ?? {}) as Record<string, unknown>),
        }))
        setCountries(rows)
      })
      .catch(() => setCountries([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target as Node)) setShowSuggestions(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const residencyFilteredCountries = useMemo(() => {
    if (residency === 'all') return countries
    return countries.filter((row) =>
      row.intel.residencyRules.some((r) => residencyCategoryMatchesFilter(r, residency)),
    )
  }, [countries, residency])

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return [] as CountryRow[]
    return residencyFilteredCountries
      .filter((r) => r.name.toLowerCase().includes(q) && !compareIds.includes(r.id))
      .slice(0, 8)
  }, [residencyFilteredCountries, query, compareIds])

  const matrixColumns = useMemo<CountryRow[]>(() => {
    const byId = new Map(countries.map((c) => [c.id, c]))
    if (compareIds.length > 0) {
      return compareIds
        .map((id) => byId.get(id))
        .filter((r): r is CountryRow => Boolean(r))
        .slice(0, MAX_MATRIX_COLUMNS)
    }
    return residencyFilteredCountries.slice(0, DEFAULT_COLUMN_COUNT)
  }, [compareIds, countries, residencyFilteredCountries])

  const remainingCount = Math.max(0, residencyFilteredCountries.length - matrixColumns.length)

  const setCompare = (ids: number[]) => {
    const sp = new URLSearchParams(Array.from(searchParams?.entries() ?? []))
    if (ids.length === 0) {
      sp.delete('compare')
    } else {
      sp.set('compare', ids.join(','))
    }
    const qs = sp.toString()
    router.replace(qs ? `/permis?${qs}` : '/permis')
  }

  const addCountry = (row: CountryRow) => {
    const base = compareIds.length > 0 ? compareIds : matrixColumns.map((c) => c.id)
    const next = Array.from(new Set([...base, row.id])).slice(0, MAX_MATRIX_COLUMNS)
    setCompare(next)
    setQuery('')
    setShowSuggestions(false)
  }

  const removeColumn = (id: number) => {
    const base = compareIds.length > 0 ? compareIds : matrixColumns.map((c) => c.id)
    const next = base.filter((x) => x !== id)
    setCompare(next)
  }

  return (
    <div className="min-h-screen bg-[#FDFBF4]">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:px-8">
        <section
          aria-label="Hero"
          className="relative mb-10 overflow-hidden rounded-2xl border border-[#0D1B3E]/10 shadow-sm"
        >
          <NightEarthHeroDecor />
          <div className="relative px-6 py-12 sm:px-12 sm:py-16">
            <p className="mb-3 text-[11px] font-black uppercase tracking-[0.28em] text-white/75">
              Voyage — Permis International &amp; Conduite
            </p>
            <h1 className="max-w-2xl font-serif text-4xl font-black tracking-tight text-white sm:text-[2.75rem] md:text-5xl">
              Conduire à l&apos;étranger&nbsp;: Droits et Formalités
            </h1>
            <p className="mt-4 max-w-xl font-serif text-base font-medium leading-relaxed text-white/85 sm:text-lg">
              Intelligence mobilité pour votre permis marocain et road trips internationaux.
            </p>
          </div>
        </section>

        <section
          role="note"
          aria-label="Disclaimer"
          className="mb-10 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-900"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p className="font-serif text-sm font-medium leading-relaxed">
            <span className="mr-2 text-[10px] font-black uppercase tracking-[0.22em] text-rose-700">
              Disclaimer
            </span>
            Les informations fournies sont à titre indicatif et ne constituent pas un avis juridique
            officiel. Vérifiez toujours auprès des autorités locales.
          </p>
        </section>

        <section
          aria-label="Filtres"
          className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2"
        >
          <div ref={wrapperRef} className="relative">
            <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
              Recherche de destination
            </p>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0D1B3E]/45"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Entrez un pays…"
                className="w-full rounded-xl border border-[#0D1B3E]/12 bg-white px-3 py-3 pl-9 font-serif text-sm font-medium text-[#0D1B3E] outline-none transition-colors focus:border-[#0D1B3E]/40"
                aria-autocomplete="list"
                aria-expanded={showSuggestions && suggestions.length > 0}
              />
            </div>
            {showSuggestions && suggestions.length > 0 ? (
              <ul
                role="listbox"
                className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-[#0D1B3E]/12 bg-white py-1 shadow-md"
              >
                {suggestions.map((row) => (
                  <li key={row.id} role="option" aria-selected="false">
                    <button
                      type="button"
                      onClick={() => addCountry(row)}
                      disabled={matrixColumns.length >= MAX_MATRIX_COLUMNS}
                      className="flex w-full items-center justify-between px-4 py-2 text-left font-serif text-sm font-medium text-[#0D1B3E] hover:bg-[#FDFBF4] disabled:opacity-50"
                    >
                      <span>{row.name}</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0D1B3E]/50">
                        Ajouter
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div>
            <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
              Profil de résidence
            </p>
            <div className="relative">
              <select
                aria-label="Profil de résidence"
                value={residency}
                onChange={(e) => setResidency(e.target.value as ResidencyDrivingCategory | 'all')}
                className="w-full appearance-none rounded-xl border border-[#0D1B3E]/12 bg-white px-3 py-3 pr-9 font-serif text-sm font-medium text-[#0D1B3E] outline-none transition-colors focus:border-[#0D1B3E]/40"
              >
                {RESIDENCY_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
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
        </section>

        <section aria-labelledby="matrix-heading" className="mb-12">
          <h2
            id="matrix-heading"
            className="mb-6 font-serif text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl"
          >
            Matrice des Droits de Conduite
          </h2>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#0D1B3E]" />
            </div>
          ) : matrixColumns.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#0D1B3E]/20 bg-white/60 p-10 text-center">
              <p className="font-serif text-base text-[#0D1B3E]/75">
                Aucun pays ne correspond à ce profil de résidence. Élargissez le filtre ou cherchez
                un pays directement.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#0D1B3E]/10 bg-white shadow-sm">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#0D1B3E]/10">
                    <th
                      scope="col"
                      className="w-56 px-4 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55"
                    >
                      Critère
                    </th>
                    {matrixColumns.map((col) => (
                      <th key={col.id} scope="col" className="px-4 py-4">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/countries/${col.id}`}
                            className="font-serif text-lg font-black text-[#0D1B3E] underline-offset-4 hover:underline"
                          >
                            {col.name}
                          </Link>
                          {matrixColumns.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => removeColumn(col.id)}
                              aria-label={`Retirer ${col.name}`}
                              className="rounded-md p-1 text-[#0D1B3E]/45 transition-colors hover:bg-[#FDFBF4] hover:text-[#0D1B3E]"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#0D1B3E]/10">
                    <th
                      scope="row"
                      className="px-4 py-5 text-left font-serif text-[11px] font-black uppercase tracking-[0.18em] text-[#0D1B3E]/55"
                    >
                      Validité Permis National
                    </th>
                    {matrixColumns.map((col) => (
                      <MatrixCell key={col.id}>{durationForResidency(col.intel, residency)}</MatrixCell>
                    ))}
                  </tr>
                  <tr className="border-b border-[#0D1B3E]/10">
                    <th
                      scope="row"
                      className="px-4 py-5 text-left font-serif text-[11px] font-black uppercase tracking-[0.18em] text-[#0D1B3E]/55"
                    >
                      Permis International (IDP) Requis
                    </th>
                    {matrixColumns.map((col) => {
                      const idp = idpLabel(col.intel)
                      return (
                        <MatrixCell key={col.id} tone={idp.tone}>
                          {idp.label}
                        </MatrixCell>
                      )
                    })}
                  </tr>
                  <tr className="border-b border-[#0D1B3E]/10">
                    <th
                      scope="row"
                      className="px-4 py-5 text-left font-serif text-[11px] font-black uppercase tracking-[0.18em] text-[#0D1B3E]/55"
                    >
                      Échange de Permis
                    </th>
                    {matrixColumns.map((col) => (
                      <MatrixCell key={col.id}>{exchangeLabel(col.intel)}</MatrixCell>
                    ))}
                  </tr>
                  <tr>
                    <th
                      scope="row"
                      className="px-4 py-5 text-left font-serif text-[11px] font-black uppercase tracking-[0.18em] text-[#0D1B3E]/55"
                    >
                      Délai de Conversion
                    </th>
                    {matrixColumns.map((col) => (
                      <MatrixCell key={col.id}>{conversionDeadlineLabel(col.intel)}</MatrixCell>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {!loading && remainingCount > 0 ? (
            <p className="mt-4 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
              + {remainingCount} {remainingCount > 1 ? 'autres pays disponibles' : 'autre pays disponible'} — affinez la recherche pour les ajouter à la matrice (max {MAX_MATRIX_COLUMNS}).
            </p>
          ) : null}
        </section>

        <GoogleAd slot="permis_bottom" />
      </div>
    </div>
  )
}

export default function PermisPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFBF4]">
          <div className="flex justify-center p-20">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#0D1B3E]" />
          </div>
        </div>
      }
    >
      <PermisPageInner />
    </Suspense>
  )
}
