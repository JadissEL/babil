'use client'

import { useState, useEffect } from 'react'
import { Search, Globe, SlidersHorizontal, Target } from 'lucide-react'
import GoogleAd from '@/components/GoogleAd'
import CountryGrid from '@/components/country/CountryGrid'
import { FilterBar } from '@/components/filters/FilterBar'
import {
  frictionTierFromCountry,
  isoForCountryName,
  scoreToMobilityTier,
} from '@/lib/country-card-mappers'
import { enrichCountryApiRecord } from '@/lib/enrich-country-api'

type Mode = 'explorer' | 'recommendation'
type Goal = 'all' | 'tourism' | 'study' | 'work' | 'business' | 'education'
type Budget = 'all' | 'low' | 'medium' | 'high'

function filterGoalFromSelect(v: string): Goal {
  if (!v) return 'all'
  const allowed: Exclude<Goal, 'all'>[] = ['tourism', 'study', 'work', 'business', 'education']
  return (allowed.includes(v as Exclude<Goal, 'all'>) ? v : 'all') as Goal
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
  if (v === 'schengen') return 'Schengen'
  return v.charAt(0).toUpperCase() + v.slice(1)
}

export default function ExplorerPage() {
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
    fetch('/api/countries')
      .then(res => res.json())
      .then(data => {
        setCountries(data)
        setLoading(false)
      })
  }, [])

  const normalized = countries.map((c: Record<string, unknown>) => enrichCountryApiRecord(c))

  const filtered = normalized
    .filter((c: any) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
      const matchesRegion = region === 'all' || c.region === region
      const matchesDifficulty = difficulty === 'all' || String(c._difficultyLabel).toLowerCase() === difficulty.toLowerCase()
      const matchesGoal =
        goal === 'all' ||
        (goal === 'tourism' && c._visa.tourism >= 50) ||
        (goal === 'study' && c._visa.study >= 50) ||
        (goal === 'work' && c._visa.work >= 50) ||
        (goal === 'business' && c._visa.business >= 50) ||
        (goal === 'education' && c._education >= 50)
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
  }))

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-10 pb-20 sm:px-8">
      <div className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-blue-600 p-4 text-white shadow-lg shadow-blue-900/30">
            <Globe className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">Global Explorer</h1>
            <p className="mt-1 text-sm font-medium text-slate-400">
              Intelligence terrain & mobilité pour citoyens marocains — filtre et compare les destinations.
            </p>
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-30 rounded-2xl border border-white/10 bg-[#111827]/95 p-4 shadow-xl shadow-black/20 backdrop-blur">
        <FilterBar
          className="mb-4 border-b border-white/10 pb-4"
          goalValue={explorerGoalToFilterValue(goal)}
          regionValue={explorerRegionToSelect(region)}
          onGoalChange={(v) => setGoal(filterGoalFromSelect(v))}
          onRegionChange={(v) => setRegion(selectToExplorerRegion(v))}
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setMode('explorer')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider ${mode === 'explorer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              <SlidersHorizontal className="h-4 w-4" /> Explorer
            </button>
            <button
              type="button"
              onClick={() => setMode('recommendation')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider ${mode === 'recommendation' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              <Target className="h-4 w-4" /> Recommendation
            </button>
          </div>

          <div className="relative min-w-64 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              placeholder="Chercher un pays..."
              className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm font-medium text-slate-100 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-bold text-slate-100 outline-none"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="all">Difficulty: All</option>
            <option value="Low">Easy</option>
            <option value="Medium">Medium</option>
            <option value="High">Hard</option>
            <option value="Extreme">Critical</option>
          </select>

          <select
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-bold text-slate-100 outline-none"
            value={budget}
            onChange={(e) => setBudget(e.target.value as Budget)}
          >
            <option value="all">Budget: All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-black uppercase tracking-wider text-slate-300">
            <input type="checkbox" className="rounded border-white/30" checked={schengenOnly} onChange={(e) => setSchengenOnly(e.target.checked)} />
            Schengen only
          </label>
        </div>
      </div>

      <GoogleAd slot="explorer_top" />

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
        </div>
      ) : gridCountries.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#111827] p-12 text-center text-slate-400">
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
