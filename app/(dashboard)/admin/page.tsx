'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Activity,
  CheckCircle,
  Database,
  FileStack,
  MessageSquare,
  ShieldAlert,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'

import { CountryEditor, type CountryEditorModel } from '@/components/admin/CountryEditor'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DELEGATED_REQUEST_STATUSES } from '@/lib/delegated-application-status'
import { formatPriceMad } from '@/lib/delegated-application-catalog'

type Tab = 'comments' | 'countries' | 'assist'

type PendingComment = {
  id: number
  content: string
  status: string
  user: { name: string | null; email: string | null }
  country: { name: string }
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
  contactEmail: string | null
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

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('comments')
  const [forbidden, setForbidden] = useState(false)
  const [pending, setPending] = useState<PendingComment[]>([])
  const [countries, setCountries] = useState<CountryEditorModel[]>([])
  const [agentHealth, setAgentHealth] = useState<AgentHealth | null>(null)
  const [assistRows, setAssistRows] = useState<AssistQueueRow[]>([])
  const [assistDetail, setAssistDetail] = useState<{ id: number; json: string } | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [loading, setLoading] = useState(true)

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

  const toggleAssistPayload = async (id: number, current: typeof assistDetail) => {
    if (current?.id === id) {
      setAssistDetail(null)
      return
    }
    const res = await fetch(`/api/admin/delegated-application-requests/${id}`)
    if (!res.ok) return
    const data = await res.json()
    setAssistDetail({
      id,
      json: JSON.stringify(data?.payload ?? {}, null, 2),
    })
  }

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
      <div className="flex justify-center p-20 text-slate-400">
        <p className="font-bold text-muted">Chargement…</p>
      </div>
    )
  }

  if (forbidden) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <ShieldAlert className="mx-auto mb-4 h-14 w-14 text-danger" />
        <h1 className="text-2xl font-black text-text">Accès admin refusé</h1>
        <p className="mt-2 text-muted">Cette zone est réservée aux comptes avec rôle ADMIN.</p>
        <Link href="/overview" className="mt-6 inline-block text-sm font-bold text-primary hover:text-primary-hover">
          Retour à l&apos;aperçu
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-24">
      <div>
        <h1 className="text-3xl font-black text-text">Administration</h1>
        <p className="mt-1 text-sm text-muted">Modération rapide et édition des scores pays (MVP).</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={tab === 'comments' ? 'default' : 'outline'} type="button" onClick={() => setTab('comments')}>
          <MessageSquare className="h-4 w-4" /> Commentaires
        </Button>
        <Button variant={tab === 'countries' ? 'default' : 'outline'} type="button" onClick={() => setTab('countries')}>
          <Database className="h-4 w-4" /> Données pays
        </Button>
        <Button variant={tab === 'assist' ? 'default' : 'outline'} type="button" onClick={() => setTab('assist')}>
          <FileStack className="h-4 w-4" /> Assist ({assistRows.length})
        </Button>
        <Link href="/moderation" className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-bold text-muted hover:bg-primary-soft">
          Vue modération complète
        </Link>
      </div>

      {agentHealth && (
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-black text-text">Agent Health</h2>
              <button
                type="button"
                onClick={() => void loadAgentHealth()}
                className="ml-auto rounded-lg border border-line bg-[#f8f2e8] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-muted hover:bg-primary-soft"
              >
                Refresh now
              </button>
              <button
                type="button"
                onClick={() => setAutoRefresh((v) => !v)}
                className={`rounded-lg border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                  autoRefresh
                    ? 'border-primary/30 bg-primary-soft text-primary'
                    : 'border-line bg-[#f8f2e8] text-muted hover:bg-primary-soft'
                }`}
              >
                Auto refresh: {autoRefresh ? 'on' : 'off'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
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
                    <div className="flex gap-3">
                      <Button type="button" className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-500" onClick={() => void approve(c.id, 'APPROVED')}>
                        <CheckCircle className="h-4 w-4" /> Approuver
                      </Button>
                      <Button type="button" variant="destructive" className="flex-1 gap-2" onClick={() => void approve(c.id, 'REJECTED')}>
                        <XCircle className="h-4 w-4" /> Refuser
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-text">File Assist candidatures ({assistRows.length})</h2>
            <Button type="button" variant="outline" onClick={() => void loadAssist()}>
              Rafraîchir
            </Button>
          </div>

          {assistRows.length === 0 ? (
            <Card className="border-dashed border-line bg-surface">
              <CardContent className="p-10 text-center text-muted">Aucune demande enregistrée.</CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {assistRows.map((r) => (
                <Card key={r.id} className="border-line bg-surface">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-muted">
                          #{r.id} · {r.category}
                        </p>
                        <p className="text-lg font-black text-text">{r.packageName}</p>
                        {typeof r.priceMad === 'number' ? (
                          <p className="text-sm font-bold text-primary">{formatPriceMad(r.priceMad)}</p>
                        ) : null}
                      </div>
                      <select
                        className="rounded-xl border border-line bg-[#f8f2e8] px-3 py-2 text-xs font-black uppercase tracking-wider text-text"
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
                      <div>
                        <span className="font-black text-text">Client : </span>
                        {r.userName ?? '—'} ({r.userEmail})
                      </div>
                      <div>
                        <span className="font-black text-text">Contact formulaire : </span>
                        {r.contactEmail ?? '—'}
                      </div>
                      <div>
                        <span className="font-black text-text">Date : </span>
                        {new Date(r.createdAt).toLocaleString('fr-FR')}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" onClick={() => void toggleAssistPayload(r.id, assistDetail)}>
                          {assistDetail?.id === r.id ? 'Masquer payload' : 'Payload JSON'}
                        </Button>
                        {r.contactEmail ? (
                          <a
                            className="inline-flex rounded-lg border border-line bg-[#f8f2e8] px-3 py-1 text-xs font-bold hover:bg-primary-soft"
                            href={`mailto:${r.contactEmail}?subject=${encodeURIComponent(
                              `[VisaFlow Assist] Demande #${r.id}`,
                            )}`}
                          >
                            Répondre
                          </a>
                        ) : null}
                      </div>
                    </div>
                    {assistDetail?.id === r.id ? (
                      <pre className="max-h-64 overflow-auto rounded-xl border border-line bg-[#101820] p-4 text-[11px] text-emerald-100">
                        {assistDetail.json}
                      </pre>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
