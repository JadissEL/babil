'use client'

import { useUser } from '@clerk/nextjs'
import { Copy, Search, SlidersHorizontal, Target, Scale } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import CountryGrid from '@/components/country/CountryGrid'
import { ExplorerRegionScoreStrip } from '@/components/explorer/ExplorerRegionScoreStrip'
import { ExplorerFilterPanel } from '@/components/filters/ExplorerFilterPanel'
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
  parseExplorerRegionFilter,
  type ExplorerRegionFilter,
} from '@/lib/explorer-filters'
import {
  applyExplorerFiltersAndSort,
  buildExplorerQueryString,
  isExplorerBudget,
  parseObjectiveSlugParam,
  type ExplorerBudget,
  type ExplorerExplorerGoal,
  type ExplorerFilterState,
  type ExplorerFrictionBand,
} from '@/lib/explorer-filter-engine'
import { compareHrefForExplorerPageState } from '@/lib/explorer-goal-to-compare-objective'
import { ctaCompareHref, signInRedirectHref } from '@/lib/cta-hrefs'
import { buildExplorerRegionScoreBuckets } from '@/lib/explorer-region-score-buckets'
import {
  buildExplorerQueryStringFromSaved,
  clearExplorerSavedFilters,
  EXPLORER_SAVED_FILTERS_STORAGE_KEY,
  readExplorerSavedFilters,
  writeExplorerSavedFilters,
} from '@/lib/explorer-saved-filters'
import {
  NEXUS_FOCUS_VISIBLE,
  NEXUS_FOCUS_VISIBLE_ON_INK_SOLID,
  NEXUS_TRANSITION,
} from '@/lib/nexus-chrome'
import { markExplorerOnboardingEngaged } from '@/lib/onboarding-storage'
import { appToast } from '@/lib/toast-store'
import { explorerFilterGoalFromObjectiveSlug } from '@/lib/user-objectives/explorer-filter-goal'
import { getObjectiveBySlug, isUserObjectiveSlug } from '@/lib/user-objectives/registry'
import { cn } from '@/lib/utils'

const GOAL_FILTER_LABELS: Record<Exclude<Goal, 'all'>, string> = {
  tourism: 'Tourisme',
  study: 'Études longues',
  education: 'Éducation',
  work: 'Travail',
  business: 'Affaires',
  short_course: 'Formation courte',
}

type Mode = 'explorer' | 'recommendation'
type Goal = ExplorerExplorerGoal
type Budget = ExplorerBudget

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

type UrlCommitSlice = Partial<{
  search: string
  region: ExplorerRegionFilter
  difficulty: string
  friction: ExplorerFrictionBand
  goal: Goal
  budget: Budget
  schengenOnly: boolean
  mode: Mode
  objectiveSlug: string | null
}>

