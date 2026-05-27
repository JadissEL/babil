'use client'

import { useUser } from '@clerk/nextjs'
import { ArrowRight, Scale } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ExplorerFilterPanel } from '@/components/filters/ExplorerFilterPanel'
import GoalFilter from '@/components/filters/GoalFilter'
import { signInRedirectHref } from '@/lib/cta-hrefs'
import { compareHrefForExplorerPageState } from '@/lib/explorer-goal-to-compare-objective'
import {
  buildExplorerQueryString,
  parseExplorerGoalParam,
  resolveExplorerFilterProfile,
  type ExplorerBudget,
  type ExplorerFilterState,
  type ExplorerFrictionBand,
} from '@/lib/explorer-filter-engine'
import { parseExplorerRegionFilter } from '@/lib/explorer-filters'
import {
  SITE_FOCUS_HOME_CTA_GHOST,
  SITE_FOCUS_HOME_CTA_SOLID,
  SITE_INTERACTION_TRANSITION,
} from '@/lib/site-chrome-tokens'
import { isUserObjectiveSlug } from '@/lib/user-objectives/registry'
import { cn } from '@/lib/utils'

function homeRegionToExplorerRegion(region: string) {
  if (!region || region === 'all') return 'all' as const
  const key = region === 'Schengen' ? 'schengen' : region.toLowerCase()
  return parseExplorerRegionFilter(key)
}

function homeRiskToFilterPatch(
  risk: string,
  useFriction: boolean,
): { difficulty: string; friction: ExplorerFrictionBand } {
  if (risk === 'all') return { difficulty: 'all', friction: 'all' }
  if (useFriction) {
    return {
      difficulty: 'all',
      friction: risk === 'low' ? 'low' : risk === 'medium' ? 'medium' : 'high',
    }
  }
  const difficulty = risk === 'low' ? 'Low' : risk === 'medium' ? 'Medium' : 'High'
  return { difficulty, friction: 'all' }
}

export default function HomeQuickFilterEngine({
  initialExplorerGoal = 'all',
  initialObjectiveSlug = null,
  goalLocked = false,
  goalLockedLabel,
}: {
  initialExplorerGoal?: string
  initialObjectiveSlug?: string | null
  goalLocked?: boolean
  goalLockedLabel?: string
}) {
  const { isSignedIn, isLoaded: userLoaded } = useUser()
  const isGuest = userLoaded && !isSignedIn
  const [goal, setGoal] = useState(initialExplorerGoal)
  const [budget, setBudget] = useState<ExplorerBudget>('all')
  const [region, setRegion] = useState('all')
  const [risk, setRisk] = useState('all')

  const objectiveSlug = useMemo(() => {
    if (goalLocked && initialObjectiveSlug && isUserObjectiveSlug(initialObjectiveSlug)) {
      return initialObjectiveSlug
    }
    return null
  }, [goalLocked, initialObjectiveSlug])

  const filterState = useMemo((): ExplorerFilterState => {
    const profile = resolveExplorerFilterProfile(
      {
        objectiveSlug,
        goal: parseExplorerGoalParam(goal),
        region: homeRegionToExplorerRegion(region),
        budget,
        difficulty: 'all',
        friction: 'all',
        schengenOnly: false,
        q: '',
        mode: 'explorer',
      },
      objectiveSlug,
    )
    const { difficulty, friction } = homeRiskToFilterPatch(
      risk,
      profile.dimensions.includes('friction'),
    )
    return {
      objectiveSlug,
      goal: parseExplorerGoalParam(goal),
      region: homeRegionToExplorerRegion(region),
      budget,
      difficulty,
      friction,
      schengenOnly: false,
      q: '',
      mode: 'explorer',
    }
  }, [objectiveSlug, goal, region, budget, risk])

  const profile = useMemo(
    () => resolveExplorerFilterProfile(filterState, objectiveSlug),
    [filterState, objectiveSlug],
  )

  const resultsHref = useMemo(() => {
    const qs = buildExplorerQueryString(filterState)
    return qs ? `/explorer?${qs}` : '/explorer'
  }, [filterState])

  const compareProductHref = useMemo(
    () =>
      compareHrefForExplorerPageState({
        goal: filterState.goal,
        budget: filterState.budget,
        region: filterState.region,
        difficulty: filterState.difficulty,
        schengenOnly: false,
        objectiveSlug,
        friction: filterState.friction,
      }),
    [filterState, objectiveSlug],
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
      <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
        Filtres rapides
        {profile.parcoursLabelFr ? (
          <span className="ml-2 normal-case tracking-normal text-slate-600">
            · {profile.parcoursLabelFr}
          </span>
        ) : null}
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="flex min-w-0 flex-col gap-3">
          {!goalFilterLocked ? (
            <GoalFilter value={goal} onChange={setGoal} locked={false} />
          ) : (
            <p className="text-[11px] font-bold text-slate-600">
              Parcours : {goalLockedLabel ?? profile.parcoursLabelFr}
            </p>
          )}
          <ExplorerFilterPanel
            profile={profile}
            budget={budget}
            difficulty={filterState.difficulty}
            friction={filterState.friction}
            region={region === 'Schengen' ? 'schengen' : region === 'all' ? 'all' : region.toLowerCase()}
            compact
            onBudgetChange={setBudget}
            onDifficultyChange={() => {}}
            onFrictionChange={() => {}}
            onRegionChange={setRegion}
          />
          {profile.dimensions.includes('friction') ? (
            <label className="flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                {profile.labels.friction ?? 'Friction'}
              </span>
              <select
                value={risk}
                onChange={(e) => setRisk(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800"
              >
                <option value="all">Tous</option>
                <option value="low">Faible (rapide)</option>
                <option value="medium">Modérée</option>
                <option value="high">Élevée</option>
              </select>
            </label>
          ) : profile.dimensions.includes('difficulty') ? (
            <label className="flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                {profile.labels.difficulty ?? 'Difficulté'}
              </span>
              <select
                value={risk}
                onChange={(e) => setRisk(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800"
              >
                <option value="all">Toutes</option>
                <option value="low">Facile</option>
                <option value="medium">Moyenne</option>
                <option value="high">Difficile</option>
              </select>
            </label>
          ) : null}
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
