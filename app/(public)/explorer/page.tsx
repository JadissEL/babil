'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Globe, SlidersHorizontal, Target } from 'lucide-react'
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

type Mode = 'explorer' | 'recommendation'
type Goal = 'all' | 'tourism' | 'study' | 'work' | 'business' | 'education' | 'short_course'
type Budget = 'all' | 'low' | 'medium' | 'high'

function filterGoalFromSelect(v: string): Goal {
  if (!v) return 'all'
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
  return goal === 'all' ? '' : goal
}

function explorerRegionToSelect(region: string): string {
  if (region === 'all') return ''
  return region.toLowerCase()
}

function selectToExplorerRegion(v: string): string {
  if (!v) return 'all'
  if (v.toLowerCase() === 'schengen') return 'Schengen'
  return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
}

function isBudgetParam(v: string | null): v is Exclude<Budget, 'all'> {
  return v === 'low' || v === 'medium' || v === 'high'
}

function ExplorerPageInner() {
  const searchParams = useSearchParams()
  const [countries, setCountries] = useState<any[]>([])
  const [mode, setMode] = useState<Mode>('explorer')
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const [goal, setGoal] = useState<Goal>('all')
  const [budget, setBudget] = useState<Budget>('all')
  const [schengenOnly, setSchengenOnly] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!searchParams) return
    const qRaw = searchParams.get('q') ?? searchParams.get('search')
    try {
      const qDecoded = decodeURIComponent(qRaw ?? '').trim()
      if (qDecoded) setSearch(qDecoded)
    } catch {
      const qFall = String(qRaw ?? '').trim()
      if (qFall) setSearch(qFall)
    }

    const reg = searchParams.get('region')
    if (reg?.trim()) setRegion(selectToExplorerRegion(reg.trim()))

    const goalParam = searchParams.get('goal')
    if (goalParam?.trim()) setGoal(filterGoalFromSelect(goalParam.trim().toLowerCase()))

    const bud = searchParams.get('budget')
    if (isBudgetParam(bud)) setBudget(bud)

    const diff = searchParams.get('difficulty')
    if (diff && ['Low', 'Medium', 'High', 'Extreme'].includes(diff)) setDifficulty(diff)

    const sch = searchParams.get('schengen')
    if (sch === '1' || sch === 'true' || sch === 'yes') setSchengenOnly(true)

    const modeParam = searchParams.get('mode')
    if (modeParam === 'recommendation') setMode('recommendation')
  }, [searchParams])

  useEffect(() => {
    fetch('/api/countries')
      .then(res => res.json())
      .then((data) => {
        setCountries(normalizeCountriesApiListResponse(data))
        setLoading(false)
      })
  }, [])

  const normalized = countries.map((c: Record<string, unknown>) => enrichCountryApiRecord(c))

  const filtered = normalized
    .filter((c: any) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
      const matchesRegion = region === 'all' || c.region === region
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
      const matchesSchengen = !schengenOnly || c.schengen_flag
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
          regionValue={explorerRegionToSelect(region)}
          onGoalChange={(v) => setGoal(filterGoalFromSelect(v))}
          onRegionChange={(v) => setRegion(selectToExplorerRegion(v))}
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-2xl border border-line bg-inset p-1">
            <button
              type="button"
              onClick={() => setMode('explorer')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider ${mode === 'explorer' ? 'bg-primary text-white shadow-soft' : 'text-muted hover:text-primary'}`}
            >
              <SlidersHorizontal className="h-4 w-4" /> Explorer
            </button>
            <button
              type="button"
              onClick={() => setMode('recommendation')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider ${mode === 'recommendation' ? 'bg-primary text-white shadow-soft' : 'text-muted hover:text-primary'}`}
            >
              <Target className="h-4 w-4" /> Recommandation
            </button>
          </div>

          <div className="relative min-w-64 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Chercher un pays..."
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3 text-sm font-medium text-text outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="rounded-xl border border-line bg-surface px-3 py-2.5 text-sm font-bold text-text outline-none"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
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
            onChange={(e) => setBudget(e.target.value as Budget)}
          >
            <option value="all">Budget : tous</option>
            <option value="low">Bas</option>
            <option value="medium">Moyen</option>
            <option value="high">Élevé</option>
          </select>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-inset px-3 py-2.5 text-xs font-black uppercase tracking-wider text-muted">
            <input type="checkbox" className="rounded border-white/30" checked={schengenOnly} onChange={(e) => setSchengenOnly(e.target.checked)} />
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
