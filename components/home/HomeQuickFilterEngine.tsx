'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowRight, Scale } from 'lucide-react'
import GoalFilter from '@/components/filters/GoalFilter'
import BudgetFilter from '@/components/filters/BudgetFilter'
import RegionFilter from '@/components/filters/RegionFilter'
import RiskFilter from '@/components/filters/RiskFilter'
import { compareHrefForHomeQuickFilters } from '@/lib/explorer-goal-to-compare-objective'

/** Maps home quick filters → Explorer search params (explorer already applies them). */
function buildExplorerHref(goal: string, budget: string, region: string, risk: string): string {
  const params = new URLSearchParams()
  if (goal !== 'all') params.set('goal', goal)
  if (budget !== 'all') params.set('budget', budget)
  if (region !== 'all') {
    if (region === 'Schengen') {
      params.set('schengen', '1')
    } else {
      params.set('region', region.toLowerCase())
    }
  }
  if (risk !== 'all') {
    const difficulty = risk === 'low' ? 'Low' : risk === 'medium' ? 'Medium' : 'High'
    params.set('difficulty', difficulty)
  }
  const q = params.toString()
  return q ? `/explorer?${q}` : '/explorer'
}

export default function HomeQuickFilterEngine() {
  const [goal, setGoal] = useState('all')
  const [budget, setBudget] = useState('all')
  const [region, setRegion] = useState('all')
  const [risk, setRisk] = useState('all')

  const resultsHref = useMemo(
    () => buildExplorerHref(goal, budget, region, risk),
    [goal, budget, region, risk],
  )

  const compareHref = useMemo(
    () => compareHrefForHomeQuickFilters(goal, budget, region, risk),
    [goal, budget, region, risk],
  )

  return (
    <section className="mt-8 rounded-2xl border border-line bg-surface p-4 shadow-soft">
      <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted">Filtres rapides</p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <GoalFilter value={goal} onChange={setGoal} />
          <BudgetFilter value={budget} onChange={setBudget} />
          <RegionFilter value={region} onChange={setRegion} />
          <RiskFilter value={risk} onChange={setRisk} />
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
          <Link
            href={compareHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/35 bg-primary-soft/60 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-primary shadow-soft transition-colors hover:bg-primary-soft sm:w-auto"
          >
            <Scale className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Comparer
          </Link>
          <Link
            href={resultsHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-soft transition-colors hover:bg-primary-hover sm:w-auto"
          >
            Voir les résultats
            <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}
