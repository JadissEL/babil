'use client'

import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  ShieldAlert,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CountryEditor, type CountryEditorModel } from '@/components/admin/CountryEditor'
import { IntelligenceDeadLetterPanel } from '@/components/admin/IntelligenceDeadLetterPanel'
import { IntelligenceReviewQueuePanel } from '@/components/admin/IntelligenceReviewQueuePanel'
import { IntelligenceCompletenessPanel } from '@/components/admin/IntelligenceCompletenessPanel'
import { IntelligenceSloPanel } from '@/components/admin/IntelligenceSloPanel'
import { DashboardPageSkeleton } from '@/components/dashboard/DashboardPageSkeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPriceMad } from '@/lib/delegated-application-catalog'
import { DELEGATED_REQUEST_STATUSES } from '@/lib/delegated-application-status'

type Tab = 'comments' | 'countries' | 'assist' | 'intelligence'

type PendingComment = {
  id: number
  content: string
  status: string
  user: { name: string | null; email: string | null }
  country: { name: string }
}

type IntelligenceSummary = {
  sourceCount: number
  observationCount: number
  observationsWithoutRun: number
  fieldPathBreakdown: Array<{ fieldPath: string; count: number }>
  observationsBySource: Array<{
    sourceId: string
    slug: string
    name: string
    tier: string | null
    count: number
  }>
  observationsByCountry: Array<{
    countryId: number
    name: string
    region: string | null
    count: number
  }>
  recentRuns: Array<{
    id: string
    startedAt: string
    finishedAt: string | null
    status: string
    trigger: string
    errorSummary: string | null
    observationCount: number
    stats: unknown
  }>
  lastRun: {
    id: string
    startedAt: string
    finishedAt: string | null
    status: string
    trigger: string
    errorSummary: string | null
    stats: unknown
  } | null
  runAlerts: {
    level: 'ok' | 'warning' | 'critical'
    staleThresholdHours: number
    failedLookbackDays: number
    staleRuns: Array<{
      id: string
      startedAt: string
      status: string
      trigger: string
      errorSummary: string | null
    }>
    recentFailedOrPartial: Array<{
      id: string
      startedAt: string
      finishedAt: string | null
      status: string
      trigger: string
      errorSummary: string | null
    }>
  }
  pipelineJobQueue: {
    pending: number
    running: number
    alertLevel?: 'ok' | 'warning' | 'critical'
    metrics?: {
      disputedObservations: number
      pendingObservations: number
      verifiedObservations: number
      oldestPendingAgeMinutes: number | null
      retrySaturationRatio: number
      deadLetterLast24h?: number
    }
  }
  observationVerification?: {
    disputedCount: number
    pendingCount?: number
    verifiedCount?: number
    reviewQueuePath: string
  }
}

type AssistQueueRow = {
  id: number
  category: string
  packageId: string
  packageName: string
  priceMad?: number
  status: string
  createdAt: string
  userEmail: string
  userName: string | null
  contactEmailMasked: string | null
  hasFormContactEmail: boolean
}

type AgentHealth = {
  stateStatus: 'ok' | 'missing' | 'invalid'
  stateGeneratedAt: string | null
  taskSummary: { queued: number; running: number; done: number; failed: number; total: number }
  countriesTotal?: number
  countriesUpdatedLast24h?: number
  degraded?: boolean
  failedTasks?: Array<{ id: string; country: string; domain: string; query: string; error: string }>
  queuedPreview?: Array<{ id: string; country: string; domain: string; query: string; nextRunAt: string }>
  visualCoverage?: {
    withDataImage: number
    withCuratedImage: number
    likelyGenericFallback: number
  }
}

function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}

function runSuccessRate(runs: IntelligenceSummary['recentRuns']): number {
  if (!runs || runs.length === 0) return 0
  const ok = runs.filter((r) => r.status === 'SUCCESS' || r.status === 'OK' || r.status === 'COMPLETED').length
  return Math.round((ok / runs.length) * 100)
}

type AgentStatusTone = { dot: string; text: string; label: string }
function statusTone(kind: 'healthy' | 'delayed' | 'failed'): AgentStatusTone {
  if (kind === 'failed') return { dot: 'bg-rose-500', text: 'text-rose-700', label: 'FAILED' }
  if (kind === 'delayed') return { dot: 'bg-amber-500', text: 'text-amber-700', label: 'DELAYED' }
  return { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'HEALTHY' }
}

