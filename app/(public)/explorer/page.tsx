'use client'

import { Search, SlidersHorizontal, Target, Scale } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import CountryGrid from '@/components/country/CountryGrid'
import { ExplorerRegionScoreStrip } from '@/components/explorer/ExplorerRegionScoreStrip'
import { FilterBar } from '@/components/filters/FilterBar'
import GoogleAd from '@/components/GoogleAd'
import { useObjectivePreferenceOptional } from '@/components/objectives/ObjectivePreferenceProvider'
import {
  frictionTierFromCountry,
  isoForCountryName,
  scoreToMobilityTier,
} from '@/lib/country-card-mappers'
import {
  normalizeCountriesApiListResponse,
  type CountryApiListRow,
} from '@/lib/country-full-data-materialize'
import { enrichCountryApiRecord, type EnrichedCountryApi } from '@/lib/enrich-country-api'
import { atlasCategoryLabel, atlasVisaDelayDays, explorerRegionToAtlasScoreBucketKey } from '@/lib/explorer-atlas-ui'
import {
  explorerRegionToFilterBarValue,
  explorerRegionToUrlParam,
  matchesExplorerRegionFilter,
  matchesExplorerSchengenOnlyToggle,
  parseExplorerRegionFilter,
  type ExplorerRegionFilter,
} from '@/lib/explorer-filters'
import { compareHrefForExplorerPageState } from '@/lib/explorer-goal-to-compare-objective'
import { buildExplorerRegionScoreBuckets } from '@/lib/explorer-region-score-buckets'
import {
  buildExplorerQueryStringFromSaved,
  clearExplorerSavedFilters,
  EXPLORER_SAVED_FILTERS_STORAGE_KEY,
  readExplorerSavedFilters,
  writeExplorerSavedFilters,
} from '@/lib/explorer-saved-filters'
import { markExplorerOnboardingEngaged } from '@/lib/onboarding-storage'
import { appToast } from '@/lib/toast-store'
import { explorerFilterGoalFromObjectiveSlug } from '@/lib/user-objectives/explorer-filter-goal'

type Mode = 'explorer' | 'recommendation'
type Goal = 'all' | 'tourism' | 'study' | 'work' | 'business' | 'education' | 'short_course'
type Budget = 'all' | 'low' | 'medium' | 'high'

function filterGoalFromSelect(v: string): Goal {
  if (!v || v === 'all') return 'all'
  const normalized = v.trim().toLowerCase().replace(/-/g, '_')
  const allowed: Exclude<Goal, 'all'>[] = [
    'tourism',
    'study',
    'work',
    'business',
    'education',
    'short_course',
  ]
  return (allowed.includes(normalized as Exclude<Goal, 'all'>) ? normalized : 'all') as Goal
}

function explorerGoalToFilterValue(goal: Goal): string {
  return goal === 'all' ? 'all' : goal
}

function isBudgetParam(v: string | null): v is Exclude<Budget, 'all'> {
  return v === 'low' || v === 'medium' || v === 'high'
}

type UrlCommitSlice = Partial<{
  search: string
  region: ExplorerRegionFilter
  difficulty: string
  goal: Goal
  budget: Budget
  schengenOnly: boolean
  mode: Mode
}>

