'use client'

import { useUser } from '@clerk/nextjs'
import {
  Briefcase,
  ChevronRight,
  Download,
  GraduationCap,
  Plane,
  Save,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect, type ComponentType } from 'react'
import { DashboardPageSkeleton } from '@/components/dashboard/DashboardPageSkeleton'
import { appToast } from '@/lib/toast-store'

const SHELL = '#FAF7EE'
const INK_10 = 'rgba(13,27,62,0.10)'

type PersonaPreset = {
  id: string
  label: string
  description: string
  icon: ComponentType<{ className?: string }>
  patch: {
    age: number
    profession: string
    income: number
    savings: number
    CNSS_status: boolean
    marital_status: string
    family_in_europe: boolean
    family_details: string
    goal_type: string
  }
}

const PERSONA_PRESETS: PersonaPreset[] = [
  {
    id: 'student',
    label: 'Étudiant',
    description: 'Objectif études, budget serré, peu de revenu stable.',
    icon: GraduationCap,
    patch: {
      age: 22,
      profession: 'student',
      income: 2500,
      savings: 12000,
      CNSS_status: false,
      marital_status: 'single',
      family_in_europe: false,
      family_details: '',
      goal_type: 'study',
    },
  },
  {
    id: 'nomad',
    label: 'Nomade Digital',
    description: 'Freelance, court séjour / tourisme, coussin d’épargne.',
    icon: Plane,
    patch: {
      age: 32,
      profession: 'freelance',
      income: 18000,
      savings: 90000,
      CNSS_status: false,
      marital_status: 'single',
      family_in_europe: true,
      family_details: '',
      goal_type: 'tourism',
    },
  },
  {
    id: 'business',
    label: 'Business',
    description: 'Profil pro / affaires, revenus et épargne confortables.',
    icon: Briefcase,
    patch: {
      age: 42,
      profession: 'self-employed',
      income: 35000,
      savings: 250000,
      CNSS_status: true,
      marital_status: 'married',
      family_in_europe: false,
      family_details: '',
      goal_type: 'business',
    },
  },
]

const GOAL_OPTIONS: { id: string; label: string }[] = [
  { id: 'tourism', label: 'Tourisme / courte durée' },
  { id: 'study', label: 'Études' },
  { id: 'work', label: 'Travailleur salarié' },
  { id: 'business', label: 'Business / Investissement' },
  { id: 'short_course', label: 'Travailleur indépendant / Nomade' },
]

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-md border bg-[#FAF7EE] px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em] text-[#0D1B3E]/65"
      style={{ borderColor: INK_10 }}
    >
      {children}
    </span>
  )
}

function FormLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[12px] font-medium text-[#0D1B3E]/70"
    >
      {children}
    </label>
  )
}

const INPUT_BASE =
  'mt-1.5 h-11 w-full rounded-md border-0 border-b bg-transparent px-0 text-[15px] font-medium text-[#0D1B3E] outline-none transition-colors placeholder:text-[#0D1B3E]/35 focus:border-b-[#0D1B3E]'

const SELECT_BASE =
  'mt-1.5 h-11 w-full rounded-md border bg-[#FAF7EE] px-3 text-[14px] font-medium text-[#0D1B3E] outline-none focus:border-[#0D1B3E] focus:ring-2 focus:ring-[#0D1B3E]/15'