function ExplorerPageInner() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isSignedIn, isLoaded: userLoaded } = useUser()
  const isGuest = userLoaded && !isSignedIn
  const objectivePref = useObjectivePreferenceOptional()
  const [countries, setCountries] = useState<CountryApiListRow[]>([])
  const [mode, setMode] = useState<Mode>('explorer')
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState<ExplorerRegionFilter>('all')
  const [difficulty, setDifficulty] = useState('all')
  const [goal, setGoal] = useState<Goal>('all')
  const [budget, setBudget] = useState<Budget>('all')
  const [friction, setFriction] = useState<ExplorerFrictionBand>('all')
  const [objectiveSlug, setObjectiveSlug] = useState<string | null>(null)
  const [schengenOnly, setSchengenOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasSavedView, setHasSavedView] = useState(false)

  const lockedObjectiveSlug = useMemo(() => {
    if (!objectivePref?.ready || !objectivePref.preference.primarySlug) return null
    const s = objectivePref.preference.primarySlug
    return isUserObjectiveSlug(s) ? s : null
  }, [objectivePref?.ready, objectivePref?.preference.primarySlug])

  const lockedGoal = useMemo((): Exclude<Goal, 'all'> | null => {
    if (!lockedObjectiveSlug) return null
    const g = explorerFilterGoalFromObjectiveSlug(lockedObjectiveSlug)
    if (g === 'all') return null
    return g as Exclude<Goal, 'all'>
  }, [lockedObjectiveSlug])

  const goalLockedLabel = useMemo(() => {
    if (!lockedGoal) return undefined
    const def = getObjectiveBySlug(objectivePref?.preference.primarySlug)
    return def?.labelFr ?? GOAL_FILTER_LABELS[lockedGoal]
  }, [lockedGoal, objectivePref?.preference.primarySlug])

  const filterState = useMemo(
    (): ExplorerFilterState => ({
      objectiveSlug: lockedObjectiveSlug ?? parseObjectiveSlugParam(objectiveSlug ?? null),
      goal,
      region,
      budget,
      difficulty,
      friction,
      schengenOnly,
      q: search,
      mode,
    }),
    [
      lockedObjectiveSlug,
      objectiveSlug,
      goal,
      region,
      budget,
      difficulty,
      friction,
      schengenOnly,
      search,
      mode,
    ],
  )

  const compareProductHref = useMemo(() => {
    if (lockedObjectiveSlug) {
      return ctaCompareHref(lockedObjectiveSlug)
    }
    return compareHrefForExplorerPageState({
      goal,
      budget,
      region,
      difficulty,
      schengenOnly,
      objectiveSlug: parseObjectiveSlugParam(objectiveSlug),
      friction,
    })
  }, [
    lockedObjectiveSlug,
    goal,
    budget,
    region,
    difficulty,
    schengenOnly,
    objectiveSlug,
    friction,
  ])

  const compareLinkHref = useMemo(
    () => (isGuest ? signInRedirectHref(compareProductHref) : compareProductHref),
    [isGuest, compareProductHref],
  )

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
      const next: ExplorerFilterState = {
        objectiveSlug:
          patch.objectiveSlug !== undefined
            ? parseObjectiveSlugParam(patch.objectiveSlug)
            : lockedObjectiveSlug ?? parseObjectiveSlugParam(objectiveSlug),
        goal: patch.goal ?? goal,
        region: patch.region ?? region,
        budget: patch.budget ?? budget,
        difficulty: patch.difficulty ?? difficulty,
        friction: patch.friction ?? friction,
        schengenOnly: patch.schengenOnly ?? schengenOnly,
        q: patch.search ?? search,
        mode: patch.mode ?? mode,
      }
      const qs = buildExplorerQueryString(next)
      const basePath = pathname ?? '/explorer'
      router.replace(qs ? `${basePath}?${qs}` : basePath, { scroll: false })
      markExplorerOnboardingEngaged()
    },
    [
      search,
      region,
      difficulty,
      friction,
      goal,
      budget,
      schengenOnly,
      mode,
      pathname,
      router,
      lockedObjectiveSlug,
      objectiveSlug,
    ],
  )

  const copyExplorerShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      appToast.success('Lien copié — vous pouvez le coller pour partager cette vue.')
    } catch {
      appToast.error('Copie impossible. Copiez l’adresse depuis la barre du navigateur.')
    }
  }, [])

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

    if (lockedObjectiveSlug) {
      setObjectiveSlug(lockedObjectiveSlug)
      setGoal(lockedGoal ?? 'all')
      const urlObjective = searchParams.get('objective')?.trim()
      const urlGoal = searchParams.get('goal')?.trim().toLowerCase()
      if (
        (urlObjective && urlObjective !== lockedObjectiveSlug) ||
        (urlGoal && lockedGoal && urlGoal !== lockedGoal)
      ) {
        const params = new URLSearchParams(searchParams.toString())
        params.set('objective', lockedObjectiveSlug)
        if (lockedGoal) params.set('goal', lockedGoal)
        const basePath = pathname ?? '/explorer'
        const qs = params.toString()
        router.replace(qs ? `${basePath}?${qs}` : basePath, { scroll: false })
      }
    } else {
      const objParam = searchParams.get('objective')
      setObjectiveSlug(parseObjectiveSlugParam(objParam))
      const goalParam = searchParams.get('goal')
      if (goalParam != null && String(goalParam).trim() !== '') {
        setGoal(filterGoalFromSelect(String(goalParam).trim().toLowerCase()))
      } else if (objectivePref?.ready) {
        setGoal(explorerFilterGoalFromObjectiveSlug(objectivePref.preference.primarySlug) as Goal)
      } else {
        setGoal('all')
      }
    }

    const bud = searchParams.get('budget')
    setBudget(isExplorerBudget(bud) ? bud : 'all')

    const diff = searchParams.get('difficulty')
    setDifficulty(diff && ['Low', 'Medium', 'High', 'Extreme'].includes(diff) ? diff : 'all')

    const fr = searchParams.get('friction')
    setFriction(fr === 'low' || fr === 'medium' || fr === 'high' ? fr : 'all')

    const sch = searchParams.get('schengen')
    setSchengenOnly(sch === '1' || sch === 'true' || sch === 'yes')

    const modeParam = searchParams.get('mode')
    setMode(modeParam === 'recommendation' ? 'recommendation' : 'explorer')
  }, [searchParams, objectivePref?.ready, objectivePref?.preference.primarySlug, lockedGoal, lockedObjectiveSlug, pathname, router])

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
      isExplorerBudget(bud) ||
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

  const { filtered, profile: activeFilterProfile } = useMemo(
    () =>
      applyExplorerFiltersAndSort(
        normalized,
        filterState,
        lockedObjectiveSlug ?? objectivePref?.preference.primarySlug,
      ),
    [normalized, filterState, lockedObjectiveSlug, objectivePref?.preference.primarySlug],
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
              Intelligence terrain et mobilité — filtrez et ouvrez une fiche pays. Pour partager cette
              vue avec vos filtres actuels, utilisez le bouton{' '}
              <button
                type="button"
                onClick={() => void copyExplorerShareLink()}
                aria-label="Copier le lien de cette vue Explorer dans le presse-papiers"
                className={cn(
                  'mx-0.5 inline-flex items-center gap-1.5 rounded-lg border border-[#0D1B3E]/15 bg-white px-2.5 py-1 align-middle text-xs font-semibold text-[#0D1B3E] hover:bg-[#0D1B3E]/[0.04]',
                  NEXUS_FOCUS_VISIBLE,
                  NEXUS_TRANSITION,
                )}
              >
                <Copy className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Copier le lien
              </button>
              .
            </p>
          </div>
          <div className="relative w-full shrink-0 lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0D1B3E]/45" />
            <input
              type="search"
              placeholder="Rechercher une destination…"
              className={cn(
                'w-full rounded-2xl border border-[#0D1B3E]/12 bg-white py-3 pl-10 pr-4 text-sm font-medium text-[#0D1B3E] outline-none placeholder:text-[#0D1B3E]/40 focus-visible:ring-2 focus-visible:ring-[#0D1B3E]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FDFBF4]',
                NEXUS_TRANSITION,
              )}
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

        {isGuest ? (
          <p
            className="rounded-xl border border-[#0D1B3E]/12 bg-[#FDFBF4] px-4 py-3 text-sm font-medium leading-relaxed text-[#0D1B3E]/80"
            role="status"
          >
            Parcours en lecture seule — explorez et filtrez sans compte.{' '}
            <Link
              href={signInRedirectHref(compareProductHref)}
              className="font-bold text-[#0D1B3E] underline underline-offset-2"
            >
              Connectez-vous
            </Link>{' '}
            pour comparer des pays côte à côte et mémoriser vos vues sur tous vos appareils.
            {isGuest ? (
              <>
                {' '}
                Un compte gratuit débloque la comparaison multi-pays et la sauvegarde de vos filtres.
              </>
            ) : null}
          </p>
        ) : null}

        <div className="sticky top-16 z-30 space-y-4 rounded-2xl border border-[#0D1B3E]/10 bg-white/95 p-4 shadow-lg backdrop-blur-md">
          <div className="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-center">
            <FilterBar
              className="mb-0 min-w-0 flex-1 border-0 bg-transparent p-0 shadow-none"
              goalValue={explorerGoalToFilterValue(goal)}
              regionValue={explorerRegionToFilterBarValue(region)}
              goalLocked={Boolean(lockedGoal)}
              goalLockedLabel={goalLockedLabel}
              hideRegion
              onGoalChange={(v) => {
                if (lockedGoal) return
                const g = filterGoalFromSelect(v)
                setGoal(g)
                commitExplorerUrl({ goal: g })
              }}
            />
            <label className="inline-flex cursor-pointer items-center gap-3 self-stretch rounded-2xl border border-[#0D1B3E]/12 bg-[#FDFBF4] px-4 py-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#0D1B3E]/25 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-white xl:self-center">
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
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider',
                  NEXUS_TRANSITION,
                  mode === 'explorer' ? NEXUS_FOCUS_VISIBLE_ON_INK_SOLID : NEXUS_FOCUS_VISIBLE,
                  mode === 'explorer'
                    ? 'bg-[#0D1B3E] text-white shadow-md'
                    : 'text-[#0D1B3E]/70 hover:text-[#0D1B3E]',
                )}
              >
                <SlidersHorizontal className="h-4 w-4" /> Liste
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('recommendation')
                  commitExplorerUrl({ mode: 'recommendation' })
                }}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider',
                  NEXUS_TRANSITION,
                  mode === 'recommendation' ? NEXUS_FOCUS_VISIBLE_ON_INK_SOLID : NEXUS_FOCUS_VISIBLE,
                  mode === 'recommendation'
                    ? 'bg-[#0D1B3E] text-white shadow-md'
                    : 'text-[#0D1B3E]/70 hover:text-[#0D1B3E]',
                )}
              >
                <Target className="h-4 w-4" /> Recommandation
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <Link
                href={compareLinkHref}
                onClick={() => markExplorerOnboardingEngaged()}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl border border-[#0D1B3E]/20 bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-[#0D1B3E] hover:border-[#0D1B3E]/35 hover:bg-[#FDFBF4]',
                  NEXUS_FOCUS_VISIBLE,
                  NEXUS_TRANSITION,
                )}
                title={isGuest ? 'Connexion requise pour comparer' : undefined}
              >
                <Scale className="h-4 w-4 shrink-0" aria-hidden />
                Comparer
                {isGuest ? (
                  <span className="text-[9px] font-black normal-case tracking-normal text-[#0D1B3E]/55">
                    (connexion)
                  </span>
                ) : null}
              </Link>
              {isGuest ? (
                <p className="max-w-[14rem] text-[10px] font-medium leading-snug text-[#0D1B3E]/55">
                  Compte gratuit — comparez jusqu&apos;à plusieurs pays avec les mêmes filtres.
                </p>
              ) : null}
            </div>

            <ExplorerFilterPanel
              profile={activeFilterProfile}
              budget={budget}
              difficulty={difficulty}
              friction={friction}
              region={explorerRegionToFilterBarValue(region)}
              onBudgetChange={(v) => {
                setBudget(v)
                commitExplorerUrl({ budget: v })
              }}
              onDifficultyChange={(v) => {
                setDifficulty(v)
                commitExplorerUrl({ difficulty: v })
              }}
              onFrictionChange={(v) => {
                setFriction(v)
                commitExplorerUrl({ friction: v })
              }}
              onRegionChange={(v) => {
                const nextR = parseExplorerRegionFilter(v)
                setRegion(nextR)
                commitExplorerUrl({ region: nextR })
              }}
            />

            <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
              {!isGuest ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      writeExplorerSavedFilters({
                        q: search,
                        region: region === 'all' ? '' : explorerRegionToUrlParam(region),
                        goal,
                        objective: lockedObjectiveSlug ?? objectiveSlug ?? undefined,
                        budget,
                        difficulty,
                        friction,
                        schengenOnly,
                        mode,
                      })
                      setHasSavedView(true)
                      appToast.success('Vue enregistrée — vous pourrez la rouvrir d’un clic.')
                    }}
                    className={cn(
                      'rounded-xl border border-[#0D1B3E]/12 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#0D1B3E] hover:border-[#0D1B3E]/25 hover:bg-[#FDFBF4]',
                      NEXUS_FOCUS_VISIBLE,
                      NEXUS_TRANSITION,
                    )}
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
                    className={cn(
                      'rounded-xl border border-[#0D1B3E]/20 bg-[#FDFBF4] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#0D1B3E] hover:bg-white disabled:cursor-not-allowed disabled:opacity-45',
                      NEXUS_FOCUS_VISIBLE,
                      NEXUS_TRANSITION,
                    )}
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
                    className={cn(
                      'rounded-xl border border-[#0D1B3E]/10 bg-transparent px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#0D1B3E]/60 hover:text-[#0D1B3E] disabled:cursor-not-allowed disabled:opacity-45',
                      NEXUS_FOCUS_VISIBLE,
                      NEXUS_TRANSITION,
                    )}
                  >
                    Oublier
                  </button>
                </>
              ) : null}
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
