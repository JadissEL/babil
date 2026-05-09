'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

import { ScoreBreakdownChart } from '@/components/engine/ScoreBreakdownChart'
import RecommendationPanel from '@/components/engine/RecommendationPanel'
import { ProfileContextBanner } from '@/components/dashboard/ProfileContextBanner'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ApiRecommendation } from '@/lib/recommendation-ui'
import { mapApiRecommendationToPanelRow } from '@/lib/recommendation-ui'

function RecoMetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] font-black uppercase tracking-widest text-muted">
        <span>{label}</span>
        <span className="font-bold text-text">{Math.round(value)}</span>
      </div>
      <Progress value={Math.min(100, Math.max(0, value))} />
    </div>
  )
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<ApiRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [profileUsed, setProfileUsed] = useState<Record<string, unknown> | null>(null)
  const [chartCountryId, setChartCountryId] = useState<number | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [compareSelectedIds, setCompareSelectedIds] = useState<number[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileRes = await fetch('/api/user/profile')
        const profile = await profileRes.json()

        if (!profile || profile.error) {
          setProfileUsed(null)
          setLoading(false)
          return
        }

        setProfileUsed(profile)
        const recoRes = await fetch('/api/recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile }),
        })
        const data = await recoRes.json()
        setRecommendations(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (!recommendations.length) {
      setChartCountryId(null)
      return
    }
    setChartCountryId((prev) => {
      const ids = recommendations.map((r) => Number(r.id))
      if (prev != null && ids.includes(prev)) return prev
      return Number(recommendations[0].id)
    })
  }, [recommendations])

  const chartReco = useMemo(() => {
    if (!recommendations.length || chartCountryId == null) return null
    return (
      recommendations.find((r) => Number(r.id) === chartCountryId) ?? recommendations[0]
    )
  }, [recommendations, chartCountryId])

  const toggleCompare = useCallback((countryId: number) => {
    setCompareSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(countryId)) next.delete(countryId)
      else if (next.size < 3) next.add(countryId)
      return Array.from(next)
    })
  }, [])

  const compareRecos = useMemo(() => {
    if (compareSelectedIds.length < 2) return []
    const byId = new Map(recommendations.map((r) => [Number(r.id), r]))
    return compareSelectedIds.map((id) => byId.get(id)).filter((r): r is ApiRecommendation => Boolean(r?.breakdown))
  }, [compareSelectedIds, recommendations])

  const panelRows = recommendations.map((r, idx) =>
    mapApiRecommendationToPanelRow(r, idx + 1),
  )

  return (
    <div>
      <div className="mb-8 sm:mb-10">
        <h1 className="mb-2 text-2xl font-black tracking-tight text-text sm:text-3xl lg:text-4xl">
          Intelligence de recommandation
        </h1>
        <p className="text-sm font-medium text-muted sm:text-base">
          Analyses basées sur votre profil et les données terrain — scoring déterministe et explicable.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : recommendations.length === 0 ? (
        <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-surface px-6 py-10 text-center shadow-card sm:rounded-[2rem] sm:p-12">
          <AlertCircle className="mx-auto mb-6 h-16 w-16 text-primary" />
          <h2 className="mb-4 text-2xl font-black text-text">Besoin de plus d&apos;infos</h2>
          <p className="mb-8 font-medium leading-relaxed text-muted">
            Complétez votre profil pour obtenir des recommandations personnalisées basées sur votre budget et vos objectifs.
          </p>
          <Link
            href="/profile"
            className="inline-block rounded-2xl bg-primary px-8 py-4 font-black text-white shadow-soft transition-colors hover:bg-primary-hover"
          >
            Configurer mon profil
          </Link>
        </div>
      ) : (
        <>
          {profileUsed ? <ProfileContextBanner profile={profileUsed} variant="recommendation" /> : null}

          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-text">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
                checked={compareMode}
                onChange={(ev) => {
                  setCompareMode(ev.target.checked)
                  if (!ev.target.checked) setCompareSelectedIds([])
                }}
              />
              Mode comparaison radar (2 à 3 pays)
            </label>
            {compareMode ? (
              <p className="text-xs font-medium text-muted sm:max-w-md sm:text-right">
                Activez les cases dans le classement ci-dessous ; la zone de comparaison apparaît sous le radar
                principal.
              </p>
            ) : null}
          </div>

          {chartReco?.breakdown ? (
            <div className="mb-10 grid min-w-0 gap-6 lg:grid-cols-2">
              <Card className="min-w-0 border-line bg-surface shadow-card">
                <CardContent className="space-y-4 p-4 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-black text-text">Radar — {chartReco.name}</h2>
                    <Select
                      value={String(chartReco.id)}
                      onValueChange={(v) => setChartCountryId(Number(v))}
                    >
                      <SelectTrigger className="w-full border-line bg-inset sm:w-[220px]">
                        <SelectValue placeholder="Pays" />
                      </SelectTrigger>
                      <SelectContent>
                        {recommendations.map((r) => (
                          <SelectItem key={String(r.id)} value={String(r.id)}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <ScoreBreakdownChart breakdown={chartReco.breakdown} />
                  <Link
                    href={`/countries/${chartReco.id}`}
                    className="inline-block text-xs font-bold text-primary underline-offset-2 hover:underline"
                  >
                    Ouvrir la fiche pays →
                  </Link>
                </CardContent>
              </Card>

              <Card className="min-w-0 border-line bg-surface shadow-card">
                <CardContent className="space-y-4 p-4 sm:p-6">
                  <h2 className="text-lg font-black text-text">Détail des piliers</h2>
                  <div className="grid gap-3">
                    <RecoMetricBar label="Visa" value={chartReco.breakdown.visa} />
                    <RecoMetricBar label="Friction (facilité)" value={chartReco.breakdown.friction} />
                    <RecoMetricBar label="Adéquation objectif" value={chartReco.breakdown.goalMatch} />
                    <RecoMetricBar label="Risque refus (inv.)" value={100 - chartReco.breakdown.risk} />
                  </div>
                  <p className="text-xs font-medium text-muted">
                    Même décomposition que le moteur d&apos;analyse manuelle : visa, friction, objectif et risque
                    perçu.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {compareRecos.length >= 2 ? (
            <Card className="mb-10 min-w-0 border-line bg-surface shadow-card">
              <CardContent className="space-y-4 p-4 sm:p-6">
                <h2 className="text-lg font-black text-text">Comparaison radar (2–3 pays)</h2>
                <p className="text-xs font-medium text-muted">
                  Même échelle que le radar principal — survolez un axe pour la définition alignée sur le moteur.
                </p>
                <div className="grid min-w-0 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {compareRecos.map((r) => (
                    <div key={String(r.id)} className="min-w-0 rounded-xl border border-line bg-inset p-4">
                      <p className="mb-2 text-sm font-black text-text">{r.name}</p>
                      <ScoreBreakdownChart breakdown={r.breakdown!} chartHeight={200} />
                      <Link
                        href={`/countries/${r.id}`}
                        className="mt-2 inline-block text-xs font-bold text-primary underline-offset-2 hover:underline"
                      >
                        Ouvrir la fiche pays →
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="mb-4">
            <h2 className="text-lg font-black text-text">Classement</h2>
          </div>

          <RecommendationPanel
            results={panelRows}
            compareMode={compareMode}
            compareSelectedIds={compareSelectedIds}
            onCompareToggle={toggleCompare}
          />
        </>
      )}
    </div>
  )
}
