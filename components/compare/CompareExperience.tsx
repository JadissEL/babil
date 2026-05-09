'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ChevronRight, Scale, Share2 } from 'lucide-react'

import { CompareStickyBar } from '@/components/compare/CompareStickyBar'
import { CompareExperienceSkeleton } from '@/components/compare/CompareExperienceSkeleton'
import { CompareTable } from '@/components/compare/CompareTable'
import { CountryComparePicker, type CountryOption } from '@/components/compare/CountryComparePicker'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { enrichedToCompareRow } from '@/lib/compare-rows'
import {
  COMPARE_CATEGORIES,
  COMPARE_OBJECTIVES,
  type CompareCategoryId,
  type CompareObjectiveId,
  getObjectiveDefinition,
  listObjectivesForCategory,
  pickSuggestedCountryIds,
  recommendationForWinner,
} from '@/lib/compare-objectives'
import { normalizeCountriesApiListResponse } from '@/lib/country-full-data-materialize'
import { enrichCountryApiRecord } from '@/lib/enrich-country-api'
import type { EnrichedCountryApi } from '@/lib/enrich-country-api'
import { appToast } from '@/lib/toast-store'
import {
  matchesExplorerRegionFilter,
  matchesExplorerSchengenOnlyToggle,
  parseExplorerRegionFilter,
  type ExplorerRegionFilter,
} from '@/lib/explorer-filters'

const MAX = 4

type Step = 'category' | 'objective' | 'countries'
type SuggestionPoolSource = 'all' | 'filtered' | 'fallback'

function stepIndex(s: Step): number {
  return s === 'category' ? 0 : s === 'objective' ? 1 : 2
}

