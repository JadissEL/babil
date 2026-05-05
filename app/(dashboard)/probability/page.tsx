'use client'

import { useState, useEffect } from 'react'
import { Brain, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Lightbulb, TrendingUp, Scale, Star, ShieldAlert } from 'lucide-react'

export default function ProbabilityPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [comparisonList, setComparisonList] = useState<string[]>([])
  const [showComparison, setShowComparison] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch user profile first
        const profileRes = await fetch('/api/user/profile')
        const profile = await profileRes.json()

        if (!profile || profile.error) {
          // If no profile, show error or use default for demo?
          // The user requested to finalize recommendations based on profile.
          // I'll set a state for missing profile.
          setLoading(false)
          return
        }

        const probRes = await fetch('/api/probability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile })
        })
        const data = await probRes.json()
        setResults(Array.isArray(data) && probRes.ok ? data : [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

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

  const levelLabelFr = (level: string) => {
    switch (level) {
      case 'Very High':
        return 'Très haut'
      case 'High':
        return 'Élevé'
      case 'Medium':
        return 'Moyen'
      case 'Low':
        return 'Faible'
      case 'Very Low':
        return 'Très faible'
      default:
        return level || '—'
    }
  }

  // Calculate Global Strategy based on results
  const topCountry = results[0]
  const backupCountries = results.slice(1, 4)
  const highRiskCountries = results.filter(r => r.globalScore < 40).slice(0, 3)

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

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : results.length === 0 ? (
        <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-surface px-5 py-10 text-center shadow-card sm:rounded-[2rem] sm:p-12">
          <ShieldAlert className="mx-auto mb-6 h-16 w-16 text-warning" />
          <h2 className="mb-4 text-2xl font-black text-text">Profil incomplet</h2>
          <p className="mb-8 font-medium leading-relaxed text-muted">
            Pour calculer vos probabilités, renseignez votre situation financière et professionnelle.
          </p>
          <a
            href="/profile"
            className="inline-block rounded-2xl bg-primary px-8 py-4 font-black text-white shadow-soft transition-colors hover:bg-primary-hover"
          >
            Compléter mon profil
          </a>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Global Output Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-3xl text-white shadow-xl shadow-green-100">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest opacity-80">Meilleur choix</span>
              </div>
              <h3 className="text-3xl font-black mb-1">{topCountry?.country}</h3>
              <p className="text-green-100 text-sm font-bold mb-6">Score de succès estimé: {topCountry?.globalScore}%</p>
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <p className="text-xs font-bold leading-relaxed">
                  C'est votre meilleure porte d'entrée. Votre profil correspond à 90% aux critères d'acceptation actuels.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft">
              <div className="mb-4 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-warning" />
                <span className="text-xs font-black uppercase tracking-widest text-muted">
                  Pays de secours
                </span>
              </div>
              <div className="space-y-3">
                {backupCountries.map((c: any) => (
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

            <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft">
              <div className="mb-4 flex items-center gap-2 text-danger">
                <AlertCircle className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest text-muted">
                  Risques élevés
                </span>
              </div>
              <div className="space-y-3">
                {highRiskCountries.map((c: any) => (
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
                {results.filter(r => comparisonList.includes(r.country)).map((r: any) => (
                  <div key={r.country} className="rounded-3xl border border-line bg-inset p-6">
                    <h3 className="text-2xl font-black mb-6">{r.country}</h3>
                    <div className="space-y-6">
                      {Object.entries(r.breakdown).map(([key, val]: [string, any]) => (
                        <div key={key}>
                          <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-widest text-muted">
                            <span>{key}</span>
                            <span>{val}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-[#eadfcf]">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${val}%` }}></div>
                          </div>
                        </div>
                      ))}
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
            {results.map((r: any) => (
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
                      <div
                        className={`mt-2 inline-block rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getLevelColor(r.level)}`}
                      >
                        {levelLabelFr(r.level)}
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
                    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                      {/* Breakdown */}
                      <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted">
                          <TrendingUp className="h-4 w-4" /> Facteurs
                        </h4>
                        <div className="space-y-4 rounded-2xl border border-line bg-surface p-6">
                          {Object.entries(r.breakdown).map(([key, val]: [string, any]) => (
                            <div key={key} className="space-y-2">
                              <div className="flex justify-between text-xs font-bold capitalize text-muted">
                                <span>{key}</span>
                                <span>{val}%</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-[#eadfcf]">
                                <div className="h-full rounded-full bg-blue-500" style={{ width: `${val}%` }} />
                              </div>
                            </div>
                          ))}
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

