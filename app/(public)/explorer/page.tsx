'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, Globe, SlidersHorizontal, Target, Scale } from 'lucide-react'
import GoogleAd from '@/components/GoogleAd'
import CountryGrid from '@/components/country/CountryGrid'
import { FilterBar } from '@/components/filters/FilterBar'
import {
  frictionTierFromCountry,
  isoForCountryName,
  scoreToMobilityTier,
} from '@/lib/country-card-mappers'
import { normalizeCountriesApiListResponse } from '@/lib/country-full-data-materialize'
import { enrichCountryApiRecord } from '@/lib/enrich-country-api'
import {
  explorerRegionToFilterBarValue,
  explorerRegionToUrlParam,
  matchesExplorerRegionFilter,
  matchesExplorerSchengenOnlyToggle,
  parseExplorerRegionFilter,
  type ExplorerRegionFilter,
} from '@/lib/explorer-filters'
import { compareHrefForExplorerPageState } from '@/lib/explorer-goal-to-compare-objective'

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
  const [countries, setCountries] = useState<any[]>([])
  const [mode, setMode] = useState<Mode>('explorer')
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState<ExplorerRegionFilter>('all')
  const [difficulty, setDifficulty] = useState('all')
  const [goal, setGoal] = useState<Goal>('all')
  const [budget, setBudget] = useState<Budget>('all')
  const [schengenOnly, setSchengenOnly] = useState(false)
  const [loading, setLoading] = useState(true)

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
      if (g !== 'all') params.set('goal', g)
      if (b !== 'all') params.set('budget', b)
      if (d !== 'all' && ['Low', 'Medium', 'High', 'Extreme'].includes(d)) params.set('difficulty', d)
      if (sch) params.set('schengen', '1')
      if (m === 'recommendation') params.set('mode', 'recommendation')
      const qs = params.toString()
      const basePath = pathname ?? '/explorer'
      router.replace(qs ? `${basePath}?${qs}` : basePath, { scroll: false })
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
    setGoal(goalParam?.trim() ? filterGoalFromSelect(goalParam.trim().toLowerCase()) : 'all')

    const bud = searchParams.get('budget')
    setBudget(isBudgetParam(bud) ? bud : 'all')

    const diff = searchParams.get('difficulty')
    setDifficulty(diff && ['Low', 'Medium', 'High', 'Extreme'].includes(diff) ? diff : 'all')

    const sch = searchParams.get('schengen')
    setSchengenOnly(sch === '1' || sch === 'true' || sch === 'yes')

    const modeParam = searchParams.get('mode')
    setMode(modeParam === 'recommendation' ? 'recommendation' : 'explorer')
  }, [searchParams])

  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => setCountries(normalizeCountriesApiListResponse(data)))
      .catch(() => setCountries([]))
      .finally(() => setLoading(false))
  }, [])

  const normalized = countries.map((c: Record<string, unknown>) => enrichCountryApiRecord(c))

  const filtered = normalized
    .filter((c: any) => {
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
    .sort((a: any, b: any) =>
      mode === 'recommendation' ? b._finalScore - a._finalScore : a.name.localeCompare(b.name)
    )

  const gridCountries = filtered.map((c: any) => ({
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
  }))

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-10 pb-20 sm:px-8">
      <div className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-primary p-4 text-white shadow-soft">
            <Globe className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-text md:text-4xl">Explorer global</h1>
            <p className="mt-1 text-sm font-medium text-muted">
              Intelligence terrain et mobilité pour citoyens marocains — filtrez et comparez les destinations.
              Partagez une vue précise avec{' '}
              <code className="rounded-md border border-line bg-inset px-1.5 py-0.5 text-[11px] font-bold text-primary">
                /explorer?q=nom-du-pays
              </code>
              .
            </p>
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-30 rounded-2xl border border-line bg-surface/95 p-4 shadow-card backdrop-blur">
        <FilterBar
          className="mb-4 border-b border-line pb-4"
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
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-2xl border border-line bg-inset p-1">
            <button
              type="button"
              onClick={() => {
                setMode('explorer')
                commitExplorerUrl({ mode: 'explorer' })
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider ${mode === 'explorer' ? 'bg-primary text-white shadow-soft' : 'text-muted hover:text-primary'}`}
            >
              <SlidersHorizontal className="h-4 w-4" /> Explorer
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('recommendation')
                commitExplorerUrl({ mode: 'recommendation' })
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider ${mode === 'recommendation' ? 'bg-primary text-white shadow-soft' : 'text-muted hover:text-primary'}`}
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
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary-soft/50 px-3 py-2 text-xs font-black uppercase tracking-wider text-primary transition-colors hover:border-primary/50 hover:bg-primary-soft"
          >
            <Scale className="h-4 w-4 shrink-0" aria-hidden />
            Comparer
          </Link>

          <div className="relative min-w-64 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Chercher un pays..."
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3 text-sm font-medium text-text outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => commitExplorerUrl()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitExplorerUrl()
              }}
            />
          </div>

          <select
            className="rounded-xl border border-line bg-surface px-3 py-2.5 text-sm font-bold text-text outline-none"
            value={difficulty}
            onChange={(e) => {
              const v = e.target.value
              setDifficulty(v)
              commitExplorerUrl({ difficulty: v })
            }}
          >
            <option value="all">Difficulté : toutes</option>
            <option value="Low">Facile</option>
            <option value="Medium">Moyenne</option>
            <option value="High">Difficile</option>
            <option value="Extreme">Critique</option>
          </select>

          <select
            className="rounded-xl border border-line bg-surface px-3 py-2.5 text-sm font-bold text-text outline-none"
            value={budget}
            onChange={(e) => {
              const v = e.target.value as Budget
              setBudget(v)
              commitExplorerUrl({ budget: v })
            }}
          >
            <option value="all">Budget : tous</option>
            <option value="low">Bas</option>
            <option value="medium">Moyen</option>
            <option value="high">Élevé</option>
          </select>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-inset px-3 py-2.5 text-xs font-black uppercase tracking-wider text-muted">
            <input
              type="checkbox"
              className="rounded border-white/30"
              checked={schengenOnly}
              onChange={(e) => {
                const checked = e.target.checked
                setSchengenOnly(checked)
                commitExplorerUrl({ schengenOnly: checked })
              }}
            />
            Schengen uniquement
          </label>
        </div>
      </div>

      <GoogleAd slot="explorer_top" />

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : gridCountries.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-12 text-center text-muted">
          <p className="text-sm font-medium">Aucun pays ne correspond à ces filtres.</p>
        </div>
      ) : (
        <div className="space-y-12">
          <CountryGrid countries={gridCountries} />

          <div className="flex justify-center py-8">
            <GoogleAd slot="explorer_bottom" />
          </div>
        </div>
      )}
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
