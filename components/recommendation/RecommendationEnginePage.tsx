'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, Loader2, RefreshCw, Sparkles } from 'lucide-react'

import { RecommendationPanel } from '@/components/engine/RecommendationPanel'
import { ScoreBreakdownChart } from '@/components/engine/ScoreBreakdownChart'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

const GOALS = ['TOURISM', 'STUDY', 'WORK', 'BUSINESS', 'SHORT_COURSE'] as const

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
        <span>{label}</span>
        <span className="text-slate-300">{Math.round(value)}</span>
      </div>
      <Progress value={Math.min(100, Math.max(0, value))} />
    </div>
  )
}

export default function RecommendationEnginePage() {
  const [income, setIncome] = useState('8000')
  const [savings, setSavings] = useState('70000')
  const [cnss, setCnss] = useState(true)
  const [maritalStatus, setMaritalStatus] = useState<'SINGLE' | 'MARRIED'>('SINGLE')
  const [familyInEU, setFamilyInEU] = useState(false)
  const [goal, setGoal] = useState<(typeof GOALS)[number]>('STUDY')

  const [results, setResults] = useState<ApiRecommendation[]>([])
  const [chartCountryId, setChartCountryId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [profileHint, setProfileHint] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/user/profile')
      const p = await res.json()
      if (!p || p.error) {
        setProfileHint('Profil introuvable — saisissez les valeurs manuellement.')
        return
      }
      setProfileHint('Profil chargé depuis votre compte.')
      setIncome(String(Math.round(p.income ?? 0)))
      setSavings(String(Math.round(p.savings ?? 0)))
      setCnss(Boolean(p.CNSS_status))
      setFamilyInEU(Boolean(p.family_in_europe))
      const m = String(p.marital_status || 'SINGLE').toUpperCase()
      setMaritalStatus(m === 'MARRIED' ? 'MARRIED' : 'SINGLE')
      const g = String(p.goal_type || 'TOURISM').toUpperCase()
      if ((GOALS as readonly string[]).includes(g)) setGoal(g as (typeof GOALS)[number])
    } catch {
      setProfileHint('Impossible de charger le profil.')
    }
  }, [])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const handleRun = async () => {
    setLoading(true)
    setProfileHint(null)
    try {
      const profile = {
        income: Number(income) || 0,
        savings: Number(savings) || 0,
        CNSS_status: cnss,
        marital_status: maritalStatus,
        family_in_europe: familyInEU,
        goal_type: goal,
      }
      const res = await fetch('/api/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      })
      const data = await res.json()
      if (!res.ok) {
        setResults([])
        setProfileHint(typeof data?.error === 'string' ? data.error : 'Erreur API')
        return
      }
      const list = Array.isArray(data) ? (data as ApiRecommendation[]) : []
      setResults(list)
    } catch {
      setProfileHint('Échec réseau.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const panelRows = useMemo(
    () => results.map((r, idx) => mapApiRecommendationToPanelRow(r, idx + 1)),
    [results],
  )

  const chartReco = useMemo(() => {
    if (!results.length) return null
    const id = chartCountryId ?? Number(results[0].id)
    return results.find((r) => Number(r.id) === id) ?? results[0]
  }, [results, chartCountryId])

  useEffect(() => {
    if (!results.length) return
    setChartCountryId((prev) => {
      if (prev != null && results.some((r) => Number(r.id) === prev)) return prev
      return Number(results[0].id)
    })
  }, [results])

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-lg shadow-blue-900/40">
            <Activity className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">Visa Probability Engine</h1>
            <p className="mt-1 text-sm font-medium text-slate-400">
              Analyse déterministe, graphiques radar et synthèses — même moteur que les recommandations.
            </p>
          </div>
        </div>
        <Button variant="outline" type="button" onClick={() => void loadProfile()} className="shrink-0 gap-2">
          <RefreshCw className="h-4 w-4" /> Recharger profil
        </Button>
      </div>

      {profileHint && (
        <p className="rounded-xl border border-white/10 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-200">
          {profileHint}
        </p>
      )}

      <Card className="border-gray-800 bg-[#111827]">
        <CardContent className="space-y-6 p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" aria-hidden />
            <h2 className="text-lg font-semibold text-white">Paramètres du profil</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="income">Revenu mensuel (MAD)</Label>
              <Input id="income" inputMode="numeric" value={income} onChange={(e) => setIncome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="savings">Épargne (MAD)</Label>
              <Input id="savings" inputMode="numeric" value={savings} onChange={(e) => setSavings(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Objectif principal</Label>
              <Select value={goal} onValueChange={(v) => setGoal(v as (typeof GOALS)[number])}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Objectif" />
                </SelectTrigger>
                <SelectContent>
                  {GOALS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut marital</Label>
              <Select value={maritalStatus} onValueChange={(v) => setMaritalStatus(v as 'SINGLE' | 'MARRIED')}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE">Célibataire</SelectItem>
                  <SelectItem value="MARRIED">Marié(e)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-300">
              <input
                type="checkbox"
                className="size-4 rounded border-gray-600 bg-[#0B0F19] text-blue-600"
                checked={cnss}
                onChange={(e) => setCnss(e.target.checked)}
              />
              CNSS / activité déclarée
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-300">
              <input
                type="checkbox"
                className="size-4 rounded border-gray-600 bg-[#0B0F19] text-blue-600"
                checked={familyInEU}
                onChange={(e) => setFamilyInEU(e.target.checked)}
              />
              Famille en Europe
            </label>
          </div>

          <Button type="button" onClick={() => void handleRun()} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Lancer l&apos;analyse
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && chartReco?.breakdown && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-gray-800 bg-[#111827]">
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-white">Radar — {chartReco.name}</h2>
                <Select
                  value={String(chartReco.id)}
                  onValueChange={(v) => setChartCountryId(Number(v))}
                >
                  <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="Pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {results.map((r) => (
                      <SelectItem key={String(r.id)} value={String(r.id)}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ScoreBreakdownChart breakdown={chartReco.breakdown} />
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-[#111827]">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold text-white">Détail barres</h2>
              <div className="grid gap-3">
                <MetricBar label="Visa" value={chartReco.breakdown.visa} />
                <MetricBar label="Friction (facilité)" value={chartReco.breakdown.friction} />
                <MetricBar label="Adéquation objectif" value={chartReco.breakdown.goalMatch} />
                <MetricBar label="Risque refus (inv.)" value={100 - chartReco.breakdown.risk} />
              </div>
              <p className="text-xs text-slate-500">
                Les pondérations finales combinent ces axes avec votre profil (revenu, épargne, objectif).
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Classement synthétique</h2>
          <RecommendationPanel results={panelRows} />
        </div>
      )}
    </div>
  )
}
