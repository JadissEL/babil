'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { 
  Globe, 
  MapPin, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Heart,
  Printer
} from 'lucide-react'

import { DrivingRightsIntelSection } from '@/components/driving/DrivingRightsIntelSection'
import { CountryDbInsightsCollapsible } from '@/components/country/CountryDbInsightsCollapsible'
import { IntelligenceProvenanceCollapsible } from '@/components/country/IntelligenceProvenanceCollapsible'
import GoogleAd from '@/components/GoogleAd'
import { VisitReasonsSection } from '@/components/country/VisitReasonsSection'
import { TravelerQuotesSection } from '@/components/country/TravelerQuotesSection'
import { PhDStudiesCountryTeaser } from '@/components/country/PhDStudiesCountryTeaser'
import { buildCountryExperienceContent } from '@/lib/country-experience-content'
import { materializeCountryApiRow } from '@/lib/country-full-data-materialize'
import { enrichCountryApiRecord } from '@/lib/enrich-country-api'
import { filterPublicCountryInsights } from '@/lib/country-db-insights'
import { materializeDrivingRightsIntel } from '@/lib/driving-rights-intel'
import { buildPhdStudies, hasCountryPhdStoredData } from '@/lib/country-phd-studies'
import { isSchengenMember } from '@/lib/schengen-members'
import { buildCountrySheetSignals, formatCountrySheetSignalsSummary } from '@/lib/probability-result-display'
import { appToast } from '@/lib/toast-store'
import { formatIntelDateShortFr, isEconomyIntelFresh, latestMaterializedIsoFromIntelMeta } from '@/lib/intel-freshness'

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v))
const toNum = (v: any, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function moroccoRealityText(full: Record<string, unknown>): string {
  const mi = full.morocco_insights as Record<string, unknown> | undefined
  const r = mi?.reality
  return typeof r === 'string' && r.trim() ? r.trim() : 'Analyse en cours…'
}

function moroccoProTipText(full: Record<string, unknown>): string {
  const mi = full.morocco_insights as Record<string, unknown> | undefined
  const t = mi?.pro_tip
  return typeof t === 'string' && t.trim() ? t.trim() : '—'
}

function fmtBrutalReality(v: unknown): string {
  if (typeof v === 'number' && Number.isFinite(v)) return `${v}/10`
  if (typeof v === 'string' && v.trim()) return `${v.trim()}/10`
  return '—'
}

function fmtFrictionBlock(v: unknown): string {
  if (typeof v === 'number' && Number.isFinite(v)) return `${v}/100`
  if (typeof v === 'string' && v.trim()) return `${v.trim()}/100`
  return '—'
}

function fmtConfidencePct(v: unknown): string {
  if (typeof v === 'number' && Number.isFinite(v)) return `${Math.round(v)}%`
  if (typeof v === 'string' && v.trim()) return (v as string).includes('%') ? (v as string).trim() : `${(v as string).trim()}%`
  return '—'
}

function fmtAcceptanceRate(v: unknown): string {
  if (typeof v === 'string' && v.trim()) return v.trim()
  if (typeof v === 'number' && Number.isFinite(v)) return `${v}%`
  return '—'
}

function readFiniteNumber(v: unknown): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null
  return v
}

function fmtIntlFrInteger(n: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n)
}

function fmtUsdCompact(n: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n)
}

function fmtUsdInteger(n: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

function fmtLifeExpectancyYears(n: number): string {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(n)} ans`
}

/** Part de la population active sans emploi (série WB / OIT), en %. */
function fmtUnemploymentLaborForcePct(n: number): string {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(n)} %`
}

function scoreTone(score: number) {
  if (score >= 75) return 'border-[#94dfbd] bg-[#e9f9f1] text-success'
  if (score >= 55) return 'border-[#f2c27a] bg-[#fff5e7] text-warning'
  if (score >= 35) return 'border-[#f3afaf] bg-[#fff0f0] text-danger'
  return 'border-line bg-inset text-text'
}

function scoreLabel(score: number) {
  if (score >= 75) return 'Facile'
  if (score >= 55) return 'Moyenne'
  if (score >= 35) return 'Difficile'
  return 'Critique'
}