function relativeTimeFr(iso: string | null | undefined): string {
  if (!iso) return '—'
  const t = new Date(iso).getTime()
  if (!Number.isFinite(t)) return '—'
  const diff = Math.max(0, Date.now() - t)
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m} min${m > 1 ? 's' : ''} ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hr${h > 1 ? 's' : ''} ago`
  const d = Math.floor(h / 24)
  return `${d} day${d > 1 ? 's' : ''} ago`
}

type AgentStatusRow = { id: string; target: string; tone: AgentStatusTone; lastSync: string }
function buildAgentStatusRows(
  health: AgentHealth | null,
  intel: IntelligenceSummary | null,
): AgentStatusRow[] {
  const out: AgentStatusRow[] = []
  if (health?.failedTasks) {
    for (const t of health.failedTasks.slice(0, 3)) {
      out.push({
        id: `AG-${t.id.slice(0, 6).toUpperCase()}`,
        target: `${t.country} · ${t.domain}`,
        tone: statusTone('failed'),
        lastSync: relativeTimeFr(intel?.lastRun?.startedAt ?? null),
      })
    }
  }
  if (health?.queuedPreview) {
    for (const t of health.queuedPreview.slice(0, Math.max(0, 5 - out.length))) {
      const isLate =
        t.nextRunAt && new Date(t.nextRunAt).getTime() < Date.now() - 30 * 60_000
      out.push({
        id: `AG-${t.id.slice(0, 6).toUpperCase()}`,
        target: `${t.country} · ${t.domain}`,
        tone: statusTone(isLate ? 'delayed' : 'healthy'),
        lastSync: relativeTimeFr(t.nextRunAt),
      })
    }
  }
  if (out.length === 0 && intel?.observationsBySource) {
    for (const s of intel.observationsBySource.slice(0, 3)) {
      out.push({
        id: `AG-${s.slug.slice(0, 6).toUpperCase()}`,
        target: s.name,
        tone: statusTone('healthy'),
        lastSync: relativeTimeFr(intel.lastRun?.startedAt ?? null),
      })
    }
  }
  return out
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('comments')
  const [forbidden, setForbidden] = useState(false)
  const [pending, setPending] = useState<PendingComment[]>([])
  const [countries, setCountries] = useState<CountryEditorModel[]>([])
  const [agentHealth, setAgentHealth] = useState<AgentHealth | null>(null)
  const [assistRows, setAssistRows] = useState<AssistQueueRow[]>([])
  const [assistFilter, setAssistFilter] = useState('')
  const [assistDetail, setAssistDetail] = useState<{
    id: number
    json: string
    full: boolean
    redactionApplied: boolean
  } | null>(null)
  const [intelligence, setIntelligence] = useState<IntelligenceSummary | null>(null)
  const [intelligenceLoading, setIntelligenceLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [loading, setLoading] = useState(true)

  const loadIntelligence = useCallback(async () => {
    setIntelligenceLoading(true)
    const res = await fetch('/api/admin/intelligence/summary')
    if (res.ok) {
      const data = (await res.json()) as IntelligenceSummary
      setIntelligence(data)
    }
    setIntelligenceLoading(false)
  }, [])

  const loadAgentHealth = useCallback(async () => {
    const healthRes = await fetch('/api/admin/agents/health')
    if (!healthRes.ok) return
    const health = (await healthRes.json()) as AgentHealth
    setAgentHealth(health)
  }, [])

  const loadAssist = useCallback(async () => {
    const res = await fetch('/api/admin/delegated-application-requests')
    if (!res.ok) return
    const data = (await res.json()) as { items?: AssistQueueRow[] }
    setAssistRows(Array.isArray(data.items) ? data.items : [])
  }, [])

  const loadCountries = useCallback(async () => {
    const res = await fetch('/api/countries')
    if (!res.ok) return
    const data = (await res.json()) as Record<string, unknown>[]
    if (!Array.isArray(data)) return
    setCountries(
      data.map((c) => ({
        id: c.id as number,
        name: String(c.name),
        tourist_visa_score: c.tourist_visa_score as number | null,
        study_visa_score: c.study_visa_score as number | null,
        work_visa_score: c.work_visa_score as number | null,
        business_visa_score: c.business_visa_score as number | null,
        appointment_difficulty: c.appointment_difficulty as string | null,
      })),
    )
  }, [])

  useEffect(() => {
    const boot = async () => {
      setLoading(true)
      const res = await fetch('/api/comments?status=PENDING')
      if (res.status === 403 || res.status === 401) {
        setForbidden(true)
        setLoading(false)
        return
      }
      if (res.ok) {
        const data = (await res.json()) as PendingComment[]
        setPending(Array.isArray(data) ? data.filter((c) => c.status === 'PENDING') : [])
      }
      await loadAgentHealth()
      await loadCountries()
      await loadAssist()
      setLoading(false)
    }
    void boot()
  }, [loadAgentHealth, loadAssist, loadCountries])

  useEffect(() => {
    if (tab === 'intelligence') void loadIntelligence()
  }, [tab, loadIntelligence])

  useEffect(() => {
    if (tab === 'assist') void loadAssist()
  }, [tab, loadAssist])

  useEffect(() => {
    if (!autoRefresh) return
    const timer = setInterval(() => {
      void loadAgentHealth()
    }, 10_000)
    return () => clearInterval(timer)
  }, [autoRefresh, loadAgentHealth])

  const updateAssistStatus = async (id: number, status: string) => {
    const res = await fetch(`/api/admin/delegated-application-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setAssistRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    }
  }

  const loadAssistDetail = async (id: number, full: boolean) => {
    const res = await fetch(
      `/api/admin/delegated-application-requests/${id}${full ? '?fullPayload=1' : ''}`,
    )
    if (!res.ok) return
    const data = (await res.json()) as { payload?: unknown; payloadRedactionApplied?: boolean }
    setAssistDetail({
      id,
      json: JSON.stringify(data?.payload ?? {}, null, 2),
      full,
      redactionApplied: Boolean(data?.payloadRedactionApplied),
    })
  }

  const toggleAssistPayload = async (id: number) => {
    if (assistDetail?.id === id) {
      setAssistDetail(null)
      return
    }
    await loadAssistDetail(id, false)
  }

  const filteredAssistRows = useMemo(() => {
    const q = assistFilter.trim().toLowerCase()
    if (!q) return assistRows
    return assistRows.filter((r) => {
      const blob = [
        String(r.id),
        r.category,
        r.packageId,
        r.packageName,
        r.status,
        r.userEmail,
        r.userName ?? '',
        r.contactEmailMasked ?? '',
        r.hasFormContactEmail ? 'form' : '',
        r.createdAt,
      ]
        .join('\n')
        .toLowerCase()
      return blob.includes(q)
    })
  }, [assistRows, assistFilter])

  const approve = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    const res = await fetch(`/api/comments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) setPending((prev) => prev.filter((c) => c.id !== id))
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FAF7EE' }}>
        <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-6 lg:px-8">
          <DashboardPageSkeleton />
        </div>
      </div>
    )
  }

  if (forbidden) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FAF7EE' }}>
        <div className="mx-auto max-w-xl px-5 py-20 text-center sm:px-6">
          <ShieldAlert className="mx-auto mb-5 h-12 w-12 text-rose-600" aria-hidden />
          <h1 className="font-serif text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">
            Accès admin refusé
          </h1>
          <p className="mt-3 font-serif text-base font-medium text-[#0D1B3E]/65">
            Cette zone est réservée aux comptes avec rôle ADMIN.
          </p>
          <Link
            href="/overview"
            className="mt-8 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] underline decoration-[#0D1B3E]/30 underline-offset-4 hover:decoration-[#0D1B3E]"
          >
            ← Retour à l&apos;aperçu
          </Link>
        </div>
      </div>
    )
  }

  const tabs: Array<{ id: Tab; label: string; count?: number }> = [
    { id: 'comments', label: 'Modération' },
    { id: 'countries', label: 'Pays (Editor)' },
    { id: 'assist', label: 'Assist', count: assistRows.length },
    { id: 'intelligence', label: 'Intelligence' },
  ]
  const envBadge =
    typeof process !== 'undefined' && process.env?.NODE_ENV === 'production' ? 'PROD' : 'DEV'

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF7EE' }}>
      <div className="border-b bg-[#0D1B3E]/5 md:hidden" style={{ borderColor: 'rgba(13,27,62,0.10)' }}>
        <p className="mx-auto max-w-6xl px-5 py-2 text-center text-[10px] font-black uppercase tracking-[0.26em] text-[#0D1B3E]/65 sm:px-6">
          Utilisez un écran large pour une édition optimale
        </p>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-5 pb-20 pt-8 sm:space-y-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <span className="font-serif text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">
            VisaFlow
          </span>
          <span
            className="inline-flex items-center self-start rounded-md border border-rose-600/30 bg-rose-600/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.26em] text-rose-700 sm:self-auto"
          >
            {envBadge}
          </span>
          <span aria-hidden className="hidden h-5 w-px bg-[#0D1B3E]/15 sm:block" />
          <div className="min-w-0">
            <h1 className="font-serif text-xl font-black tracking-tight text-[#0D1B3E] sm:text-2xl">
              Citadel Admin Console
            </h1>
            <p className="text-[13px] font-medium text-[#0D1B3E]/55">
              Modération rapide et édition des scores pays (MVP).
            </p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Link
              href="/admin/azimuth"
              className="inline-flex shrink-0 items-center justify-center rounded-md border bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] transition-colors hover:border-[#0D1B3E]"
              style={{ borderColor: 'rgba(13,27,62,0.10)' }}
            >
              Azimuth · Objectif
            </Link>
            <Link
              href="/admin/radar"
              className="inline-flex shrink-0 items-center justify-center rounded-md border bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] transition-colors hover:border-[#0D1B3E]"
              style={{ borderColor: 'rgba(13,27,62,0.10)' }}
            >
              Radar · Sentry
            </Link>
            <Link
              href="/admin/harbor"
              className="inline-flex shrink-0 items-center justify-center rounded-md border bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] transition-colors hover:border-[#0D1B3E]"
              style={{ borderColor: 'rgba(13,27,62,0.10)' }}
            >
              Harbor · Chrome
            </Link>
            <Link
              href="/admin/quay"
              className="inline-flex shrink-0 items-center justify-center rounded-md border bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] transition-colors hover:border-[#0D1B3E]"
              style={{ borderColor: 'rgba(13,27,62,0.10)' }}
            >
              Quay · Nav rail
            </Link>
            <Link
              href="/admin/waypoint"
              className="inline-flex shrink-0 items-center justify-center rounded-md border bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] transition-colors hover:border-[#0D1B3E]"
              style={{ borderColor: 'rgba(13,27,62,0.10)' }}
            >
              Waypoint · Search
            </Link>
            <Link
              href="/admin/runway"
              className="inline-flex shrink-0 items-center justify-center rounded-md border bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] transition-colors hover:border-[#0D1B3E]"
              style={{ borderColor: 'rgba(13,27,62,0.10)' }}
            >
              Runway · Onboarding
            </Link>
            <Link
              href="/admin/rampart"
              className="inline-flex shrink-0 items-center justify-center rounded-md border bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] transition-colors hover:border-[#0D1B3E]"
              style={{ borderColor: 'rgba(13,27,62,0.10)' }}
            >
              Rampart · Edge Auth
            </Link>
            <Link
              href="/admin/flare"
              className="inline-flex shrink-0 items-center justify-center rounded-md border bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] transition-colors hover:border-[#0D1B3E]"
              style={{ borderColor: 'rgba(13,27,62,0.10)' }}
            >
              Flare · Toasts
            </Link>
            <Link
              href="/moderation"
              className="inline-flex shrink-0 items-center justify-center rounded-md border bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] transition-colors hover:border-[#0D1B3E]"
              style={{ borderColor: 'rgba(13,27,62,0.10)' }}
            >
              Vue modération
            </Link>
          </div>
        </header>

        <nav
          aria-label="Onglets admin"
          className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b"
          style={{ borderColor: 'rgba(13,27,62,0.10)' }}
        >
          {tabs.map((t) => {
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative -mb-px pb-3 pt-1 text-[11px] font-black uppercase tracking-[0.22em] transition-colors ${
                  isActive ? 'text-[#0D1B3E]' : 'text-[#0D1B3E]/55 hover:text-[#0D1B3E]'
                }`}
              >
                {t.label}
                {typeof t.count === 'number' ? (
                  <span className="ml-1.5 text-[#0D1B3E]/45">({t.count})</span>
                ) : null}
                {isActive ? (
                  <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] bg-[#0D1B3E]" />
                ) : null}
              </button>
            )
          })}
        </nav>

      {agentHealth && (
        <Card>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <Activity className="h-5 w-5 shrink-0 text-primary" />
                <h2 className="text-lg font-black text-text">Agent Health</h2>
              </div>
              <div className="flex flex-wrap gap-2 sm:ml-auto">
                <button
                  type="button"
                  onClick={() => void loadAgentHealth()}
                  className="rounded-lg border border-line bg-[#f8f2e8] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-muted hover:bg-primary-soft sm:py-1"
                >
                  Refresh now
                </button>
                <button
                  type="button"
                  onClick={() => setAutoRefresh((v) => !v)}
                  className={`rounded-lg border px-3 py-2 text-[10px] font-black uppercase tracking-wider sm:py-1 ${
                    autoRefresh
                      ? 'border-primary/30 bg-primary-soft text-primary'
                      : 'border-line bg-[#f8f2e8] text-muted hover:bg-primary-soft'
                  }`}
                >
                  Auto refresh: {autoRefresh ? 'on' : 'off'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-5">
              <div className="rounded-xl border border-line bg-[#f8f2e8] p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted">Queued</p>
                <p className="text-lg font-black text-text">{agentHealth.taskSummary.queued}</p>
              </div>
              <div className="rounded-xl border border-line bg-[#f8f2e8] p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted">Running</p>
                <p className="text-lg font-black text-text">{agentHealth.taskSummary.running}</p>
              </div>
              <div className="rounded-xl border border-line bg-[#f8f2e8] p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted">Done</p>
                <p className="text-lg font-black text-text">{agentHealth.taskSummary.done}</p>
              </div>
              <div className="rounded-xl border border-line bg-[#f8f2e8] p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted">Failed</p>
                <p className="text-lg font-black text-text">{agentHealth.taskSummary.failed}</p>
              </div>
              <div className="rounded-xl border border-line bg-[#f8f2e8] p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted">Updated 24h</p>
                <p className="text-lg font-black text-text">{agentHealth.countriesUpdatedLast24h ?? 0}</p>
              </div>
            </div>
            <p className="text-xs text-muted">
              state: {agentHealth.stateStatus}
              {agentHealth.stateGeneratedAt ? ` • snapshot: ${new Date(agentHealth.stateGeneratedAt).toLocaleString()}` : ''}
              {agentHealth.degraded ? ' • degraded mode' : ''}
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-line bg-[#f8f2e8] p-3">
                <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-muted">Top Failed Tasks</p>
                {agentHealth.failedTasks && agentHealth.failedTasks.length > 0 ? (
                  <div className="space-y-2">
                    {agentHealth.failedTasks.map((t) => (
                      <div key={t.id} className="rounded-lg border border-[#f3afaf] bg-[#fff0f0] p-2">
                        <p className="text-xs font-black text-danger">
                          {t.country} • {t.domain}
                        </p>
                        <p className="line-clamp-1 text-xs text-muted">{t.query}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted">No failed tasks.</p>
                )}
              </div>

              <div className="rounded-xl border border-line bg-[#f8f2e8] p-3">
                <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-muted">Next Queued Tasks</p>
                {agentHealth.queuedPreview && agentHealth.queuedPreview.length > 0 ? (
                  <div className="space-y-2">
                    {agentHealth.queuedPreview.map((t) => (
                      <div key={t.id} className="rounded-lg border border-line bg-surface p-2">
                        <p className="text-xs font-black text-text">
                          {t.country} • {t.domain}
                        </p>
                        <p className="line-clamp-1 text-xs text-muted">{t.query}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted">No queued tasks.</p>
                )}
              </div>
            </div>

            {agentHealth.visualCoverage && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-line bg-[#f8f2e8] p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted">Visual data image</p>
                  <p className="text-lg font-black text-text">{agentHealth.visualCoverage.withDataImage}</p>
                </div>
                <div className="rounded-xl border border-line bg-[#f8f2e8] p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted">Curated image coverage</p>
                  <p className="text-lg font-black text-text">{agentHealth.visualCoverage.withCuratedImage}</p>
                </div>
                <div className="rounded-xl border border-line bg-[#fff0e8] p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted">Likely generic fallback</p>
                  <p className="text-lg font-black text-warning">{agentHealth.visualCoverage.likelyGenericFallback}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'comments' && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-text">File d&apos;attente ({pending.length})</h2>
          {pending.length === 0 ? (
            <Card className="border-dashed border-line bg-surface">
              <CardContent className="p-10 text-center text-muted">Aucun commentaire PENDING.</CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pending.map((c) => (
                <Card key={c.id} className="border-line bg-surface">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex flex-wrap justify-between gap-2 text-sm text-muted">
                      <span className="font-bold text-text">{c.user.name || 'Anonyme'}</span>
                      <span>{c.country.name}</span>
                    </div>
                    <p className="rounded-xl border border-line bg-[#f8f2e8] p-4 text-muted">&quot;{c.content}&quot;</p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                      <Button
                        type="button"
                        className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-500"
                        onClick={() => void approve(c.id, 'APPROVED')}
                      >
                        <CheckCircle className="h-4 w-4 shrink-0" /> Approuver
                      </Button>
                      <Button type="button" variant="destructive" className="flex-1 gap-2" onClick={() => void approve(c.id, 'REJECTED')}>
                        <XCircle className="h-4 w-4 shrink-0" /> Refuser
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'countries' && (
        <section className="grid gap-4 md:grid-cols-2">
          {countries.map((c) => (
            <CountryEditor key={c.id} country={c} />
          ))}
        </section>
      )}

      {tab === 'assist' && (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <h2 className="text-base font-bold text-text sm:text-lg">
              File Assist candidatures ({filteredAssistRows.length}
              {assistFilter.trim() ? ` / ${assistRows.length}` : ''})
            </h2>
            <Button
              type="button"
              variant="outline"
              className="w-full shrink-0 sm:w-auto"
              onClick={() => void loadAssist()}
            >
              Rafraîchir
            </Button>
          </div>

          {assistRows.length > 0 ? (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-muted">
                Filtrer
                <input
                  type="search"
                  value={assistFilter}
                  onChange={(e) => setAssistFilter(e.target.value)}
                  placeholder="E-mail, statut, forfait, référence…"
                  className="mt-1 w-full max-w-full rounded-xl border border-line bg-[#f8f2e8] px-3 py-2 text-sm font-medium text-text outline-none focus:ring-2 focus:ring-primary/35 sm:max-w-md"
                />
              </label>
            </div>
          ) : null}

          {assistRows.length === 0 ? (
            <Card className="border-dashed border-line bg-surface">
              <CardContent className="p-10 text-center text-muted">Aucune demande enregistrée.</CardContent>
            </Card>
          ) : filteredAssistRows.length === 0 ? (
            <Card className="border-line bg-surface">
              <CardContent className="p-10 text-center text-muted">Aucun résultat pour ce filtre.</CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAssistRows.map((r) => (
                <Card key={r.id} className="border-line bg-surface">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wider text-muted">
                          #{r.id} · {r.category}
                        </p>
                        <p className="break-words text-lg font-black text-text">{r.packageName}</p>
                        {typeof r.priceMad === 'number' ? (
                          <p className="text-sm font-bold text-primary">{formatPriceMad(r.priceMad)}</p>
                        ) : null}
                      </div>
                      <select
                        className="w-full shrink-0 rounded-xl border border-line bg-[#f8f2e8] px-3 py-2 text-xs font-black uppercase tracking-wider text-text sm:w-auto"
                        value={r.status}
                        onChange={(e) => void updateAssistStatus(r.id, e.target.value)}
                      >
                        {DELEGATED_REQUEST_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-2 text-xs text-muted md:grid-cols-2">
                      <div className="break-words">
                        <span className="font-black text-text">Client : </span>
                        {r.userName ?? '—'} ({r.userEmail})
                      </div>
                      <div className="break-all">
                        <span className="font-black text-text">Contact formulaire (masqué) : </span>
                        {r.contactEmailMasked ?? '—'}
                        {r.hasFormContactEmail ? (
                          <span className="ml-1 text-[10px] font-medium text-muted">
                            — dévoiler dans le payload pour copier l’adresse complète
                          </span>
                        ) : null}
                      </div>
                      <div>
                        <span className="font-black text-text">Date : </span>
                        {new Date(r.createdAt).toLocaleString('fr-FR')}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" onClick={() => void toggleAssistPayload(r.id)}>
                          {assistDetail?.id === r.id ? 'Masquer payload' : 'Payload JSON (masqué)'}
                        </Button>
                        <a
                          className="inline-flex rounded-lg border border-line bg-[#f8f2e8] px-3 py-1 text-xs font-bold hover:bg-primary-soft"
                          href={`mailto:${r.userEmail}?subject=${encodeURIComponent(
                            `[VisaFlow Assist] Demande #${r.id}`,
                          )}`}
                        >
                          Répondre (compte client)
                        </a>
                      </div>
                    </div>
                    {assistDetail?.id === r.id ? (
                      <div className="space-y-2">
                        {assistDetail.redactionApplied && !assistDetail.full ? (
                          <p className="text-[11px] font-medium text-amber-800">
                            Affichage masqué par défaut (B.36). Utilisez le bouton ci-dessous pour charger les données
                            sensibles complètes si nécessaire pour traiter la demande.
                          </p>
                        ) : null}
                        <div className="flex flex-wrap gap-2">
                          {assistDetail.redactionApplied && !assistDetail.full ? (
                            <Button
                              type="button"
                              variant="secondary"
                              className="text-xs"
                              onClick={() => void loadAssistDetail(r.id, true)}
                            >
                              Afficher données sensibles (complet)
                            </Button>
                          ) : assistDetail.full ? (
                            <Button
                              type="button"
                              variant="outline"
                              className="text-xs"
                              onClick={() => void loadAssistDetail(r.id, false)}
                            >
                              Revenir à la vue masquée
                            </Button>
                          ) : null}
                        </div>
                        <pre className="max-h-64 overflow-auto rounded-xl border border-line bg-[#101820] p-4 text-[11px] text-emerald-100">
                          {assistDetail.json}
                        </pre>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'intelligence' && (
        <section className="space-y-6">
          {intelligence ? (
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/55">
                Pipeline Health
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
                <div
                  className="rounded-xl border bg-white p-4"
                  style={{ borderColor: 'rgba(13,27,62,0.10)' }}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                    Sources
                  </p>
                  <p className="mt-2 flex items-baseline gap-2 font-serif text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">
                    {intelligence.sourceCount}
                    <span className="text-[11px] font-bold text-[#0D1B3E]/45">active</span>
                  </p>
                </div>
                <div
                  className="rounded-xl border bg-white p-4"
                  style={{ borderColor: 'rgba(13,27,62,0.10)' }}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                    Observations
                  </p>
                  <p className="mt-2 flex items-baseline gap-2 font-serif text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">
                    {formatCompact(intelligence.observationCount)}
                    <span className="text-[11px] font-bold text-[#0D1B3E]/45">total</span>
                  </p>
                </div>
                <div
                  className="rounded-xl border bg-white p-4"
                  style={{ borderColor: 'rgba(13,27,62,0.10)' }}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                    Runs
                  </p>
                  <p className="mt-2 flex items-baseline gap-2 font-serif text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">
                    {runSuccessRate(intelligence.recentRuns)}%
                    <span className="text-[11px] font-bold text-[#0D1B3E]/45">succ</span>
                  </p>
                </div>
                <div
                  className="rounded-xl border bg-white p-4"
                  style={{ borderColor: 'rgba(13,27,62,0.10)' }}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                    Jobs
                  </p>
                  <p className="mt-2 flex items-baseline gap-2 font-serif text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">
                    {intelligence.pipelineJobQueue.pending}
                    <span className="text-[11px] font-bold text-[#0D1B3E]/45">queued</span>
                  </p>
                </div>
                <div
                  className="rounded-xl border bg-white p-4"
                  style={{ borderColor: 'rgba(13,27,62,0.10)' }}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                    Litiges
                  </p>
                  <p className="mt-2 flex items-baseline gap-2 font-serif text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">
                    {intelligence.observationVerification?.disputedCount ??
                      intelligence.pipelineJobQueue.metrics?.disputedObservations ??
                      0}
                    <span className="text-[11px] font-bold text-[#0D1B3E]/45">disputed</span>
                  </p>
                </div>
              </div>
              {intelligence.pipelineJobQueue.alertLevel &&
              intelligence.pipelineJobQueue.alertLevel !== 'ok' ? (
                <p
                  className={`mt-3 text-xs font-bold ${
                    intelligence.pipelineJobQueue.alertLevel === 'critical'
                      ? 'text-danger'
                      : 'text-amber-700'
                  }`}
                >
                  File pipeline : {intelligence.pipelineJobQueue.alertLevel.toUpperCase()}
                  {intelligence.pipelineJobQueue.metrics?.oldestPendingAgeMinutes != null
                    ? ` · plus ancien job en attente ${intelligence.pipelineJobQueue.metrics.oldestPendingAgeMinutes} min`
                    : ''}
                  {intelligence.pipelineJobQueue.metrics?.deadLetterLast24h != null &&
                  intelligence.pipelineJobQueue.metrics.deadLetterLast24h > 0
                    ? ` · dead-letter 24h: ${intelligence.pipelineJobQueue.metrics.deadLetterLast24h}`
                    : ''}
                </p>
              ) : null}
            </div>
          ) : null}

          {agentHealth?.failedTasks || agentHealth?.queuedPreview ? (
            <div
              className="rounded-xl border bg-white"
              style={{ borderColor: 'rgba(13,27,62,0.10)' }}
            >
              <div
                className="flex items-center justify-between border-b px-5 py-3"
                style={{ borderColor: 'rgba(13,27,62,0.10)' }}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/55">
                  System Agents Status
                </p>
                <button
                  type="button"
                  onClick={() => void loadAgentHealth()}
                  className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65 underline decoration-[#0D1B3E]/25 underline-offset-4 transition-colors hover:text-[#0D1B3E] hover:decoration-[#0D1B3E]"
                >
                  View logs
                </button>
              </div>
              <table className="w-full text-left text-sm">
                <thead
                  className="border-b text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55"
                  style={{ borderColor: 'rgba(13,27,62,0.10)' }}
                >
                  <tr>
                    <th className="px-5 py-3">Agent ID</th>
                    <th className="px-5 py-3">Target</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Last sync</th>
                  </tr>
                </thead>
                <tbody>
                  {buildAgentStatusRows(agentHealth, intelligence).map((row) => (
                    <tr
                      key={row.id}
                      className="border-b last:border-0"
                      style={{ borderColor: 'rgba(13,27,62,0.08)' }}
                    >
                      <td className="px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[#0D1B3E]/65">
                        {row.id}
                      </td>
                      <td className="px-5 py-3 font-medium text-[#0D1B3E]">{row.target}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] ${row.tone.text}`}
                        >
                          <span
                            aria-hidden
                            className={`inline-block h-1.5 w-1.5 rounded-full ${row.tone.dot}`}
                          />
                          {row.tone.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono text-[11px] text-[#0D1B3E]/55">
                        {row.lastSync}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <BarChart3 className="h-5 w-5 shrink-0 text-primary" />
              <h2 className="text-lg font-black text-text">Pipeline observations</h2>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full shrink-0 sm:w-auto"
              disabled={intelligenceLoading}
              onClick={() => void loadIntelligence()}
            >
              Rafraîchir
            </Button>
          </div>

          {intelligence?.runAlerts && intelligence.runAlerts.level !== 'ok' ? (
            <div
              className={`flex gap-3 rounded-xl border p-4 ${
                intelligence.runAlerts.level === 'critical'
                  ? 'border-[#f3afaf] bg-[#fff0f0]'
                  : 'border-amber-200 bg-[#fffbeb]'
              }`}
            >
              <AlertTriangle
                className={`mt-0.5 h-6 w-6 shrink-0 ${
                  intelligence.runAlerts.level === 'critical' ? 'text-danger' : 'text-amber-700'
                }`}
              />
              <div className="min-w-0 flex-1 space-y-3 text-sm">
                <div>
                  <p className="font-black text-text">
                    {intelligence.runAlerts.level === 'critical'
                      ? 'Alerte critique : runs sans fin (stuck)'
                      : 'Avertissement : échecs ou runs partiels'}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Seuil blocage : &gt; {intelligence.runAlerts.staleThresholdHours} h sans{' '}
                    <code className="rounded bg-black/5 px-1">finishedAt</code> en statut PENDING/RUNNING.
                    Échecs listés sur les {intelligence.runAlerts.failedLookbackDays} derniers jours.
                  </p>
                </div>
                {intelligence.runAlerts.staleRuns.length > 0 ? (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-danger">
                      Runs bloqués ({intelligence.runAlerts.staleRuns.length})
                    </p>
                    <ul className="mt-1 list-inside list-disc space-y-1 text-xs text-muted">
                      {intelligence.runAlerts.staleRuns.map((r) => (
                        <li key={r.id}>
                          <span className="font-mono text-text">{r.id.slice(0, 8)}…</span> · {r.status} ·{' '}
                          {r.trigger} · {new Date(r.startedAt).toLocaleString('fr-FR')}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {intelligence.runAlerts.recentFailedOrPartial.length > 0 ? (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                      FAILED / PARTIAL ({intelligence.runAlerts.recentFailedOrPartial.length})
                    </p>
                    <ul className="mt-1 list-inside list-disc space-y-1 text-xs text-muted">
                      {intelligence.runAlerts.recentFailedOrPartial.map((r) => (
                        <li key={r.id}>
                          <span className="font-black text-text">{r.status}</span> ·{' '}
                          <span className="font-mono text-text">{r.id.slice(0, 8)}…</span> · {r.trigger} ·{' '}
                          {new Date(r.startedAt).toLocaleString('fr-FR')}
                          {r.errorSummary ? (
                            <span className="mt-0.5 block text-danger line-clamp-2">{r.errorSummary}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <p className="text-[11px] text-muted">
                  CI : <code className="rounded bg-black/5 px-1">npm run intelligence:check-run-alerts</code> (échoue si
                  critique). Option <code className="rounded bg-black/5 px-1">--fail-on-warning</code>.
                </p>
              </div>
            </div>
          ) : null}

          {intelligenceLoading && !intelligence ? (
            <Card className="border-dashed border-line bg-surface">
              <CardContent className="p-10 text-center text-muted">Chargement des agrégats…</CardContent>
            </Card>
          ) : null}

          {!intelligenceLoading && !intelligence ? (
            <Card className="border-line bg-surface">
              <CardContent className="space-y-3 p-6 text-center">
                <p className="text-sm text-muted">Résumé indisponible (tables intelligence ou erreur serveur).</p>
                <Button type="button" variant="outline" onClick={() => void loadIntelligence()}>
                  Réessayer
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {intelligence ? (
            <>
              <IntelligenceSloPanel />
              <IntelligenceCompletenessPanel />
              <IntelligenceReviewQueuePanel />
              <IntelligenceDeadLetterPanel />

              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 lg:grid-cols-4">
                <div className="rounded-xl border border-line bg-[#f8f2e8] p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted">Sources (registre)</p>
                  <p className="text-lg font-black text-text">{intelligence.sourceCount}</p>
                </div>
                <div className="rounded-xl border border-line bg-[#f8f2e8] p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted">Observations</p>
                  <p className="text-lg font-black text-text">{intelligence.observationCount}</p>
                </div>
                <div className="rounded-xl border border-line bg-[#fff8e8] p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted">Sans runId</p>
                  <p className="text-lg font-black text-warning">{intelligence.observationsWithoutRun}</p>
                </div>
                <div className="rounded-xl border border-line bg-[#f8f2e8] p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted">Runs listés</p>
                  <p className="text-lg font-black text-text">{intelligence.recentRuns.length}</p>
                </div>
                <div className="rounded-xl border border-line bg-[#e8f4ff] p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted">Jobs PENDING</p>
                  <p className="text-lg font-black text-text">{intelligence.pipelineJobQueue.pending}</p>
                </div>
                <div className="rounded-xl border border-line bg-[#e8f4ff] p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted">Jobs RUNNING</p>
                  <p className="text-lg font-black text-text">{intelligence.pipelineJobQueue.running}</p>
                </div>
                <div className="rounded-xl border border-line bg-[#fff0f0] p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted">Disputed</p>
                  <p className="text-lg font-black text-danger">
                    {intelligence.observationVerification?.disputedCount ??
                      intelligence.pipelineJobQueue.metrics?.disputedObservations ??
                      0}
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-[#f0fff4] p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted">Verified</p>
                  <p className="text-lg font-black text-text">
                    {intelligence.observationVerification?.verifiedCount ??
                      intelligence.pipelineJobQueue.metrics?.verifiedObservations ??
                      0}
                  </p>
                </div>
              </div>

              {intelligence.lastRun ? (
                <Card className="border-line bg-surface">
                  <CardContent className="space-y-2 p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted">Dernier run</p>
                    <p className="text-sm font-bold text-text">
                      {intelligence.lastRun.status} · {intelligence.lastRun.trigger} ·{' '}
                      {new Date(intelligence.lastRun.startedAt).toLocaleString('fr-FR')}
                    </p>
                    {intelligence.lastRun.errorSummary ? (
                      <p className="text-xs text-danger line-clamp-3">{intelligence.lastRun.errorSummary}</p>
                    ) : null}
                  </CardContent>
                </Card>
              ) : null}

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-line bg-surface">
                  <CardContent className="p-0">
                    <p className="border-b border-line bg-[#f8f2e8] px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted">
                      Volume par source
                    </p>
                    <div className="max-h-72 overflow-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-surface text-[10px] font-black uppercase tracking-wider text-muted">
                          <tr>
                            <th className="px-4 py-2">Source</th>
                            <th className="px-4 py-2">Tier</th>
                            <th className="px-4 py-2 text-right">Obs.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {intelligence.observationsBySource.map((s) => (
                            <tr key={s.sourceId} className="border-t border-line">
                              <td className="px-4 py-2 font-medium text-text">
                                <span className="block font-black">{s.name}</span>
                                <span className="text-[10px] text-muted">{s.slug}</span>
                              </td>
                              <td className="px-4 py-2 text-muted">{s.tier ?? '—'}</td>
                              <td className="px-4 py-2 text-right font-mono font-bold">{s.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-line bg-surface">
                  <CardContent className="p-0">
                    <p className="border-b border-line bg-[#f8f2e8] px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted">
                      Top pays (40)
                    </p>
                    <div className="max-h-72 overflow-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-surface text-[10px] font-black uppercase tracking-wider text-muted">
                          <tr>
                            <th className="px-4 py-2">Pays</th>
                            <th className="px-4 py-2">Région</th>
                            <th className="px-4 py-2 text-right">Obs.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {intelligence.observationsByCountry.map((c) => (
                            <tr key={c.countryId} className="border-t border-line">
                              <td className="px-4 py-2">
                                <Link
                                  href={`/countries/${c.countryId}`}
                                  className="font-black text-primary hover:text-primary-hover"
                                >
                                  {c.name}
                                </Link>
                              </td>
                              <td className="px-4 py-2 text-muted">{c.region ?? '—'}</td>
                              <td className="px-4 py-2 text-right font-mono font-bold">{c.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-line bg-surface">
                <CardContent className="p-0">
                  <p className="border-b border-line bg-[#f8f2e8] px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted">
                    Runs récents (25) — volume observations
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-xs">
                      <thead className="text-[10px] font-black uppercase tracking-wider text-muted">
                        <tr>
                          <th className="px-4 py-2">Début</th>
                          <th className="px-4 py-2">Statut</th>
                          <th className="px-4 py-2">Déclencheur</th>
                          <th className="px-4 py-2 text-right">Obs.</th>
                          <th className="px-4 py-2">Erreur</th>
                        </tr>
                      </thead>
                      <tbody>
                        {intelligence.recentRuns.map((r) => (
                          <tr key={r.id} className="border-t border-line">
                            <td className="whitespace-nowrap px-4 py-2 text-muted">
                              {new Date(r.startedAt).toLocaleString('fr-FR')}
                            </td>
                            <td className="px-4 py-2 font-black text-text">{r.status}</td>
                            <td className="px-4 py-2 text-muted">{r.trigger}</td>
                            <td className="px-4 py-2 text-right font-mono font-bold">{r.observationCount}</td>
                            <td className="max-w-[200px] truncate px-4 py-2 text-danger" title={r.errorSummary ?? ''}>
                              {r.errorSummary ?? '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-line bg-surface">
                <CardContent className="p-0">
                  <p className="border-b border-line bg-[#f8f2e8] px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted">
                    Field paths (top 24)
                  </p>
                  <div className="max-h-64 overflow-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-surface text-[10px] font-black uppercase tracking-wider text-muted">
                        <tr>
                          <th className="px-4 py-2">fieldPath</th>
                          <th className="px-4 py-2 text-right">Obs.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {intelligence.fieldPathBreakdown.map((f) => (
                          <tr key={f.fieldPath} className="border-t border-line">
                            <td className="px-4 py-2 font-mono text-[11px] text-text">{f.fieldPath}</td>
                            <td className="px-4 py-2 text-right font-mono font-bold">{f.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </section>
      )}
      </div>
    </div>
  )
}
