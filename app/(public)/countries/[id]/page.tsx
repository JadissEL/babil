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
  Heart
} from 'lucide-react'

import GoogleAd from '@/components/GoogleAd'
import { VisitReasonsSection } from '@/components/country/VisitReasonsSection'
import { TravelerQuotesSection } from '@/components/country/TravelerQuotesSection'
import { buildCountryExperienceContent } from '@/lib/country-experience-content'

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v))
const toNum = (v: any, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function scoreTone(score: number) {
  if (score >= 75) return 'border-[#94dfbd] bg-[#e9f9f1] text-success'
  if (score >= 55) return 'border-[#f2c27a] bg-[#fff5e7] text-warning'
  if (score >= 35) return 'border-[#f3afaf] bg-[#fff0f0] text-danger'
  return 'border-line bg-[#f8f2e8] text-text'
}

function scoreLabel(score: number) {
  if (score >= 75) return 'Easy'
  if (score >= 55) return 'Medium'
  if (score >= 35) return 'Hard'
  return 'Critical'
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
        setFavorited(Boolean(data?.favorited))
      }
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
        setTimeout(() => setMessage(''), 5000)
      }
    } catch (error) {
      console.error(error)
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

  const full =
    country.full_data && typeof country.full_data === 'object' ? country.full_data : {}
  const experienceContent = buildCountryExperienceContent(country.name, full)
  const tourismScore = clamp(Math.round(toNum(country.tourist_visa_score, 5) * 10))
  const studyScore = clamp(Math.round(toNum(country.study_visa_score, 5) * 10))
  const workScore = clamp(Math.round(toNum(country.work_visa_score, 5) * 10))
  const businessScore = clamp(Math.round(toNum(country.business_visa_score, 5) * 10))
  const frictionScore = clamp(100 - toNum(full.friction_score, 50))
  const finalScore = clamp(Math.round((tourismScore + studyScore + workScore + businessScore) / 4 * 0.65 + frictionScore * 0.35))

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-2 sm:px-6 lg:px-8">
      <Link
        href="/explorer"
        className="mb-6 flex items-center gap-2 font-bold text-muted transition-colors hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" /> Retour à l&apos;explorateur
      </Link>

      <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-line bg-surface p-5 shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted">Quick decision</p>
          <p className="mt-1 text-sm font-bold text-text">
            {country.name} {'→'} potentiel{' '}
            {studyScore >= 70 ? 'études' : tourismScore >= 70 ? 'tourisme' : 'mixte'}, friction{' '}
            {scoreLabel(frictionScore).toLowerCase()}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest ${scoreTone(finalScore)}`}>
            Final score {finalScore}/100
          </span>
          <Link
            href="/schengen"
            className="rounded-xl border border-line bg-[#f8f2e8] px-4 py-2 text-xs font-black uppercase tracking-widest text-text transition-colors hover:border-primary/40 hover:bg-primary-soft"
          >
            Schengen Hub
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="rounded-[2rem] bg-primary p-4 text-white shadow-soft">
                <Globe className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-text md:text-5xl">{country.name}</h1>
                <p className="mt-1 flex items-center gap-2 font-medium text-muted">
                  <MapPin className="h-4 w-4" /> {country.region} {country.schengen_flag && '• Schengen'}
                </p>
              </div>
              {user && (
                <button
                  type="button"
                  onClick={toggleFavorite}
                  disabled={favLoading}
                  className={`ml-auto flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-black transition-all ${
                    favorited
                      ? 'border-red-500/35 bg-red-500/15 text-red-300 hover:bg-red-500/25'
                      : 'border-line bg-[#f8f2e8] text-text hover:bg-primary-soft'
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
                  &quot;{full.morocco_insights?.reality || 'Analyse en cours…'}&quot;
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-line bg-[#f8f2e8] p-4 text-center">
                  <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted">Score réalité</div>
                  <div className="text-2xl font-black text-text">{full.brutal_reality_score}/10</div>
                </div>
                <div className="rounded-2xl border border-line bg-[#f8f2e8] p-4 text-center">
                  <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted">Acceptation</div>
                  <div className="text-2xl font-black text-text">{full.acceptance_rate_morocco}</div>
                </div>
                <div className="rounded-2xl border border-line bg-[#f8f2e8] p-4 text-center">
                  <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted">Friction RDV</div>
                  <div className="text-2xl font-black text-text">{full.friction_score}/100</div>
                </div>
                <div className="rounded-2xl border border-line bg-[#f8f2e8] p-4 text-center">
                  <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted">Confiance</div>
                  <div className="text-2xl font-black text-text">{full.confidence_score}%</div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <ScoreBar label="Visa tourism" value={tourismScore} />
                <ScoreBar label="Visa study" value={studyScore} />
                <ScoreBar label="Visa work" value={workScore} />
                <ScoreBar label="Visa business" value={businessScore} />
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
                  <span className="font-black text-text">{full.appointment_audit?.platform}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <span className="text-sm font-bold text-muted">Difficulté réelle</span>
                  <span className="font-black text-danger">{full.appointment_audit?.real_difficulty}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <span className="text-sm font-bold text-muted">Délai moyen</span>
                  <span className="font-black text-text">{full.appointment_audit?.avg_wait_time}</span>
                </div>
              </div>

              <div className="rounded-3xl border border-[#f3afaf] bg-[#fff0f0] p-6">
                <h4 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-danger">
                  <AlertTriangle className="h-4 w-4" /> Problèmes signalés (OSINT)
                </h4>
                <ul className="space-y-3">
                  {(full.appointment_audit?.issues || []).map((issue: string, i: number) => (
                    <li key={i} className="flex gap-2 text-sm font-bold text-danger">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0" /> {issue}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <VisitReasonsSection countryName={country.name} reasons={experienceContent.reasons} />

          <TravelerQuotesSection countryName={country.name} quotes={experienceContent.quotes} />

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
                  className="min-h-[100px] w-full rounded-2xl border border-line bg-[#f8f2e8] p-4 font-medium text-text outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/50"
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
              <div className="rounded-[2rem] border border-line bg-[#f8f2e8] p-8 text-center">
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
                <ShieldCheck className="h-5 w-5 text-success" /> Embassy insights
              </h3>
              
              <div className="space-y-8">
                <div>
                  <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted">
                    Comportement consulaire
                  </div>
                  <p className="text-sm font-bold leading-relaxed text-text">{full.embassy_behavior}</p>
                </div>

                <div className="border-t border-line pt-8">
                  <div className="mb-4 text-[10px] font-black uppercase tracking-widest text-muted">Système de visa</div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted">Tourisme</span>
                      <span className="rounded-lg bg-[#f8f2e8] px-2 py-1 text-xs font-black text-text">
                        {full.visa_system?.tourism?.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted">Travail</span>
                      <span className="rounded-lg bg-[#f8f2e8] px-2 py-1 text-xs font-black text-text">
                        {full.visa_system?.work?.availability || 'Limitée'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-line pt-8">
                  <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted">
                    Decision meters
                  </div>
                  <div className="space-y-3">
                    <SidebarBar label="Visa avg" value={Math.round((tourismScore + studyScore + workScore + businessScore) / 4)} />
                    <SidebarBar label="Friction readiness" value={frictionScore} />
                    <SidebarBar label="Global score" value={finalScore} />
                  </div>
                </div>

                <div className="border-t border-line pt-8">
                  <div className="rounded-2xl border border-primary/30 bg-primary-soft p-4">
                    <h4 className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                      <CheckCircle2 className="w-3 h-3" /> Pro Tip (Darija)
                    </h4>
                    <p className="text-sm font-black italic text-text">
                      "{full.morocco_insights?.pro_tip}"
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
  )
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted">
        <span>{label}</span>
        <span className="text-text">{value}</span>
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
        <span className="text-muted">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#eadfcf]">
        <div className={`h-full ${barTone(value)}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