function SidebarCard({
  icon: Icon,
  title,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      className="rounded-xl border bg-white p-5"
      style={{ borderColor: INK_10 }}
      aria-label={title}
    >
      <header className="mb-3 flex items-center gap-2.5">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full border bg-[#FAF7EE] text-[#0D1B3E]"
          style={{ borderColor: INK_10 }}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
        </span>
        <h2 className="font-serif text-base font-black tracking-tight text-[#0D1B3E]">{title}</h2>
      </header>
      {children}
    </section>
  )
}

export default function ProfilePage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exportingGdpr, setExportingGdpr] = useState(false)
  const [message, setMessage] = useState('')

  const [profile, setProfile] = useState({
    age: 35,
    profession: 'self-employed',
    income: 8000,
    savings: 70000,
    CNSS_status: true,
    marital_status: 'single',
    family_in_europe: true,
    family_details: 'Frère PR Italie, Sœur PR France',
    goal_type: 'tourism',
  })

  useEffect(() => {
    fetch('/api/user/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setProfile(data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      if (res.ok) {
        setMessage('Profil mis à jour avec succès.')
        appToast.success('Profil enregistré.')
        setTimeout(() => setMessage(''), 3000)
      } else {
        const err = await res.json().catch(() => ({}))
        appToast.error(
          typeof err?.error === 'string' ? err.error : 'Enregistrement du profil impossible.',
        )
      }
    } catch (error) {
      console.error(error)
      appToast.error('Erreur réseau — profil non enregistré.')
    } finally {
      setSaving(false)
    }
  }

  const handleGdprExport = async () => {
    setExportingGdpr(true)
    try {
      const res = await fetch('/api/user/data-export')
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        appToast.error(
          typeof err?.error === 'string' ? err.error : 'Export des données impossible.',
        )
        return
      }
      const blob = await res.blob()
      const dispo = res.headers.get('Content-Disposition')
      const match = /filename="([^"]+)"/.exec(dispo ?? '')
      const filename = match?.[1] ?? 'babil-donnees-personnelles.json'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      appToast.success('Fichier JSON téléchargé — conservez-le dans un endroit sûr.')
    } catch {
      appToast.error('Erreur réseau — export non téléchargé.')
    } finally {
      setExportingGdpr(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: SHELL }}>
        <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-6 lg:px-8">
          <DashboardPageSkeleton variant="profile" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: SHELL }}>
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-6 lg:px-8">
        <section
          className="mb-6 rounded-xl border bg-white px-6 py-6 sm:px-7"
          style={{ borderColor: INK_10 }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-serif text-3xl font-black leading-[1.05] tracking-tight text-[#0D1B3E] sm:text-4xl">
                Votre profil
              </h1>
              <p className="mt-3 max-w-xl font-serif text-[14px] font-medium leading-relaxed text-[#0D1B3E]/65">
                Gérez vos informations personnelles et vos préférences de mobilité. Ces données
                sont utilisées pour personnaliser vos recommandations de visa.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#0D1B3E] px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#1A2A52] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" aria-hidden />
              {saving ? 'Enregistrement…' : 'Sauvegarder'}
            </button>
          </div>

          {message ? (
            <p
              role="status"
              aria-live="polite"
              className="mt-4 inline-flex items-center gap-2 rounded-md border border-emerald-600/30 bg-emerald-50 px-3 py-1.5 text-[12px] font-bold text-emerald-700"
            >
              {message}
            </p>
          ) : null}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <section
            className="rounded-xl border border-l-4 bg-white px-6 py-7 sm:px-8 sm:py-8"
            style={{ borderColor: INK_10, borderLeftColor: '#0D1B3E' }}
            aria-label="Formulaire profil"
          >
            <Eyebrow>Identité &amp; Situation</Eyebrow>
            <div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <div>
                <FormLabel>Prénom</FormLabel>
                <input
                  type="text"
                  className={INPUT_BASE}
                  style={{ borderBottomColor: INK_10 }}
                  value={user?.firstName ?? ''}
                  readOnly
                  aria-readonly="true"
                  placeholder="Géré par Clerk"
                />
              </div>
              <div>
                <FormLabel>Nom</FormLabel>
                <input
                  type="text"
                  className={INPUT_BASE}
                  style={{ borderBottomColor: INK_10 }}
                  value={user?.lastName ?? ''}
                  readOnly
                  aria-readonly="true"
                  placeholder="Géré par Clerk"
                />
              </div>
              <div>
                <FormLabel htmlFor="profile-age">Âge</FormLabel>
                <input
                  id="profile-age"
                  type="number"
                  min={0}
                  max={120}
                  className={INPUT_BASE}
                  style={{ borderBottomColor: INK_10 }}
                  value={profile.age}
                  onChange={(e) =>
                    setProfile({ ...profile, age: parseInt(e.target.value, 10) || 0 })
                  }
                />
              </div>
              <div>
                <FormLabel htmlFor="profile-marital">Statut marital</FormLabel>
                <select
                  id="profile-marital"
                  className={SELECT_BASE}
                  style={{ borderColor: INK_10 }}
                  value={profile.marital_status}
                  onChange={(e) => setProfile({ ...profile, marital_status: e.target.value })}
                >
                  <option value="single">Célibataire</option>
                  <option value="married">Marié·e</option>
                  <option value="divorced">Divorcé·e</option>
                </select>
              </div>
            </div>

            <hr className="my-8 border-[#0D1B3E]/8" />

            <Eyebrow>Finances &amp; Objectifs</Eyebrow>
            <div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <div>
                <FormLabel htmlFor="profile-income">Revenu mensuel net (MAD)</FormLabel>
                <input
                  id="profile-income"
                  type="number"
                  min={0}
                  className={INPUT_BASE}
                  style={{ borderBottomColor: INK_10 }}
                  value={profile.income}
                  onChange={(e) =>
                    setProfile({ ...profile, income: parseInt(e.target.value, 10) || 0 })
                  }
                />
              </div>
              <div>
                <FormLabel htmlFor="profile-savings">Épargne disponible (MAD)</FormLabel>
                <input
                  id="profile-savings"
                  type="number"
                  min={0}
                  className={INPUT_BASE}
                  style={{ borderBottomColor: INK_10 }}
                  value={profile.savings}
                  onChange={(e) =>
                    setProfile({ ...profile, savings: parseInt(e.target.value, 10) || 0 })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <FormLabel htmlFor="profile-profession">Profession</FormLabel>
                <select
                  id="profile-profession"
                  className={SELECT_BASE}
                  style={{ borderColor: INK_10 }}
                  value={profile.profession}
                  onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                >
                  <option value="self-employed">Indépendant / Auto-entrepreneur</option>
                  <option value="salaried">Salarié secteur privé</option>
                  <option value="public">Fonctionnaire</option>
                  <option value="freelance">Freelance (international)</option>
                  <option value="student">Étudiant·e</option>
                  <option value="retired">Retraité·e</option>
                  <option value="unemployed">Sans emploi</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <FormLabel htmlFor="profile-goal">Objectif de mobilité</FormLabel>
                <select
                  id="profile-goal"
                  className={SELECT_BASE}
                  style={{ borderColor: INK_10 }}
                  value={profile.goal_type}
                  onChange={(e) => setProfile({ ...profile, goal_type: e.target.value })}
                >
                  {GOAL_OPTIONS.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <div
                  className="flex items-center justify-between gap-3 rounded-md border bg-[#FAF7EE] px-4 py-3"
                  style={{ borderColor: INK_10 }}
                >
                  <span className="text-[13px] font-medium text-[#0D1B3E]/75">CNSS déclaré ?</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={profile.CNSS_status}
                    onClick={() => setProfile({ ...profile, CNSS_status: !profile.CNSS_status })}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      profile.CNSS_status ? 'bg-[#0D1B3E]' : 'bg-[#0D1B3E]/20'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`absolute top-1 inline-block h-4 w-4 rounded-full bg-white transition-all ${
                        profile.CNSS_status ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <hr className="my-8 border-[#0D1B3E]/8" />

            <Eyebrow>Attaches</Eyebrow>
            <div
              className="mt-5 flex flex-col gap-4 rounded-md border bg-[#FAF7EE]/60 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
              style={{ borderColor: INK_10 }}
            >
              <div className="min-w-0">
                <p className="font-serif text-[15px] font-black tracking-tight text-[#0D1B3E]">
                  Famille en Europe
                </p>
                <p className="mt-1 text-[13px] font-medium leading-relaxed text-[#0D1B3E]/65">
                  Avez-vous des membres de votre famille immédiate résidant dans l&apos;UE ?
                </p>
              </div>
              <div role="radiogroup" aria-label="Famille en Europe" className="flex gap-4">
                <label className="inline-flex items-center gap-2 text-[13px] font-medium text-[#0D1B3E]">
                  <input
                    type="radio"
                    name="family_in_europe"
                    className="h-4 w-4 accent-[#0D1B3E]"
                    checked={profile.family_in_europe}
                    onChange={() => setProfile({ ...profile, family_in_europe: true })}
                  />
                  Oui
                </label>
                <label className="inline-flex items-center gap-2 text-[13px] font-medium text-[#0D1B3E]">
                  <input
                    type="radio"
                    name="family_in_europe"
                    className="h-4 w-4 accent-[#0D1B3E]"
                    checked={!profile.family_in_europe}
                    onChange={() => setProfile({ ...profile, family_in_europe: false })}
                  />
                  Non
                </label>
              </div>
            </div>
            {profile.family_in_europe ? (
              <div className="mt-4">
                <FormLabel htmlFor="profile-family-details">Détails</FormLabel>
                <textarea
                  id="profile-family-details"
                  rows={3}
                  className="mt-1.5 w-full rounded-md border bg-[#FAF7EE] px-3 py-2.5 text-[14px] font-medium text-[#0D1B3E] outline-none placeholder:text-[#0D1B3E]/35 focus:border-[#0D1B3E] focus:ring-2 focus:ring-[#0D1B3E]/15"
                  style={{ borderColor: INK_10 }}
                  placeholder="Ex : Frère en Italie (PR), sœur en France…"
                  value={profile.family_details}
                  onChange={(e) => setProfile({ ...profile, family_details: e.target.value })}
                />
              </div>
            ) : null}
          </section>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <SidebarCard icon={Sparkles} title="Profils Types">
              <p className="mb-3 text-[12px] font-medium leading-relaxed text-[#0D1B3E]/65">
                Remplissez rapidement votre formulaire avec nos jeux de données de démonstration.
              </p>
              <ul className="space-y-2">
                {PERSONA_PRESETS.map((p) => {
                  const Icon = p.icon
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setProfile((prev) => ({ ...prev, ...p.patch }))
                          appToast.info(`Profil « ${p.label} » appliqué — enregistrez si besoin.`)
                        }}
                        className="flex w-full items-center gap-3 rounded-md border bg-[#FAF7EE] px-3 py-2.5 text-left transition-colors hover:border-[#0D1B3E]/40 hover:bg-white"
                        style={{ borderColor: INK_10 }}
                      >
                        <span
                          aria-hidden
                          className="flex h-7 w-7 items-center justify-center rounded-full border bg-white text-[#0D1B3E]"
                          style={{ borderColor: INK_10 }}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="flex-1 text-[13px] font-bold text-[#0D1B3E]">
                          {p.label}
                        </span>
                        <ChevronRight className="h-4 w-4 text-[#0D1B3E]/45" aria-hidden />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </SidebarCard>

            <SidebarCard icon={Users} title="Assistance & Candidatures">
              <ul className="divide-y" style={{ borderColor: INK_10 }}>
                <li>
                  <Link
                    href="/services/delegated-applications"
                    className="flex items-center justify-between gap-3 py-2.5 text-[13px] font-medium text-[#0D1B3E] transition-colors hover:text-[#0D1B3E]/65"
                  >
                    Services Délégués
                    <ChevronRight className="h-4 w-4 text-[#0D1B3E]/45" aria-hidden />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/overview#assist-requests"
                    className="flex items-center justify-between gap-3 py-2.5 text-[13px] font-medium text-[#0D1B3E] transition-colors hover:text-[#0D1B3E]/65"
                  >
                    Mes demandes
                    <ChevronRight className="h-4 w-4 text-[#0D1B3E]/45" aria-hidden />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/history"
                    className="flex items-center justify-between gap-3 py-2.5 text-[13px] font-medium text-[#0D1B3E]/55 transition-colors hover:text-[#0D1B3E]"
                  >
                    Historique des demandes
                    <ChevronRight className="h-4 w-4 text-[#0D1B3E]/35" aria-hidden />
                  </Link>
                </li>
              </ul>
            </SidebarCard>

            <SidebarCard icon={Shield} title="Confidentialité">
              <p className="mb-4 text-[12px] font-medium leading-relaxed text-[#0D1B3E]/65">
                Vos identifiants et données de connexion sont gérés de manière sécurisée par
                Clerk. VisaFlow ne stocke que vos données de profilabilité.
              </p>
              <button
                type="button"
                onClick={() => void handleGdprExport()}
                disabled={exportingGdpr}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border bg-[#FAF7EE] px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] transition-colors hover:border-[#0D1B3E] disabled:opacity-50"
                style={{ borderColor: INK_10 }}
              >
                <Download className="h-3.5 w-3.5" aria-hidden />
                {exportingGdpr ? 'Préparation…' : 'Exporter mes données'}
              </button>
            </SidebarCard>
          </aside>
        </div>
      </div>
    </div>
  )
}