function ExplorerPageInner() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const objectivePref = useObjectivePreferenceOptional()
  const [countries, setCountries] = useState<CountryApiListRow[]>([])
  const [mode, setMode] = useState<Mode>('explorer')
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState<ExplorerRegionFilter>('all')
  const [difficulty, setDifficulty] = useState('all')
  const [goal, setGoal] = useState<Goal>('all')
  const [budget, setBudget] = useState<Budget>('all')
  const [schengenOnly, setSchengenOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasSavedView, setHasSavedView] = useState(false)

  useEffect(() => {
    setHasSavedView(Boolean(readExplorerSavedFilters()))
  }, [])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === EXPLORER_SAVED_FILTERS_STORAGE_KEY || e.key === null) {
        setHasSavedView(Boolean(readExplorerSavedFilters()))
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const commitExplorerUrl = useCallback(
    (patch: UrlCommitSlice = {}) => {
      const s = patch.search ?? search
      const r = patch.region ?? region
      const d = patch.difficulty ?? difficulty
      const g = patch.goal ?? goal
      const b = patch.budget ?? budget
      const sch = patch.schengenOnly ?? schengenOnly
      const m = patch.mode ?? mode

      const params = new URLSearchParams()
      if (s.trim()) params.set('q', s.trim())
      if (r !== 'all') params.set('region', explorerRegionToUrlParam(r))
      params.set('goal', g)
      if (b !== 'all') params.set('budget', b)
      if (d !== 'all' && ['Low', 'Medium', 'High', 'Extreme'].includes(d)) params.set('difficulty', d)
      if (sch) params.set('schengen', '1')
      if (m === 'recommendation') params.set('mode', 'recommendation')
      const qs = params.toString()
      const basePath = pathname ?? '/explorer'
      router.replace(qs ? `${basePath}?${qs}` : basePath, { scroll: false })
      markExplorerOnboardingEngaged()
    },
    [search, region, difficulty, goal, budget, schengenOnly, mode, pathname, router],
  )

  /** URL = source de vérité après navigation ou lien externe ; réinitialise tout ce qui n’est pas dans la query. */
  useEffect(() => {
    if (!searchParams) return

    const qRaw = searchParams.get('q') ?? searchParams.get('search')
    let qDecoded = ''
    try {
      qDecoded = decodeURIComponent(qRaw ?? '').trim()
    } catch {
      qDecoded = String(qRaw ?? '').trim()
    }
    setSearch(qDecoded)

    const reg = searchParams.get('region')
    setRegion(reg?.trim() ? parseExplorerRegionFilter(reg.trim()) : 'all')

    const goalParam = searchParams.get('goal')
    if (goalParam != null && String(goalParam).trim() !== '') {
      setGoal(filterGoalFromSelect(String(goalParam).trim().toLowerCase()))
    } else if (objectivePref?.ready) {
      setGoal(explorerFilterGoalFromObjectiveSlug(objectivePref.preference.primarySlug))
    } else {
      setGoal('all')
    }

    const bud = searchParams.get('budget')
    setBudget(isBudgetParam(bud) ? bud : 'all')

    const diff = searchParams.get('difficulty')
    setDifficulty(diff && ['Low', 'Medium', 'High', 'Extreme'].includes(diff) ? diff : 'all')

    const sch = searchParams.get('schengen')
    setSchengenOnly(sch === '1' || sch === 'true' || sch === 'yes')

    const modeParam = searchParams.get('mode')
    setMode(modeParam === 'recommendation' ? 'recommendation' : 'explorer')
  }, [searchParams, objectivePref?.ready, objectivePref?.preference.primarySlug])

  /** Liens partagés avec filtres / recherche = parcours explorateur utile sans clic supplémentaire. */
  useEffect(() => {
    if (!searchParams) return
    const qRaw = searchParams.get('q') ?? searchParams.get('search')
    let qDecoded = ''
    try {
      qDecoded = decodeURIComponent(qRaw ?? '').trim()
    } catch {
      qDecoded = String(qRaw ?? '').trim()
    }
    const bud = searchParams.get('budget')
    const sch = searchParams.get('schengen')
    const engaged =
      qDecoded.length > 0 ||
      Boolean(searchParams.get('region')?.trim()) ||
      Boolean(searchParams.get('goal')?.trim()) ||
      isBudgetParam(bud) ||
      Boolean(searchParams.get('difficulty')?.trim()) ||
      sch === '1' ||
      sch === 'true' ||
      sch === 'yes' ||
      searchParams.get('mode') === 'recommendation'
    if (engaged) markExplorerOnboardingEngaged()
  }, [searchParams])

  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => setCountries(normalizeCountriesApiListResponse(data)))
      .catch(() => setCountries([]))
      .finally(() => setLoading(false))
  }, [])

  const normalized = useMemo(
    () => countries.map((c) => enrichCountryApiRecord(c)),
    [countries],
  )

  const regionBuckets = useMemo(
    () =>
      buildExplorerRegionScoreBuckets(
        normalized.map((c: { name?: unknown; region?: unknown; _finalScore?: unknown }) => ({
          name: String(c.name ?? ''),
          region: String(c.region ?? ''),
          _finalScore: Number(c._finalScore ?? 0),
        })),
      ),
    [normalized],
  )

  const atlasActiveBucketKey = useMemo(() => explorerRegionToAtlasScoreBucketKey(region), [region])

  const filtered = normalized
    .filter((c: EnrichedCountryApi) => {
      const nameStr = String(c.name ?? '')
      const matchesSearch = nameStr.toLowerCase().includes(search.toLowerCase())
      const matchesRegion = matchesExplorerRegionFilter(region, {
        name: nameStr,
        region: String(c.region ?? ''),
      })
      const matchesDifficulty = difficulty === 'all' || String(c._difficultyLabel).toLowerCase() === difficulty.toLowerCase()
      const eduMob = c._full?.education_mobility
      const hasShortCourseModule =
        eduMob &&
        typeof eduMob === 'object' &&
        eduMob !== null &&
        Object.prototype.hasOwnProperty.call(eduMob, 'short_courses') &&
        !!(eduMob as Record<string, unknown>).short_courses
      const matchesGoal =
        goal === 'all' ||
        (goal === 'tourism' && c._visa.tourism >= 50) ||
        (goal === 'study' && c._visa.study >= 50) ||
        (goal === 'work' && c._visa.work >= 50) ||
        (goal === 'business' && c._visa.business >= 50) ||
        (goal === 'education' && c._education >= 50) ||
        (goal === 'short_course' && (hasShortCourseModule || c._visa.study >= 50 || c._education >= 50))
      const matchesBudget = budget === 'all' || c._budgetLevel === budget
      const matchesSchengen = matchesExplorerSchengenOnlyToggle(schengenOnly, { name: nameStr })
      return matchesSearch && matchesRegion && matchesDifficulty && matchesGoal && matchesBudget && matchesSchengen
    })
    .sort((a: EnrichedCountryApi, b: EnrichedCountryApi) =>
      mode === 'recommendation' ? b._finalScore - a._finalScore : a.name.localeCompare(b.name)
    )

  const gridCountries = filtered.map((c: EnrichedCountryApi) => ({
    id: String(c.id),
    name: c.name,
    code: isoForCountryName(c.name),
    score: c._finalScore,
    visaScore: Math.round((c._visa.tourism + c._visa.study + c._visa.work + c._visa.business) / 4),
    friction: frictionTierFromCountry(c._difficultyLabel, c._full?.friction_score),
    study: scoreToMobilityTier(c._visa.study),
    business: scoreToMobilityTier(c._visa.business),
    highlightPlace: c._highlightPlace ?? undefined,
    highlightImageUrl: c._highlightImageUrl ?? undefined,
    atlasCategoryLabel: atlasCategoryLabel(c.name, c.region),
    atlasVisaDelayDays: atlasVisaDelayDays(c._full, c.id),
  }))

  return (
    <div className="min-h-screen bg-[#FDFBF4]">
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-10 pb-12 sm:px-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65">ATLAS GLOBAL</p>
            <h1 className="mt-1 text-4xl font-black tracking-tight text-[#0D1B3E] md:text-5xl">Explorer</h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-[#0D1B3E]/70">
              Intelligence terrain et mobilité — filtrez et ouvrez une fiche pays. Lien partageable :{' '}
              <code className="rounded-md border border-[#0D1B3E]/15 bg-white px-1.5 py-0.5 text-[11px] font-bold text-[#0D1B3E]">
                /explorer?q=nom
              </code>
              .
            </p>
          </div>
          <div className="relative w-full shrink-0 lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0D1B3E]/45" />
            <input
              type="search"
              placeholder="Rechercher une destination…"
              className="w-full rounded-2xl border border-[#0D1B3E]/12 bg-white py-3 pl-10 pr-4 text-sm font-medium text-[#0D1B3E] outline-none placeholder:text-[#0D1B3E]/40 focus:ring-2 focus:ring-[#0D1B3E]/25"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => commitExplorerUrl()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitExplorerUrl()
              }}
              aria-label="Rechercher une destination"
            />
          </div>
        </header>

        <div className="sticky top-16 z-30 space-y-4 rounded-2xl border border-[#0D1B3E]/10 bg-white/95 p-4 shadow-lg backdrop-blur-md">
          <div className="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-center">
            <FilterBar
              className="mb-0 min-w-0 flex-1 border-0 bg-transparent p-0 shadow-none"
              goalValue={explorerGoalToFilterValue(goal)}
              regionValue={explorerRegionToFilterBarValue(region)}
              onGoalChange={(v) => {
                const g = filterGoalFromSelect(v)
                setGoal(g)
                commitExplorerUrl({ goal: g })
              }}
              onRegionChange={(v) => {
                const nextR = parseExplorerRegionFilter(v)
                setRegion(nextR)
                commitExplorerUrl({ region: nextR })
              }}
            />
            <label className="inline-flex cursor-pointer items-center gap-3 self-stretch rounded-2xl border border-[#0D1B3E]/12 bg-[#FDFBF4] px-4 py-3 xl:self-center">
              <span className="text-[10px] font-black tracking-[0.18em] text-[#0D1B3E]">SCHENGEN ONLY</span>
              <input
                type="checkbox"
                className="size-5 shrink-0 rounded border-[#0D1B3E]/30 text-[#0D1B3E] accent-[#0D1B3E]"
                checked={schengenOnly}
                onChange={(e) => {
                  const checked = e.target.checked
                  setSchengenOnly(checked)
                  commitExplorerUrl({ schengenOnly: checked })
                }}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-[#0D1B3E]/10 pt-4">
            <div className="inline-flex rounded-2xl border border-[#0D1B3E]/10 bg-[#FDFBF4] p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('explorer')
                  commitExplorerUrl({ mode: 'explorer' })
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider ${mode === 'explorer' ? 'bg-[#0D1B3E] text-white shadow-md' : 'text-[#0D1B3E]/70 hover:text-[#0D1B3E]'}`}
              >
                <SlidersHorizontal className="h-4 w-4" /> Liste
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('recommendation')
                  commitExplorerUrl({ mode: 'recommendation' })
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider ${mode === 'recommendation' ? 'bg-[#0D1B3E] text-white shadow-md' : 'text-[#0D1B3E]/70 hover:text-[#0D1B3E]'}`}
              >
                <Target className="h-4 w-4" /> Recommandation
              </button>
            </div>

            <Link
              href={compareHrefForExplorerPageState({
                goal,
                budget,
                region,
                difficulty,
                schengenOnly,
              })}
              onClick={() => markExplorerOnboardingEngaged()}
              className="inline-flex items-center gap-2 rounded-xl border border-[#0D1B3E]/20 bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-[#0D1B3E] transition-colors hover:border-[#0D1B3E]/35 hover:bg-[#FDFBF4]"
            >
              <Scale className="h-4 w-4 shrink-0" aria-hidden />
              Comparer
            </Link>

            <select
              className="rounded-xl border border-[#0D1B3E]/12 bg-white px-3 py-2.5 text-sm font-bold text-[#0D1B3E] outline-none"
              value={difficulty}
              onChange={(e) => {
                const v = e.target.value
                setDifficulty(v)
                commitExplorerUrl({ difficulty: v })
              }}
              aria-label="Difficulté"
            >
              <option value="all">Difficulté : toutes</option>
              <option value="Low">Facile</option>
              <option value="Medium">Moyenne</option>
              <option value="High">Difficile</option>
              <option value="Extreme">Critique</option>
            </select>

            <select
              className="rounded-xl border border-[#0D1B3E]/12 bg-white px-3 py-2.5 text-sm font-bold text-[#0D1B3E] outline-none"
              value={budget}
              onChange={(e) => {
                const v = e.target.value as Budget
                setBudget(v)
                commitExplorerUrl({ budget: v })
              }}
              aria-label="Budget"
            >
              <option value="all">Budget : tous</option>
              <option value="low">Bas</option>
              <option value="medium">Moyen</option>
              <option value="high">Élevé</option>
            </select>

            <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  writeExplorerSavedFilters({
                    q: search,
                    region: region === 'all' ? '' : explorerRegionToUrlParam(region),
                    goal,
                    budget,
                    difficulty,
                    schengenOnly,
                    mode,
                  })
                  setHasSavedView(true)
                  appToast.success('Vue enregistrée — vous pourrez la rouvrir d’un clic.')
                }}
                className="rounded-xl border border-[#0D1B3E]/12 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#0D1B3E] transition-colors hover:border-[#0D1B3E]/25 hover:bg-[#FDFBF4]"
              >
                Mémoriser la vue
              </button>
              <button
                type="button"
                disabled={!hasSavedView}
                onClick={() => {
                  const s = readExplorerSavedFilters()
                  if (!s) {
                    appToast.info('Aucune vue enregistrée.')
                    return
                  }
                  const qs = buildExplorerQueryStringFromSaved(s)
                  const path = pathname ?? '/explorer'
                  router.replace(qs ? `${path}?${qs}` : path)
                  markExplorerOnboardingEngaged()
                  appToast.success('Vue restaurée.')
                }}
                className="rounded-xl border border-[#0D1B3E]/20 bg-[#FDFBF4] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#0D1B3E] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                Restaurer
              </button>
              <button
                type="button"
                disabled={!hasSavedView}
                onClick={() => {
                  clearExplorerSavedFilters()
                  setHasSavedView(false)
                  appToast.info('Mémorisation supprimée.')
                }}
                className="rounded-xl border border-[#0D1B3E]/10 bg-transparent px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#0D1B3E]/60 transition-colors hover:text-[#0D1B3E] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Oublier
              </button>
            </div>
          </div>
        </div>

        {!loading ? (
          <p className="text-sm font-semibold text-[#0D1B3E]" aria-live="polite">
            {filtered.length} pays correspondent à vos critères
          </p>
        ) : null}

        {!loading ? (
          <ExplorerRegionScoreStrip
            variant="atlas"
            buckets={regionBuckets}
            activeBucketKey={atlasActiveBucketKey}
          />
        ) : null}

        <GoogleAd slot="explorer_top" />

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#0D1B3E]/20 border-t-[#0D1B3E]" />
          </div>
        ) : gridCountries.length === 0 ? (
          <div className="rounded-2xl border border-[#0D1B3E]/10 bg-white p-12 text-center text-[#0D1B3E]/70">
            <p className="text-sm font-medium">Aucun pays ne correspond à ces filtres.</p>
          </div>
        ) : (
          <div className="space-y-12">
            <CountryGrid
              cardVariant="atlas"
              countries={gridCountries}
              onCountryNavigate={markExplorerOnboardingEngaged}
            />

            <div className="flex justify-center py-8">
              <GoogleAd slot="explorer_bottom" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ExplorerPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex max-w-7xl justify-center px-6 py-24 sm:px-8">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" aria-label="Chargement" />
        </div>
      }
    >
      <ExplorerPageInner />
    </Suspense>
  )
}
