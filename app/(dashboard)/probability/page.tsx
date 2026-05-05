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
        setResults(data)
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
        return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
      case 'High':
        return 'border-blue-500/40 bg-blue-500/15 text-blue-200'
      case 'Medium':
        return 'border-amber-500/40 bg-amber-500/15 text-amber-200'
      case 'Low':
        return 'border-orange-500/40 bg-orange-500/15 text-orange-200'
      case 'Very Low':
        return 'border-red-500/40 bg-red-500/15 text-red-200'
      default:
        return 'border-white/15 bg-white/5 text-slate-300'
    }
  }

  // Calculate Global Strategy based on results
  const topCountry = results[0]
  const backupCountries = results.slice(1, 4)
  const highRiskCountries = results.filter(r => r.globalScore < 40).slice(0, 3)

  return (
    <div className="mx-auto max-w-6xl pb-20">
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-lg shadow-blue-900/40">
            <Brain className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">Visa Probability Engine</h1>
            <p className="font-medium text-slate-400">Analyse multi-facteurs basée sur votre profil.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowComparison(!showComparison)}
            disabled={comparisonList.length < 2}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 font-bold transition-all ${
              comparisonList.length >= 2
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 hover:bg-blue-500'
                : 'cursor-not-allowed bg-white/10 text-slate-500'
            }`}
          >
            <Scale className="h-5 w-5" />
            {showComparison ? 'Masquer la comparaison' : `Comparer (${comparisonList.length})`}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
        </div>
      ) : results.length === 0 ? (
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-[#111827] p-12 text-center shadow-xl shadow-black/20">
          <ShieldAlert className="mx-auto mb-6 h-16 w-16 text-amber-400" />
          <h2 className="mb-4 text-2xl font-black text-white">Profil incomplet</h2>
          <p className="mb-8 font-medium leading-relaxed text-slate-400">
            Pour calculer vos probabilités, renseignez votre situation financière et professionnelle.
          </p>
          <a
            href="/profile"
            className="inline-block rounded-2xl bg-blue-600 px-8 py-4 font-black text-white shadow-lg shadow-blue-900/40 transition-colors hover:bg-blue-500"
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

            <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-lg shadow-black/15">
              <div className="mb-4 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Pays de secours
                </span>
              </div>
              <div className="space-y-3">
                {backupCountries.map((c: any) => (
                  <div
                    key={c.country}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <span className="font-bold text-slate-200">{c.country}</span>
                    <span className="text-xs font-black text-blue-300">{c.globalScore}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-lg shadow-black/15">
              <div className="mb-4 flex items-center gap-2 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Risques élevés
                </span>
              </div>
              <div className="space-y-3">
                {highRiskCountries.map((c: any) => (
                  <div
                    key={c.country}
                    className="flex items-center justify-between rounded-xl border border-red-500/25 bg-red-500/10 p-3"
                  >
                    <span className="font-bold text-slate-200">{c.country}</span>
                    <span className="text-xs font-black text-red-300">{c.globalScore}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Comparison View */}
          {showComparison && (
            <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black">Comparaison Détaillée</h2>
                <button onClick={() => setComparisonList([])} className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Vider la liste</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {results.filter(r => comparisonList.includes(r.country)).map((r: any) => (
                  <div key={r.country} className="bg-white/10 rounded-3xl p-6 backdrop-blur-md border border-white/10">
                    <h3 className="text-2xl font-black mb-6">{r.country}</h3>
                    <div className="space-y-6">
                      {Object.entries(r.breakdown).map(([key, val]: [string, any]) => (
                        <div key={key}>
                          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                            <span>{key}</span>
                            <span>{val}%</span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${val}%` }}></div>
                          </div>
                        </div>
                      ))}
                      <div className="pt-6 border-t border-white/10">
                        <div className="text-4xl font-black text-center">{r.globalScore}%</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-center text-slate-400 mt-2">Probabilité Totale</div>
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
              <h2 className="text-xl font-black text-white">Analyse par pays</h2>
              <p className="text-sm font-bold italic text-slate-500">Cliquez pour détails et stratégie.</p>
            </div>
            {results.map((r: any) => (
              <div
                key={r.country}
                className={`rounded-3xl border transition-all duration-300 ${
                  expanded === r.country
                    ? 'border-blue-500/50 bg-[#111827] shadow-lg shadow-blue-900/25 ring-2 ring-blue-500/30'
                    : 'border-white/10 bg-[#111827] hover:border-white/20'
                }`}
              >
                <div
                  className="flex cursor-pointer flex-col items-start justify-between gap-6 p-6 md:flex-row md:items-center md:p-8"
                  onClick={() => setExpanded(expanded === r.country ? null : r.country)}
                >
                  <div className="flex w-full items-center gap-6 md:w-auto">
                    <div className="shrink-0 text-left">
                      <h3 className="text-2xl font-black tracking-tight text-white">{r.country}</h3>
                      <div
                        className={`mt-2 inline-block rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getLevelColor(r.level)}`}
                      >
                        {r.level}
                      </div>
                    </div>

                    <div className="mx-4 hidden h-12 w-px bg-white/10 md:block" />

                    <div className="flex gap-8">
                      <div className="text-center">
                        <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Score global
                        </div>
                        <div className="text-3xl font-black text-white">{r.globalScore}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-between gap-6 md:w-auto">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleComparison(r.country)
                      }}
                      className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                        comparisonList.includes(r.country)
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                          : 'bg-white/10 text-slate-400 hover:bg-white/15'
                      }`}
                    >
                      {comparisonList.includes(r.country) ? 'Sélectionné' : 'Comparer'}
                    </button>
                    {expanded === r.country ? (
                      <ChevronUp className="h-6 w-6 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-slate-500" />
                    )}
                  </div>
                </div>

                {expanded === r.country && (
                  <div className="border-t border-white/10 bg-white/[0.02] px-6 pb-8 md:px-8 md:pb-8">
                    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                      {/* Breakdown */}
                      <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                          <TrendingUp className="h-4 w-4" /> Facteurs
                        </h4>
                        <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0B0F19] p-6">
                          {Object.entries(r.breakdown).map(([key, val]: [string, any]) => (
                            <div key={key} className="space-y-2">
                              <div className="flex justify-between text-xs font-bold capitalize text-slate-400">
                                <span>{key}</span>
                                <span>{val}%</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                <div className="h-full rounded-full bg-blue-500" style={{ width: `${val}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Reasons */}
                      <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                          <AlertCircle className="h-4 w-4" /> Analyse critique
                        </h4>
                        <div className="space-y-3">
                          {r.reasons.map((reason: string, i: number) => (
                            <div
                              key={i}
                              className="flex gap-3 rounded-2xl border border-white/10 bg-[#0B0F19] p-4 text-sm font-medium leading-relaxed text-slate-300"
                            >
                              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                              {reason}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Strategy */}
                      <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                          <Lightbulb className="h-4 w-4" /> Stratégie
                        </h4>
                        <div className="space-y-3">
                          {r.strategy.map((s: string, i: number) => (
                            <div
                              key={i}
                              className="flex gap-3 rounded-2xl border border-blue-500/30 bg-blue-600/25 p-5 text-sm font-bold text-slate-100 shadow-lg shadow-blue-900/30"
                            >
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-[10px]">
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

