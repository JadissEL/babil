'use client'

import { useState, useEffect, useMemo } from 'react'
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

          <div className="space-y-3">
            <h2 className="text-lg font-black text-text">Classement</h2>
            <RecommendationPanel results={panelRows} />
          </div>
        </>
      )}
    </div>
  )
}
