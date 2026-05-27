'use client'

import { useUser } from '@clerk/nextjs'
import { ArrowRight, Scale } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import BudgetFilter from '@/components/filters/BudgetFilter'
import GoalFilter from '@/components/filters/GoalFilter'
import RegionFilter from '@/components/filters/RegionFilter'
import RiskFilter from '@/components/filters/RiskFilter'
import { signInRedirectHref } from '@/lib/cta-hrefs'
import { compareHrefForHomeQuickFilters } from '@/lib/explorer-goal-to-compare-objective'
import {
  SITE_FOCUS_HOME_CTA_GHOST,
  SITE_FOCUS_HOME_CTA_SOLID,
  SITE_INTERACTION_TRANSITION,
} from '@/lib/site-chrome-tokens'
import { cn } from '@/lib/utils'

/** Maps home quick filters → Explorer search params (explorer already applies them). */
function buildExplorerHref(goal: string, budget: string, region: string, risk: string): string {
  const params = new URLSearchParams()
  if (goal !== 'all') params.set('goal', goal)
  if (budget !== 'all') params.set('budget', budget)
  if (region !== 'all') {
    params.set('region', region === 'Schengen' ? 'schengen' : region.toLowerCase())
  }
  if (risk !== 'all') {
    const difficulty = risk === 'low' ? 'Low' : risk === 'medium' ? 'Medium' : 'High'
    params.set('difficulty', difficulty)
  }
  const q = params.toString()
  return q ? `/explorer?${q}` : '/explorer'
}

export default function HomeQuickFilterEngine({
  initialExplorerGoal = 'all',
  goalLocked = false,
  goalLockedLabel,
}: {
  /** From primary user objective — maps to Explorer `goal` param */
  initialExplorerGoal?: string
  goalLocked?: boolean
  goalLockedLabel?: string
}) {
  const { isSignedIn, isLoaded: userLoaded } = useUser()
  const isGuest = userLoaded && !isSignedIn
  const [goal, setGoal] = useState(initialExplorerGoal)
  const [budget, setBudget] = useState('all')
  const [region, setRegion] = useState('all')
  const [risk, setRisk] = useState('all')

  const resultsHref = useMemo(
    () => buildExplorerHref(goal, budget, region, risk),
    [goal, budget, region, risk],
  )

  const compareProductHref = useMemo(
    () => compareHrefForHomeQuickFilters(goal, budget, region, risk),
    [goal, budget, region, risk],
  )

  const compareHref = useMemo(
    () => (isGuest ? signInRedirectHref(compareProductHref) : compareProductHref),
    [isGuest, compareProductHref],
  )

  useEffect(() => {
    setGoal(initialExplorerGoal && initialExplorerGoal.length > 0 ? initialExplorerGoal : 'all')
  }, [initialExplorerGoal])

  const goalFilterLocked = goalLocked && goal !== 'all'

  return (
    <section className="mt-8 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
      <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Filtres rapides</p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <GoalFilter
            value={goal}
            onChange={setGoal}
            locked={goalFilterLocked}
            lockedLabel={goalLockedLabel}
          />
          <BudgetFilter value={budget} onChange={setBudget} />
          <RegionFilter value={region} onChange={setRegion} />
          <RiskFilter value={risk} onChange={setRisk} />
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <Link
              href={compareHref}
              className={cn(
                'inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-[#0a1f33] shadow-sm hover:bg-white sm:w-auto',
                SITE_INTERACTION_TRANSITION,
                SITE_FOCUS_HOME_CTA_GHOST,
              )}
              title={isGuest ? 'Connexion requise pour comparer' : undefined}
            >
              <Scale className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Comparer
            </Link>
            {isGuest ? (
              <p className="text-center text-[10px] font-semibold text-slate-500 sm:text-left">
                Connexion requise
              </p>
            ) : null}
          </div>
          <Link
            href={resultsHref}
            className={cn(
              'inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-sm sm:w-auto',
              SITE_INTERACTION_TRANSITION,
              SITE_FOCUS_HOME_CTA_SOLID,
            )}
            style={{ backgroundColor: '#0D1B3E' }}
          >
            Voir les résultats
            <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}
