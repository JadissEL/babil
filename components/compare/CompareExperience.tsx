'use client'

import { ArrowLeft, ChevronRight, Share2 } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CompareExperienceSkeleton } from '@/components/compare/CompareExperienceSkeleton'
import { ComparePrismHeader } from '@/components/compare/ComparePrismHeader'
import { CompareStickyBar } from '@/components/compare/CompareStickyBar'
import { CompareTable } from '@/components/compare/CompareTable'
import { CountryComparePicker, type CountryOption } from '@/components/compare/CountryComparePicker'
import { useObjectivePreferenceOptional } from '@/components/objectives/ObjectivePreferenceProvider'
import { Button } from '@/components/ui/button'
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
import { enrichedToCompareRow } from '@/lib/compare-rows'
import { normalizeCountriesApiListResponse } from '@/lib/country-full-data-materialize'
import { ctaCompareHref, ctaExploreHref } from '@/lib/cta-hrefs'
import { enrichCountryApiRecord } from '@/lib/enrich-country-api'
import type { EnrichedCountryApi } from '@/lib/enrich-country-api'
import {
  matchesExplorerRegionFilter,
  matchesExplorerSchengenOnlyToggle,
  parseExplorerRegionFilter,
  type ExplorerRegionFilter,
} from '@/lib/explorer-filters'
import { appToast } from '@/lib/toast-store'
import { userObjectiveSlugToCompareObjectiveId } from '@/lib/user-objectives/compare-bridge'
import { cn } from '@/lib/utils'

const MAX = 4

type Step = 'category' | 'objective' | 'countries'
type SuggestionPoolSource = 'all' | 'filtered' | 'fallback'

function parseValidCompareObjectiveParam(raw: string | null | undefined): CompareObjectiveId | null {
  const o = raw?.trim()
  if (!o || !(o in COMPARE_OBJECTIVES)) return null
  return o as CompareObjectiveId
}

function parseCompareCountryParam(raw: string | null, max: number): number[] {
  if (!raw?.trim()) return []
  return raw
    .split(/[,\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n))
    .slice(0, max)
}

function stepIndex(s: Step): number {
  return s === 'category' ? 0 : s === 'objective' ? 1 : 2
}

