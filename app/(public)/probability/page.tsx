'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Brain, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Lightbulb, TrendingUp, Scale, Star, ShieldAlert, Info } from 'lucide-react'
import { SignInButton, useUser } from '@clerk/nextjs'

import { ProfileContextBanner } from '@/components/dashboard/ProfileContextBanner'
import { DashboardPageSkeleton } from '@/components/dashboard/DashboardPageSkeleton'
import {
  describeTopCountrySignals,
  orderedProbabilityBreakdown,
  PROBABILITY_DEFAULT_FIELD_LABELS_FR,
  type ProbabilityCountrySignals,
  type ProbabilitySheetFieldDefault,
} from '@/lib/probability-result-display'
import { englishScoreLevelToFr } from '@/lib/score-level-fr'
import { formatScoreDriversFrench } from '@/lib/score-driver-explain'
import { CTA_COMPARE_TOURISM_HREF, CTA_EXPLORE_HREF } from '@/lib/cta-hrefs'
import { appToast } from '@/lib/toast-store'
import { PUBLIC_READ_ONLY_DEMO_PROFILE } from '@/lib/public-read-only-demo-profile'
import type { ProbabilityApiRow } from '@/lib/types/api-recommendation-probability'

export default function ProbabilityPage() {
  const { user, isLoaded } = useUser()
  const [results, setResults] = useState<ProbabilityApiRow[]>([])
  const [loading, setLoading] = useState(true)
  const [profileUsed, setProfileUsed] = useState<Record<string, unknown> | null>(null)
  const [readOnlyDemo, setReadOnlyDemo] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [comparisonList, setComparisonList] = useState<string[]>([])
  const [showComparison, setShowComparison] = useState(false)

  useEffect(() => {
    if (!isLoaded) return

    const loadData = async () => {
      try {
        if (!user) {
          setReadOnlyDemo(true)
          setProfileUsed({ ...PUBLIC_READ_ONLY_DEMO_PROFILE })
          const probRes = await fetch('/api/probability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          })
          const data = await probRes.json()
          if (!probRes.ok) {
            const msg =
              typeof (data as { error?: unknown })?.error === 'string'
                ? (data as { error: string }).error
                : 'Le moteur de probabilités a échoué.'
            appToast.error(msg)
            setResults([])
          } else if (!Array.isArray(data)) {
            appToast.error('Réponse probabilité inattendue.')
            setResults([])
          } else {
            setResults(data as ProbabilityApiRow[])
          }
          return
        }

        setReadOnlyDemo(false)
        const profileRes = await fetch('/api/user/profile')
        const profile = await profileRes.json()

        if (!profile || profile.error) {
          setProfileUsed(null)
          setLoading(false)
          return
        }

        setProfileUsed(profile)
        const probRes = await fetch('/api/probability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile }),
        })
        const data = await probRes.json()
        if (!probRes.ok) {
          const msg =
            typeof (data as { error?: unknown })?.error === 'string'
              ? (data as { error: string }).error
              : 'Le moteur de probabilités a échoué.'
          appToast.error(msg)
          setResults([])
        } else if (!Array.isArray(data)) {
          appToast.error('Réponse probabilité inattendue.')
          setResults([])
        } else {
          setResults(data as ProbabilityApiRow[])
        }
      } catch (err) {
        console.error(err)
        appToast.error('Erreur réseau — probabilités non chargées.')
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isLoaded, user])

  const toggleComparison = (country: string) => {
    if (comparisonList.includes(country)) {
      setComparisonList(comparisonList.filter(c => c !== country))
    } else if (comparisonList.length < 3) {
      setComparisonList([...comparisonList, country])
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Very High':
        return 'border-[#94dfbd] bg-[#e9f9f1] text-success'
      case 'High':
        return 'border-primary/40 bg-primary-soft text-primary'
      case 'Medium':
        return 'border-[#f2c27a] bg-[#fff5e7] text-warning'
      case 'Low':
        return 'border-accent/40 bg-accent-soft text-accent'
      case 'Very Low':
        return 'border-[#f3afaf] bg-[#fff0f0] text-danger'
      default:
        return 'border-line bg-inset text-muted'
    }
  }

  // Calculate Global Strategy based on results
  const topCountry = results[0]
  const backupCountries = results.slice(1, 4)
  const highRiskCountries = results.filter((r) => r.globalScore < 40).slice(0, 3)

  if (!isLoaded || loading) {
    return (
      <div className="mx-auto max-w-6xl pb-16 sm:pb-20">
        <div className="mb-8 flex min-w-0 items-center gap-3 sm:mb-10 sm:gap-4">
          <div className="rounded-2xl bg-primary p-2.5 text-white shadow-soft sm:p-3">
            <Brain className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-text sm:text-3xl">Moteur de probabilités visa</h1>
        </div>
        <DashboardPageSkeleton />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl pb-16 sm:pb-20">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:mb-10 sm:gap-6 md:flex-row md:items-center">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="rounded-2xl bg-primary p-2.5 text-white shadow-soft sm:p-3">
            <Brain className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight text-text sm:text-3xl lg:text-4xl">
              Moteur de probabilités visa
            </h1>
            <p className="text-sm font-medium text-muted sm:text-base">
              Analyse multi-facteurs basée sur votre profil.
            </p>
          </div>
        </div>

        <div className="flex w-full md:w-auto">
          <button
            type="button"
            onClick={() => setShowComparison(!showComparison)}
            disabled={comparisonList.length < 2}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all sm:w-auto sm:px-6 ${
              comparisonList.length >= 2
                ? 'bg-primary text-white shadow-soft hover:bg-primary-hover'
                : 'cursor-not-allowed bg-inset text-muted'
            }`}
          >
            <Scale className="h-5 w-5 shrink-0" />
            <span className="truncate">{showComparison ? 'Masquer la comparaison' : `Comparer (${comparisonList.length})`}</span>
          </button>
        </div>
      </div>

      {readOnlyDemo ? (
        <div className="mb-6 rounded-2xl border border-primary/35 bg-primary-soft/50 p-4 text-sm font-medium text-text shadow-card sm:p-5">
          <span className="font-black text-primary">Mode découverte.</span> Scores calculés avec un profil de démonstration
          fixe.{' '}
          <SignInButton mode="modal">
            <button
              type="button"
              className="font-black text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
            >
              Connectez-vous
            </button>
          </SignInButton>{' '}
          et renseignez votre profil pour une lecture personnalisée.
        </div>
      ) : null}

      {results.length === 0 ? (
        <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-surface px-5 py-10 text-center shadow-card sm:rounded-[2rem] sm:p-12">
          <ShieldAlert className="mx-auto mb-6 h-16 w-16 text-warning" />
          <h2 className="mb-4 text-2xl font-black text-text">Profil incomplet</h2>
          <p className="mb-8 font-medium leading-relaxed text-muted">
            Pour calculer vos probabilités, renseignez votre situation financière et professionnelle.
          </p>
          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/profile"
              className="inline-flex justify-center rounded-2xl bg-primary px-8 py-4 font-black text-white shadow-soft transition-colors hover:bg-primary-hover"
            >
              Compléter mon profil
            </Link>
            <Link
              href={CTA_EXPLORE_HREF}
              className="inline-flex justify-center rounded-2xl border border-line bg-inset px-8 py-4 font-black text-text transition-colors hover:bg-primary-soft"
            >
              Explorer les pays
            </Link>
            <Link
              href={CTA_COMPARE_TOURISM_HREF}
              className="inline-flex justify-center rounded-2xl border border-line bg-inset px-8 py-4 font-black text-text transition-colors hover:bg-primary-soft"
            >
              Ouvrir le comparateur
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {profileUsed ? <ProfileContextBanner profile={profileUsed} variant="probability" /> : null}

          {/* Global Output Section */}
          <section className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="min-w-0 bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-3xl text-white shadow-xl shadow-green-100">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest opacity-80">Meilleur choix</span>
              </div>
              <h3 className="text-3xl font-black mb-1">{topCountry?.country}</h3>
              <p className="text-green-100 text-sm font-bold mb-6">Score de succès estimé: {topCountry?.globalScore}%</p>
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <p className="text-xs font-bold leading-relaxed">
                  {describeTopCountrySignals(topCountry?.countrySignals as ProbabilityCountrySignals | undefined)}
                </p>
              </div>
            </div>

            <div className="min-w-0 rounded-3xl border border-line bg-surface p-6 shadow-soft">
              <div className="mb-4 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-warning" />
                <span className="text-xs font-black uppercase tracking-widest text-muted">
                  Pays de secours
                </span>
              </div>
              <div className="space-y-3">
                {backupCountries.map((c) => (
                  <div
                    key={c.country}
                    className="flex items-center justify-between rounded-xl border border-line bg-inset p-3"
                  >
                    <span className="font-bold text-text">{c.country}</span>
                    <span className="text-xs font-black text-primary">{c.globalScore}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-w-0 rounded-3xl border border-line bg-surface p-6 shadow-soft">
              <div className="mb-4 flex items-center gap-2 text-danger">
                <AlertCircle className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest text-muted">
                  Risques élevés
                </span>
              </div>
              <div className="space-y-3">
                {highRiskCountries.map((c) => (
                  <div
                    key={c.country}
                    className="flex items-center justify-between rounded-xl border border-red-500/25 bg-red-500/10 p-3"
                  >
                    <span className="font-bold text-text">{c.country}</span>
                    <span className="text-xs font-black text-danger">{c.globalScore}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Comparison View */}
          {showComparison && (
            <section className="rounded-2xl border border-line bg-surface p-5 text-text shadow-card sm:rounded-[2.5rem] sm:p-8 md:p-10">
              <div className="mb-6 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-black sm:text-2xl md:text-3xl">Comparaison Détaillée</h2>
                <button
                  type="button"
                  onClick={() => setComparisonList([])}
                  className="self-start text-sm font-bold text-muted transition-colors hover:text-primary sm:self-auto"
                >
                  Vider la liste
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {results.filter(r => comparisonList.includes(r.country)).map((r) => (
                  <div key={r.country} className="rounded-3xl border border-line bg-inset p-6">
                    <h3 className="text-2xl font-black mb-6">{r.country}</h3>
                    <div className="space-y-6">
                      {orderedProbabilityBreakdown(
                        r.breakdown as Record<string, unknown>,
                        r.defaultsUsed as ProbabilitySheetFieldDefault[] | undefined,
                      ).map(
                        ({ key, label, value }) => (
                          <div key={key}>
                            <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-widest text-muted">
                              <span>{label}</span>
                              <span>{value}%</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-[#eadfcf]">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${value}%` }}></div>
                            </div>
                          </div>
                        ),
                      )}
                      <div className="border-t border-line pt-6">
                        <div className="text-4xl font-black text-center">{r.globalScore}%</div>
                        <div className="mt-2 text-center text-[10px] font-black uppercase tracking-widest text-muted">Probabilité Totale</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Country Cards */}
          <div className="grid grid-cols-1 gap-6">
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-black text-text">Analyse par pays</h2>
              <p className="text-sm font-bold italic text-muted">Cliquez pour détails et stratégie.</p>
            </div>
            {results.map((r) => (
              <div
                key={r.country}
                className={`rounded-3xl border transition-all duration-300 ${
                  expanded === r.country
                    ? 'border-primary/50 bg-surface shadow-soft ring-2 ring-primary/30'
                    : 'border-line bg-surface hover:border-primary/20'
                }`}
              >
                <div
                  className="flex cursor-pointer flex-col items-stretch justify-between gap-4 p-5 sm:gap-6 sm:p-6 md:flex-row md:items-center md:p-8"
                  onClick={() => setExpanded(expanded === r.country ? null : r.country)}
                >
                  <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 md:w-auto">
                    <div className="min-w-0 shrink-0 text-left">
                      <h3 className="text-xl font-black tracking-tight text-text sm:text-2xl">{r.country}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <div
                          className={`inline-block rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getLevelColor(r.level)}`}
                        >
                          {englishScoreLevelToFr(r.level) ?? r.level ?? '—'}
                        </div>
                        {r.hasPhdStudies ? (
                          <span className="rounded-full border border-primary/40 bg-primary-soft px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                            Bloc PhD
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mx-4 hidden h-12 w-px shrink-0 bg-line md:block" />

                    <div className="flex items-center gap-6 sm:gap-8">
                      <div className="text-left sm:text-center">
                        <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted">
                          Score global
                        </div>
                        <div className="text-2xl font-black text-text sm:text-3xl">{r.globalScore}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-between gap-3 border-t border-line pt-4 md:w-auto md:border-t-0 md:pt-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleComparison(r.country)
                      }}
                      className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                        comparisonList.includes(r.country)
                          ? 'bg-primary text-white shadow-soft'
                          : 'bg-inset text-muted hover:bg-primary-soft'
                      }`}
                    >
                      {comparisonList.includes(r.country) ? 'Sélectionné' : 'Comparer'}
                    </button>
                    {expanded === r.country ? (
                      <ChevronUp className="h-6 w-6 text-muted" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-muted" />
                    )}
                  </div>
                </div>

                {expanded === r.country && (
                  <div className="border-t border-line bg-inset px-4 pb-6 sm:px-6 md:px-8 md:pb-8">
                    <div className="mt-8 space-y-8">
                      {Array.isArray(r.defaultsUsed) && r.defaultsUsed.length > 0 ? (
                        <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4 text-sm font-medium text-text">
                          Données fiche incomplètes : le moteur utilise une valeur neutre (50) pour{' '}
                          {(r.defaultsUsed as ProbabilitySheetFieldDefault[])
                            .map((k) => PROBABILITY_DEFAULT_FIELD_LABELS_FR[k])
                            .join(' ; ')}
                          .
                        </div>
                      ) : null}
                      {Array.isArray(r.topDrivers) && r.topDrivers.length > 0 ? (
                        <div className="rounded-2xl border border-line bg-surface p-5">
                          <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-muted">
                            Facteurs les plus influents (vs neutre)
                          </h4>
                          <ul className="list-disc space-y-2 pl-5 text-sm font-medium text-muted">
                            {formatScoreDriversFrench(r.topDrivers).map((line, i) => (
                              <li key={`${r.country}-td-${i}`}>{line}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Breakdown */}
                        <div className="space-y-4">
                          <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted">
                            <TrendingUp className="h-4 w-4" /> Facteurs
                          </h4>
                          <div className="space-y-4 rounded-2xl border border-line bg-surface p-6">
                            {orderedProbabilityBreakdown(
                              r.breakdown as Record<string, unknown>,
                              r.defaultsUsed as ProbabilitySheetFieldDefault[] | undefined,
                            ).map(
                              ({ key, label, value }) => (
                                <div key={key} className="space-y-2">
                                  <div className="flex justify-between text-xs font-bold text-muted">
                                    <span>{label}</span>
                                    <span>{value}%</span>
                                  </div>
                                  <div className="h-2 overflow-hidden rounded-full bg-[#eadfcf]">
                                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${value}%` }} />
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>

                        {/* Reasons */}
                        <div className="space-y-4">
                          <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted">
                            <AlertCircle className="h-4 w-4" /> Analyse critique
                          </h4>
                          <div className="space-y-3">
                            {r.reasons.map((reason: string, i: number) => (
                              <div
                                key={i}
                                className="flex gap-3 rounded-2xl border border-line bg-surface p-4 text-sm font-medium leading-relaxed text-muted"
                              >
                                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                                {reason}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Strategy */}
                        <div className="space-y-4">
                          <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted">
                            <Lightbulb className="h-4 w-4" /> Stratégie
                          </h4>
                          <div className="space-y-3">
                            {r.strategy.map((s: string, i: number) => (
                              <div
                                key={i}
                                className="flex gap-3 rounded-2xl border border-primary/30 bg-primary-soft p-5 text-sm font-bold text-text shadow-soft"
                              >
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/70 text-[10px]">
                                  {i + 1}
                                </div>
                                {s}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted">
                          <Info className="h-4 w-4" /> Signaux issus de la fiche pays
                        </h4>
                        <div className="rounded-2xl border border-line bg-surface p-5 text-sm font-medium leading-relaxed text-muted">
                          <p>
                            {describeTopCountrySignals(r.countrySignals as ProbabilityCountrySignals | undefined)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