export function CompareExperience() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [raw, setRaw] = useState<Record<string, unknown>[]>([])
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  const objectiveParam = searchParams?.get('objective')
  const objective = useMemo(() => getObjectiveDefinition(objectiveParam), [objectiveParam])

  const [step, setStep] = useState<Step>('category')
  const [categoryId, setCategoryId] = useState<CompareCategoryId | null>(null)
  const hydratedFromUrl = useRef(false)

  useEffect(() => {
    fetch('/api/countries')
      .then((r) => r.json())
      .then((d) => setRaw(normalizeCountriesApiListResponse(d)))
      .catch(() => setRaw([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!searchParams) return
    if (!hydratedFromUrl.current) {
      hydratedFromUrl.current = true
      const o = searchParams.get('objective')
      if (o && o in COMPARE_OBJECTIVES) {
        const def = COMPARE_OBJECTIVES[o as CompareObjectiveId]
        setCategoryId(def.categoryId)
        setStep('countries')
      }
    }
    const c = searchParams.get('countries')
    if (c) {
      const ids = c
        .split(/[,\s]+/)
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n))
      if (ids.length) setSelectedIds(ids.slice(0, MAX))
    }
  }, [searchParams])

  const goToCategoryStep = useCallback(() => {
    setStep('category')
    setCategoryId(null)
    setSelectedIds([])
    router.replace(pathname ?? '/compare', { scroll: false })
  }, [pathname, router])

  const objectiveIdRef = useRef<string | null>(null)
  useEffect(() => {
    const id = objective.id
    if (objectiveIdRef.current === null) {
      objectiveIdRef.current = id
      return
    }
    if (objectiveIdRef.current !== id) {
      setSelectedIds([])
      objectiveIdRef.current = id
    }
  }, [objective.id])

  const enriched = useMemo(
    () => raw.map((c) => enrichCountryApiRecord(c)),
    [raw],
  )

  const compareExplorerContext = useMemo(() => {
    const r = searchParams?.get('region')
    const regionFilter: ExplorerRegionFilter = r?.trim() ? parseExplorerRegionFilter(r.trim()) : 'all'
    const bud = searchParams?.get('budget')
    const budget = bud === 'low' || bud === 'medium' || bud === 'high' ? bud : 'all'
    const diff = searchParams?.get('difficulty')
    const difficulty =
      diff && ['Low', 'Medium', 'High', 'Extreme'].includes(diff) ? diff : 'all'
    const sch = searchParams?.get('schengen')
    const schengenOnly = sch === '1' || sch === 'true' || sch === 'yes'
    return { regionFilter, budget, difficulty, schengenOnly }
  }, [searchParams])

  const { suggestionPool, suggestionPoolSource } = useMemo((): {
    suggestionPool: EnrichedCountryApi[]
    suggestionPoolSource: SuggestionPoolSource
  } => {
    const { regionFilter, budget, difficulty, schengenOnly } = compareExplorerContext
    const hasConstraint =
      regionFilter !== 'all' || budget !== 'all' || difficulty !== 'all' || schengenOnly
    if (!hasConstraint) return { suggestionPool: enriched, suggestionPoolSource: 'all' }
    const filtered = enriched.filter((c) => {
      const name = String(c.name ?? '')
      const dbRegion = String(c.region ?? '')
      if (!matchesExplorerRegionFilter(regionFilter, { name, region: dbRegion })) return false
      if (!matchesExplorerSchengenOnlyToggle(schengenOnly, { name })) return false
      if (budget !== 'all' && c._budgetLevel !== budget) return false
      if (
        difficulty !== 'all' &&
        String(c._difficultyLabel).toLowerCase() !== difficulty.toLowerCase()
      )
        return false
      return true
    })
    if (filtered.length > 0) return { suggestionPool: filtered, suggestionPoolSource: 'filtered' }
    return { suggestionPool: enriched, suggestionPoolSource: 'fallback' }
  }, [enriched, compareExplorerContext])

  const options: CountryOption[] = useMemo(
    () => enriched.map((c) => ({ id: c.id, name: c.name })).sort((a, b) => a.name.localeCompare(b.name)),
    [enriched],
  )

  const byId = useMemo(() => {
    const m = new Map<number, EnrichedCountryApi>()
    enriched.forEach((c) => m.set(c.id, c))
    return m
  }, [enriched])

  const commitObjective = useCallback(
    (id: CompareObjectiveId) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '')
      params.set('objective', id)
      router.replace(`${pathname ?? '/compare'}?${params.toString()}`, { scroll: false })
      setStep('countries')
    },
    [pathname, router, searchParams],
  )

  const toggle = useCallback((id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX) return prev
      return [...prev, id]
    })
  }, [])

  const suggestionIds = useMemo(
    () => pickSuggestedCountryIds(suggestionPool, objective, MAX),
    [suggestionPool, objective],
  )

  const suggestionLabel = useMemo(() => {
    const n = Math.min(MAX, suggestionIds.length)
    let label = `Top ${n} pour « ${objective.shortLabel} »`
    if (suggestionPoolSource === 'filtered') label += ' — selon vos filtres'
    if (suggestionPoolSource === 'fallback') label += ' — filtres trop restrictifs, classement élargi'
    return label
  }, [suggestionIds.length, objective.shortLabel, suggestionPoolSource])

  const applySuggestions = useCallback(() => {
    const next: number[] = []
    for (const id of suggestionIds) {
      if (next.length >= MAX) break
      if (!next.includes(id)) next.push(id)
    }
    setSelectedIds(next)
  }, [suggestionIds])

  const rows = useMemo(() => {
    return selectedIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((c) => enrichedToCompareRow(c as EnrichedCountryApi, objective))
  }, [selectedIds, byId, objective])

  const winnerId = useMemo(() => {
    if (rows.length === 0) return null
    let best = rows[0]
    for (const r of rows) {
      if (r.composite > best.composite) best = r
    }
    return best.id
  }, [rows])

  const winnerName = winnerId != null ? rows.find((r) => r.id === winnerId)?.name : null
  const recommendation =
    rows.length >= 2 && winnerName ? recommendationForWinner(winnerName, objective) : null

  const names = useMemo(
    () => selectedIds.map((id) => options.find((o) => o.id === id)?.name).filter(Boolean) as string[],
    [selectedIds, options],
  )

  const scrollToTable = () => {
    document.getElementById('compare-table-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const buildCompareShareUrl = useCallback((): string => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set('objective', objective.id)
    if (selectedIds.length) params.set('countries', selectedIds.join(','))
    else params.delete('countries')
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    return `${base}${pathname ?? '/compare'}?${params.toString()}`
  }, [objective.id, pathname, searchParams, selectedIds])

  const shareOrCopyCompareLink = useCallback(async () => {
    const url = buildCompareShareUrl()
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'VisaFlow — Comparaison',
          text: `Objectif : ${objective.label}`,
          url,
        })
        appToast.success('Partage lancé.')
        return
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      appToast.success('Lien de comparaison copié.')
    } catch {
      appToast.error('Copie impossible — copiez l’URL depuis la barre d’adresse.')
    }
  }, [buildCompareShareUrl, objective.label])

  useEffect(() => {
    if (step !== 'countries') return
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set('objective', objective.id)
    if (selectedIds.length) params.set('countries', selectedIds.join(','))
    else params.delete('countries')
    const next = params.toString()
    const cur = searchParams?.toString() ?? ''
    if (next === cur) return
    const t = window.setTimeout(() => {
      router.replace(`${pathname ?? '/compare'}?${next}`, { scroll: false })
    }, 400)
    return () => window.clearTimeout(t)
  }, [step, objective.id, selectedIds, pathname, router, searchParams])

  const objectivesInCategory = categoryId ? listObjectivesForCategory(categoryId) : []

  if (loading) {
    return <CompareExperienceSkeleton />
  }

  return (
    <div className="min-w-0 space-y-8 pb-[max(9rem,calc(7.5rem+env(safe-area-inset-bottom,0px)))] sm:space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
          <div className="rounded-2xl bg-primary p-2.5 text-white shadow-soft sm:p-3">
            <Scale className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight text-text sm:text-3xl md:text-4xl">
              Comparer les pays
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-muted sm:text-[15px]">
              Choisissez d&apos;abord votre objectif : le score et les colonnes s&apos;adaptent. Puis jusqu&apos;à{' '}
              {MAX} pays.
            </p>
          </div>
        </div>
      </div>

      <nav
        aria-label="Étapes"
        className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-widest text-muted sm:gap-3"
      >
        {(['category', 'objective', 'countries'] as const).map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            {i > 0 ? <ChevronRight className="h-3 w-3 opacity-50" aria-hidden /> : null}
            <span
              className={cn(
                'rounded-full px-3 py-1',
                stepIndex(step) >= i ? 'bg-primary text-white' : 'bg-inset text-muted',
              )}
            >
              {i + 1}. {s === 'category' ? 'Domaine' : s === 'objective' ? 'Objectif' : 'Pays & résultats'}
            </span>
          </span>
        ))}
      </nav>

      {step === 'category' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-text sm:text-xl">1. Quel est votre domaine ?</h2>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COMPARE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategoryId(cat.id)
                  setStep('objective')
                }}
                className="rounded-2xl border border-line bg-surface p-4 text-left shadow-soft transition-all hover:border-primary/40 hover:bg-primary-soft/30 sm:p-5"
              >
                <span className="text-base font-black text-text sm:text-lg">{cat.label}</span>
                <p className="mt-2 text-sm font-medium text-muted">{cat.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  Continuer <ChevronRight className="h-3 w-3" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'objective' && categoryId && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" className="gap-1 text-sm" onClick={goToCategoryStep}>
              <ArrowLeft className="h-4 w-4" /> Domaine
            </Button>
            <h2 className="text-lg font-black text-text sm:text-xl">2. Précisez votre objectif</h2>
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            {objectivesInCategory.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => commitObjective(o.id)}
                className={cn(
                  'rounded-2xl border border-line bg-surface p-4 text-left shadow-soft transition-all hover:border-primary/40 sm:p-5',
                  objective.id === o.id && 'ring-2 ring-primary',
                )}
              >
                <span className="text-base font-black text-text">{o.label}</span>
                <p className="mt-2 text-sm font-medium text-muted">{o.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'countries' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1 text-sm"
                  onClick={() => {
                    setStep('objective')
                    if (objective.categoryId) setCategoryId(objective.categoryId)
                  }}
                >
                  <ArrowLeft className="h-4 w-4" /> Objectif
                </Button>
                <span className="rounded-full bg-primary-soft px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  {objective.shortLabel}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1 text-sm"
                  onClick={() => void shareOrCopyCompareLink()}
                  title="Partager (mobile) ou copier le lien dans le presse-papiers"
                >
                  <Share2 className="h-4 w-4" /> Partager le lien
                </Button>
              </div>
              <h2 className="text-lg font-black text-text sm:text-xl">3. Choisissez les pays</h2>
              <p className="max-w-2xl text-sm font-medium text-muted">{objective.description}</p>
            </div>
          </div>

          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-8">
            <CountryComparePicker
              options={options}
              selectedIds={selectedIds}
              max={MAX}
              search={search}
              onSearchChange={setSearch}
              onToggle={toggle}
              suggestionIds={suggestionIds}
              suggestionLabel={suggestionLabel}
              onAddSuggestions={applySuggestions}
            />
            <div className="min-w-0 space-y-3 sm:space-y-4">
              <h3 className="text-base font-bold text-text sm:text-lg">Tableau comparatif</h3>
              <CompareTable
                rows={rows}
                winnerId={winnerId}
                objectiveLabel={objective.label}
                scoringRationale={objective.scoringRationale}
                recommendation={recommendation}
              />
            </div>
          </div>
        </div>
      )}

      <CompareStickyBar
        names={names}
        max={MAX}
        objectiveShortLabel={step === 'countries' ? objective.shortLabel : undefined}
        onClear={() => setSelectedIds([])}
        onScrollToTable={scrollToTable}
      />
    </div>
  )
}