function barTone(score: number) {
  if (score >= 75) return 'bg-emerald-500'
  if (score >= 55) return 'bg-amber-500'
  if (score >= 35) return 'bg-red-500'
  return 'bg-[#94a3b8]'
}

export default function CountryDetailPage() {
  const params = useParams()
  const id = params?.id
  const { user } = useUser()
  const [country, setCountry] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [favorited, setFavorited] = useState(false)
  const [favLoading, setFavLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/countries/${id}`)
      .then(async (res) => {
        const payload = await res.json()
        if (!res.ok) throw new Error(payload?.error || 'Failed to load country')
        return payload
      })
      .then(data => {
        setCountry(data)
        setLoading(false)
      })
      .catch((error) => {
        setCountry({ error: String(error?.message || error || 'Country not found') })
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    if (!user || !id) return
    fetch(`/api/user/favorites?countryId=${id}`)
      .then((res) => res.json())
      .then((data) => {
        setFavorited(Boolean(data?.favorited))
      })
      .catch(() => {})
  }, [user, id])

  useEffect(() => {
    if (!user || !id) return
    // light history tracking (best-effort)
    fetch('/api/user/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'VIEW_COUNTRY', payload: { countryId: parseInt(id as string) } }),
    }).catch(() => {})
  }, [user, id])

  const toggleFavorite = async () => {
    if (!user || !id) return
    setFavLoading(true)
    try {
      const res = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryId: parseInt(id as string) }),
      })
      if (res.ok) {
        const data = await res.json()
        const next = Boolean(data?.favorited)
        setFavorited(next)
        appToast.success(next ? 'Ajouté aux favoris.' : 'Retiré des favoris.')
      } else {
        const err = await res.json().catch(() => ({}))
        appToast.error(typeof err?.error === 'string' ? err.error : 'Impossible de mettre à jour les favoris.')
      }
    } catch {
      appToast.error('Erreur réseau — favoris non enregistrés.')
    } finally {
      setFavLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !comment.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryId: parseInt(id as string),
          content: comment
        })
      })

      if (res.ok) {
        setComment('')
        setMessage('Merci ! Votre commentaire est en attente de modération.')
        appToast.success('Commentaire envoyé — modération en cours.')
        setTimeout(() => setMessage(''), 5000)
      } else {
        const err = await res.json().catch(() => ({}))
        appToast.error(typeof err?.error === 'string' ? err.error : 'Envoi du commentaire refusé.')
      }
    } catch (error) {
      console.error(error)
      appToast.error('Erreur réseau — commentaire non envoyé.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )

  if (!country || country.error) {
    return (
      <div className="p-20 text-center font-bold text-muted">
        {country?.error ? `Erreur: ${country.error}` : 'Pays non trouvé.'}
      </div>
    )
  }

  const full = country.full_data as Record<string, unknown>
  const appointmentAudit = full.appointment_audit as Record<string, unknown> | undefined
  const visaSystem = full.visa_system as Record<string, unknown> | undefined
  const visaTourism = visaSystem?.tourism as Record<string, unknown> | undefined
  const visaWork = visaSystem?.work as Record<string, unknown> | undefined
  const experienceContent = buildCountryExperienceContent(country.name, full)
  const showPhdTeaser = hasCountryPhdStoredData(full as Record<string, unknown>)
  const phdModel = showPhdTeaser ? buildPhdStudies(country.name, full as Record<string, unknown>) : null
  const row = materializeCountryApiRow(country)
  const enriched = enrichCountryApiRecord(row)
  const tourismScore = enriched._visa.tourism
  const studyScore = enriched._visa.study
  const workScore = enriched._visa.work
  const businessScore = enriched._visa.business
  const frictionScore = enriched._friction
  const finalScore = enriched._finalScore
  const drivingIntel = materializeDrivingRightsIntel(full as Record<string, unknown>)
  const dbInsightRows = filterPublicCountryInsights(country.insights)

  const economyBlock = full.economy as Record<string, unknown> | undefined
  const healthBlock = full.health as Record<string, unknown> | undefined
  const workBlock = full.work as Record<string, unknown> | undefined
  const intelMeta = full._intelligence as Record<string, unknown> | undefined
  const popWb = readFiniteNumber(economyBlock?.population_wb)
  const gdpUsd = readFiniteNumber(economyBlock?.gdp_usd)
  const gdpCap = readFiniteNumber(economyBlock?.gdp_per_capita_usd)
  const lifeExp = readFiniteNumber(healthBlock?.life_expectancy_years)
  const unempPct = readFiniteNumber(workBlock?.unemployment_rate_pct)
  const hasWbIndicators = [popWb, gdpUsd, gdpCap, lifeExp, unempPct].some((v) => v != null)
  const intelUpdated =
    typeof intelMeta?.economy_materialized_at === 'string' && intelMeta.economy_materialized_at.trim()
      ? intelMeta.economy_materialized_at.trim()
      : null
  const economyIntelFresh = isEconomyIntelFresh(intelUpdated)

  return (
    <>
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-2 sm:px-6 lg:px-8 print:hidden">
      <Link
        href="/explorer"
        className="mb-6 flex items-center gap-2 font-bold text-muted transition-colors hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" /> Retour à l&apos;explorateur
      </Link>

      <div className="mb-8 flex min-w-0 flex-col gap-4 rounded-[2rem] border border-line bg-surface p-5 shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted">Décision rapide</p>
          <p className="mt-1 text-sm font-bold text-text">
            {country.name} {'→'} potentiel{' '}
            {studyScore >= 70 ? 'études' : tourismScore >= 70 ? 'tourisme' : 'mixte'}, friction{' '}
            {(scoreLabel(frictionScore)).toLowerCase()}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {economyIntelFresh && intelLatest ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#94dfbd]/70 bg-[#e9f9f1] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-success"
              title={`Dernière matérialisation intelligence : ${formatIntelDateShortFr(intelLatest)}`}
            >
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Données fraîches
            </span>
          ) : null}
          <span className={`rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest ${scoreTone(finalScore)}`}>
            Score final {finalScore}/100
          </span>
          <Link
            href="/schengen"
            className="rounded-xl border border-line bg-inset px-4 py-2 text-xs font-black uppercase tracking-widest text-text transition-colors hover:border-primary/40 hover:bg-primary-soft"
          >
            Vue Schengen
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-inset px-4 py-2 text-xs font-black uppercase tracking-widest text-text transition-colors hover:border-primary/40 hover:bg-primary-soft"
          >
            <Printer className="h-4 w-4" />
            Imprimer / PDF
          </button>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Left Column: Main Info */}
        <div className="min-w-0 space-y-12 lg:col-span-2">
          <section>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="rounded-[2rem] bg-primary p-4 text-white shadow-soft">
                  <Globe className="h-8 w-8" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-3xl font-black tracking-tight text-text sm:text-4xl md:text-5xl">{country.name}</h1>
                  <p className="mt-1 flex items-center gap-2 font-medium text-muted">
                    <MapPin className="h-4 w-4" /> {country.region} {isSchengenMember(String(country.name ?? '')) && '• Schengen'}
                  </p>
                </div>
              </div>
              {user && (
                <button
                  type="button"
                  onClick={toggleFavorite}
                  disabled={favLoading}
                  className={`flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-black transition-all sm:ml-auto sm:w-auto ${
                    favorited
                      ? 'border-red-500/35 bg-red-500/15 text-red-300 hover:bg-red-500/25'
                      : 'border-line bg-inset text-text hover:bg-primary-soft'
                  } ${favLoading ? 'opacity-60' : ''}`}
                >
                  <Heart className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} />
                  {favorited ? 'Favori' : 'Ajouter aux favoris'}
                </button>
              )}
            </div>

            <div className="rounded-[2.5rem] border border-line bg-surface p-8 shadow-card">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-black text-text">
                <TrendingUp className="h-5 w-5 text-primary" /> Réalité terrain
              </h2>
              <div className="max-w-none">
                <p className="text-lg font-medium italic leading-relaxed text-muted">
                  &quot;{moroccoRealityText(full as Record<string, unknown>)}&quot;
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-line bg-inset p-4 text-center">
                  <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted">Score réalité</div>
                  <div className="text-2xl font-black text-text">{fmtBrutalReality(full.brutal_reality_score)}</div>
                </div>
                <div className="rounded-2xl border border-line bg-inset p-4 text-center">
                  <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted">Acceptation</div>
                  <div className="text-2xl font-black text-text">{fmtAcceptanceRate(full.acceptance_rate_morocco)}</div>
                </div>
                <div className="rounded-2xl border border-line bg-inset p-4 text-center">
                  <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted">Friction RDV</div>
                  <div className="text-2xl font-black text-text">{fmtFrictionBlock(full.friction_score)}</div>
                </div>
                <div className="rounded-2xl border border-line bg-inset p-4 text-center">
                  <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted">Confiance</div>
                  <div className="text-2xl font-black text-text">{fmtConfidencePct(full.confidence_score)}</div>
                </div>
              </div>

              {hasWbIndicators ? (
                <div className="mt-8 rounded-2xl border border-primary/20 bg-primary-soft/40 p-5">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-primary">
                    Indicateurs (World Bank, matérialisés)
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {popWb != null ? (
                      <div className="rounded-xl border border-line bg-surface px-3 py-2 text-center">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-muted">Population</div>
                        <div className="text-sm font-black text-text">{fmtIntlFrInteger(popWb)}</div>
                      </div>
                    ) : null}
                    {gdpUsd != null ? (
                      <div className="rounded-xl border border-line bg-surface px-3 py-2 text-center">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-muted">PIB (USD)</div>
                        <div className="text-sm font-black text-text">{fmtUsdCompact(gdpUsd)}</div>
                      </div>
                    ) : null}
                    {gdpCap != null ? (
                      <div className="rounded-xl border border-line bg-surface px-3 py-2 text-center">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-muted">PIB / hab.</div>
                        <div className="text-sm font-black text-text">{fmtUsdInteger(gdpCap)}</div>
                      </div>
                    ) : null}
                    {lifeExp != null ? (
                      <div className="rounded-xl border border-line bg-surface px-3 py-2 text-center">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-muted">Espérance de vie</div>
                        <div className="text-sm font-black text-text">{fmtLifeExpectancyYears(lifeExp)}</div>
                      </div>
                    ) : null}
                    {unempPct != null ? (
                      <div className="rounded-xl border border-line bg-surface px-3 py-2 text-center">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-muted">Chômage (actifs)</div>
                        <div className="text-sm font-black text-text">{fmtUnemploymentLaborForcePct(unempPct)}</div>
                      </div>
                    ) : null}
                  </div>
                  {intelUpdated ? (
                    <p className="mt-3 text-[10px] font-medium text-muted">
                      Dernière mise à jour des indicateurs :{' '}
                      {new Date(intelUpdated).toLocaleString('fr-FR', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <IntelligenceProvenanceCollapsible
                countryId={String(Array.isArray(id) ? id[0] ?? '' : id ?? '')}
              />

              <CountryDbInsightsCollapsible rows={dbInsightRows} />

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <ScoreBar label="Visa tourisme" value={tourismScore} />
                <ScoreBar label="Visa études" value={studyScore} />
                <ScoreBar label="Visa travail" value={workScore} />
                <ScoreBar label="Visa affaires" value={businessScore} />
              </div>
            </div>

            <GoogleAd slot="country_detail_mid" />
          </section>

          {/* Appointment Audit */}
          <section className="rounded-[2.5rem] border border-line bg-surface p-8 shadow-card">
            <h2 className="mb-8 flex items-center gap-2 text-xl font-black text-text">
              <Clock className="h-5 w-5 text-accent" /> Audit des rendez-vous
            </h2>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <span className="text-sm font-bold text-muted">Plateforme</span>
                  <span className="font-black text-text">{String(appointmentAudit?.platform ?? '')}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <span className="text-sm font-bold text-muted">Difficulté réelle</span>
                  <span className="font-black text-danger">{String(appointmentAudit?.real_difficulty ?? '')}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <span className="text-sm font-bold text-muted">Délai moyen</span>
                  <span className="font-black text-text">{String(appointmentAudit?.avg_wait_time ?? '')}</span>
                </div>
              </div>

              <div className="rounded-3xl border border-[#f3afaf] bg-[#fff0f0] p-6">
                <h4 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-danger">
                  <AlertTriangle className="h-4 w-4" /> Problèmes signalés (OSINT)
                </h4>
                <ul className="space-y-3">
                  {((appointmentAudit?.issues as string[] | undefined) || []).map((issue: string, i: number) => (
                    <li key={i} className="flex gap-2 text-sm font-bold text-danger">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0" /> {issue}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <DrivingRightsIntelSection countryName={country.name} countryId={id as string} intel={drivingIntel} />

          {showPhdTeaser && phdModel ? (
            <PhDStudiesCountryTeaser
              countryId={String(Array.isArray(id) ? id[0] ?? '' : id ?? '')}
              countryName={country.name}
              model={phdModel}
            />
          ) : null}

          <VisitReasonsSection
            countryName={country.name}
            reasons={experienceContent.reasons}
            countryId={id as string}
            previewOnly
          />

          <TravelerQuotesSection
            countryName={country.name}
            quotes={experienceContent.quotes}
            countryId={id as string}
            previewOnly
          />

          {/* Community Comments */}
          <section className="space-y-6">
            <h2 className="flex items-center gap-3 text-2xl font-black text-text">
              <MessageSquare className="h-6 w-6 text-primary" /> Retours de la communauté
            </h2>

            {user ? (
              <form
                onSubmit={handleSubmitComment}
                className="space-y-4 rounded-[2rem] border border-primary/25 bg-surface p-6 shadow-soft"
              >
                <textarea
                  className="min-h-[100px] w-full rounded-2xl border border-line bg-inset p-4 font-medium text-text outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/50"
                  placeholder="Partagez votre expérience (rendez-vous, refus, accueil…)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[10px] font-bold italic text-muted">
                    Votre avis sera publié après validation par un modérateur.
                  </p>
                  <button
                    type="submit"
                    disabled={submitting || !comment.trim()}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-black text-white transition-all hover:bg-primary-hover disabled:opacity-50"
                  >
                    {submitting ? (
                      'Envoi…'
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Publier
                      </>
                    )}
                  </button>
                </div>
                {message && <p className="text-xs font-bold text-success">{message}</p>}
              </form>
            ) : (
              <div className="rounded-[2rem] border border-line bg-inset p-8 text-center">
                <p className="font-bold text-muted">Connectez-vous pour partager votre expérience.</p>
              </div>
            )}

            <div className="space-y-4">
              {country.comments?.length > 0 ? (
                country.comments.map((c: any) => (
                  <div key={c.id} className="rounded-3xl border border-line bg-surface p-6 shadow-soft">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-xs font-black text-primary ring-1 ring-primary/35">
                          {c.user.name?.[0] || 'U'}
                        </div>
                        <span className="text-sm font-black text-text">{c.user.name}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-medium leading-relaxed text-muted">{c.content}</p>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="font-bold italic text-muted">Aucun retour pour le moment. Soyez le premier !</p>
                </div>
              )}
            </div>
          </section>
        </div>

          {/* Right Column: Sidebar Stats */}
          <div className="space-y-8">
            <div className="sticky top-24 rounded-[2.5rem] border border-line bg-surface p-8 shadow-card lg:top-28">
              <h3 className="mb-8 flex items-center gap-2 text-xl font-black text-text">
                <ShieldCheck className="h-5 w-5 text-success" /> Contexte ambassade
              </h3>
              
              <div className="space-y-8">
                <div>
                  <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted">
                    Comportement consulaire
                  </div>
                  <p className="text-sm font-bold leading-relaxed text-text">
                    {typeof full.embassy_behavior === 'string' && full.embassy_behavior.trim()
                      ? full.embassy_behavior
                      : '—'}
                  </p>
                </div>

                <div className="border-t border-line pt-8">
                  <div className="mb-4 text-[10px] font-black uppercase tracking-widest text-muted">Système de visa</div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted">Tourisme</span>
                      <span className="rounded-lg bg-inset px-2 py-1 text-xs font-black text-text">
                        {(visaTourism?.difficulty as string | undefined) ?? '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted">Travail</span>
                      <span className="rounded-lg bg-inset px-2 py-1 text-xs font-black text-text">
                        {(visaWork?.availability as string | undefined) || 'Limitée'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-line pt-8">
                  <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted">
                    Synthèse des scores
                  </div>
                  <div className="space-y-3">
                    <SidebarBar
                      label="Moyenne visas"
                      value={Math.round((tourismScore + studyScore + workScore + businessScore) / 4)}
                    />
                    <SidebarBar label="Lecture friction" value={frictionScore} />
                    <SidebarBar label="Score global" value={finalScore} />
                  </div>
                </div>

                <div className="border-t border-line pt-8">
                  <div className="rounded-2xl border border-primary/30 bg-primary-soft p-4">
                    <h4 className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                      <CheckCircle2 className="w-3 h-3" /> Conseil (Darija)
                    </h4>
                    <p className="text-sm font-black italic text-text">
                      &quot;{moroccoProTipText(full as Record<string, unknown>)}&quot;
                    </p>
                  </div>
                </div>

                <div className="border-t border-line pt-8">
                  <GoogleAd slot="country_detail_sidebar" />
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>

      <div
        className="hidden bg-white px-8 py-10 text-[14px] leading-relaxed text-gray-900 print:block"
        aria-hidden
      >
        <header className="mb-6 border-b border-gray-300 pb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">VisaFlow — résumé fiche pays</p>
          <h1 className="mt-2 text-2xl font-black text-gray-900">{country.name}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {country.region}
            {isSchengenMember(String(country.name ?? '')) ? ' · Schengen' : ''} —{' '}
            {new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' })}
          </p>
        </header>

        {intelUpdated ? (
          <p className="mb-4 text-[11px] text-gray-600">
            Données économie (dernière matérialisation) :{' '}
            {new Date(intelUpdated).toLocaleDateString('fr-FR', { dateStyle: 'medium' })}
          </p>
        ) : null}

        <section className="mb-5">
          <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-gray-800">Scores indicatifs (0–100)</h2>
          <table className="w-full max-w-lg text-left text-sm">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-1.5 pr-4 font-medium text-gray-700">Score final</td>
                <td className="py-1.5 font-bold">{finalScore}</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4 font-medium text-gray-700">Visa tourisme</td>
                <td className="py-1.5">{tourismScore}</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4 font-medium text-gray-700">Visa études</td>
                <td className="py-1.5">{studyScore}</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4 font-medium text-gray-700">Visa travail</td>
                <td className="py-1.5">{workScore}</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4 font-medium text-gray-700">Visa affaires</td>
                <td className="py-1.5">{businessScore}</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4 font-medium text-gray-700">Friction (lecture)</td>
                <td className="py-1.5">{frictionScore}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="mb-5">
          <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-gray-800">Indicateurs terrain (extraits)</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-gray-800">
            <li>Score réalité : {fmtBrutalReality(full.brutal_reality_score)}</li>
            <li>Acceptation (indicateur) : {fmtAcceptanceRate(full.acceptance_rate_morocco)}</li>
            <li>Friction RDV : {fmtFrictionBlock(full.friction_score)}</li>
            <li>Confiance données : {fmtConfidencePct(full.confidence_score)}</li>
          </ul>
        </section>

        <section className="mb-5">
          <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-gray-800">Signaux (synthèse moteur)</h2>
          <p className="text-sm text-gray-800">
            {formatCountrySheetSignalsSummary(buildCountrySheetSignals(full as Record<string, unknown>)) ?? '—'}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-gray-800">Réalité terrain (citation)</h2>
          <p className="text-sm italic text-gray-800">&quot;{moroccoRealityText(full as Record<string, unknown>)}&quot;</p>
        </section>

        <footer className="border-t border-gray-200 pt-4 text-[10px] leading-snug text-gray-600">
          <p>
            Document informatif généré depuis VisaFlow. Les scores, signaux et textes ne constituent pas un conseil
            juridique ni une garantie d&apos;obtention de visa ou de titre de séjour. Vérifiez systématiquement auprès
            des autorités consulaires et du droit applicable.
          </p>
        </footer>
      </div>
    </>
  )
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted">
        <span>{label}</span>
        <span className="text-text">{Number.isInteger(value) ? value : value.toFixed(1)}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#eadfcf]">
        <div className={`h-full ${barTone(value)}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function SidebarBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted">
        <span>{label}</span>
        <span className="text-muted">{Number.isInteger(value) ? value : value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#eadfcf]">
        <div className={`h-full ${barTone(value)}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