export function CompareExperience() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const objectivePref = useObjectivePreferenceOptional()
  const didInitialStepHydrate = useRef(false)

  const [raw, setRaw] = useState<Record<string, unknown>[]>([])
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  const objectiveParam = searchParams?.get('objective')
  const objective = useMemo(() => getObjectiveDefinition(objectiveParam), [objectiveParam])

  const emptyTableExploreHref = useMemo(
    () => ctaExploreHref(objectivePref?.ready ? objectivePref.preference.primarySlug : null),
    [objectivePref?.ready, objectivePref?.preference.primarySlug],
  )
  const emptyTableCompareHref = useMemo(
    () => ctaCompareHref(objectivePref?.ready ? objectivePref.preference.primarySlug : null),
    [objectivePref?.ready, objectivePref?.preference.primarySlug],
  )

  const [step, setStep] = useState<Step>('category')
  const [categoryId, setCategoryId] = useState<CompareCategoryId | null>(null)

  useEffect(() => {
    fetch('/api/countries')
      .then((r) => r.json())
      .then((d) => setRaw(normalizeCountriesApiListResponse(d)))
      .catch(() => setRaw([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!searchParams) return

    const ids = parseCompareCountryParam(searchParams.get('countries'), MAX)
    if (ids.length) setSelectedIds(ids)

    if (didInitialStepHydrate.current) return

    const urlObj = parseValidCompareObjectiveParam(searchParams.get('objective'))
    const prefReady = objectivePref?.ready === true
    const prefObj =
      !urlObj && objectivePref?.preference.primarySlug
        ? userObjectiveSlugToCompareObjectiveId(objectivePref.preference.primarySlug)
        : null

    if (!urlObj && !prefReady) return

    const effective = urlObj ?? prefObj
    if (!effective) return

    didInitialStepHydrate.current = true

    const def = COMPARE_OBJECTIVES[effective]
    setCategoryId(def.categoryId)

    const hasCountries = parseCompareCountryParam(searchParams.get('countries'), MAX).length > 0

    if (urlObj && hasCountries) {
      setStep('countries')
    } else {
      setStep('objective')
    }

    if (!urlObj && prefObj && searchParams.get('objective') !== prefObj) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('objective', prefObj)
      const path = pathname ?? '/compare'
      const qs = params.toString()
      router.replace(qs ? `${path}?${qs}` : path, { scroll: false })
    }
  }, [searchParams, objectivePref?.ready, objectivePref?.preference.primarySlug, pathname, router])

  const goToCategoryStep = useCallback(() => {
    didInitialStepHydrate.current = false
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

  const selectedEnriched = useMemo(() => {
    return selectedIds.map((id) => byId.get(id)).filter(Boolean) as EnrichedCountryApi[]
  }, [selectedIds, byId])

  const rows = useMemo(() => {
    return selectedEnriched.map((c) => enrichedToCompareRow(c, objective))
  }, [selectedEnriched, objective])

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

  const prismChrome = step === 'countries'

  return (
    <div className="min-w-0 space-y-8 pb-[max(6rem,calc(4rem+env(safe-area-inset-bottom,0px)))] sm:space-y-10">
      <ComparePrismHeader step={step} objective={objective} />

      <nav
        aria-label="Étapes"
        className={cn(
          'flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-widest sm:gap-3',
          prismChrome ? 'text-[#0D1B3E]/55' : 'text-muted',
        )}
      >
        {(['category', 'objective', 'countries'] as const).map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            {i > 0 ? (
              <ChevronRight className={cn('h-3 w-3', prismChrome ? 'text-[#0D1B3E]/35' : 'opacity-50')} aria-hidden />
            ) : null}
            <span
              className={cn(
                'rounded-full px-3 py-1',
                stepIndex(step) >= i
                  ? prismChrome
                    ? 'bg-[#0D1B3E] text-white'
                    : 'bg-primary text-white'
                  : prismChrome
                    ? 'border border-[#0D1B3E]/15 bg-white text-[#0D1B3E]/75'
                    : 'bg-inset text-muted',
              )}
            >
              {i + 1}. {s === 'category' ? 'Domaine' : s === 'objective' ? 'Objectif' : 'Pays & résultats'}
            </span>
          </span>
        ))}
      </nav>

      {step === 'category' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-[#0D1B3E] sm:text-xl">1. Quel est votre domaine ?</h2>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COMPARE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategoryId(cat.id)
                  setStep('objective')
                }}
                className="rounded-2xl border border-[#0D1B3E]/10 bg-white p-4 text-left shadow-md transition-all hover:border-[#0D1B3E]/25 hover:bg-[#FDFBF4] sm:p-5"
              >
                <span className="text-base font-black text-[#0D1B3E] sm:text-lg">{cat.label}</span>
                <p className="mt-2 text-sm font-medium text-[#0D1B3E]/65">{cat.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#0D1B3E]">
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
            <h2 className="text-lg font-black text-[#0D1B3E] sm:text-xl">2. Précisez votre objectif</h2>
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            {objectivesInCategory.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => commitObjective(o.id)}
                className={cn(
                  'rounded-2xl border border-[#0D1B3E]/10 bg-white p-4 text-left shadow-md transition-all hover:border-[#0D1B3E]/25 sm:p-5',
                  objective.id === o.id && 'ring-2 ring-[#0D1B3E]',
                )}
              >
                <span className="text-base font-black text-[#0D1B3E]">{o.label}</span>
                <p className="mt-2 text-sm font-medium text-[#0D1B3E]/65">{o.description}</p>
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
                <span className="rounded-full border border-[#0D1B3E]/15 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#0D1B3E]">
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
              <h2 className="text-lg font-black text-[#0D1B3E] sm:text-xl">3. Choisissez les pays</h2>
              <p className="max-w-2xl text-sm font-medium text-[#0D1B3E]/70">{objective.description}</p>
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
              <h3 className="text-base font-bold text-[#0D1B3E] sm:text-lg">Tableau comparatif</h3>
              <CompareTable
                variant="prism"
                enrichedCountries={selectedEnriched}
                rows={rows}
                winnerId={winnerId}
                objectiveLabel={objective.label}
                objectiveShortLabel={objective.shortLabel}
                scoringRationale={objective.scoringRationale}
                recommendation={recommendation}
                emptyExploreHref={emptyTableExploreHref}
                emptyCompareHref={emptyTableCompareHref}
              />
            </div>
          </div>
        </div>
      )}

      <CompareStickyBar
        names={names}
        max={MAX}
        objectiveShortLabel={step === 'countries' ? objective.shortLabel : undefined}
        variant={step === 'countries' ? 'prism' : 'default'}
        onClear={() => setSelectedIds([])}
        onScrollToTable={scrollToTable}
      />
    </div>
  )
}
