'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { 
  User, 
  Mail, 
  Briefcase, 
  Coins, 
  Heart, 
  Users, 
  Target, 
  Save,
  CheckCircle2,
  Calendar,
  GraduationCap,
  FileStack
} from 'lucide-react'

import { DashboardPageSkeleton } from '@/components/dashboard/DashboardPageSkeleton'

export default function ProfilePage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  
  const [profile, setProfile] = useState({
    age: 35,
    profession: 'self-employed',
    income: 8000,
    savings: 70000,
    CNSS_status: true,
    marital_status: 'single',
    family_in_europe: true,
    family_details: "Frère PR Italie, Sœur PR France",
    goal_type: 'tourism'
  })

  useEffect(() => {
    // Fetch profile from API
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setProfile(data)
        }
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      
      if (res.ok) {
        setMessage('Profil mis à jour avec succès !')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <DashboardPageSkeleton variant="profile" />

  return (
    <div className="mx-auto max-w-4xl pb-16 sm:pb-20">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:mb-10 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="rounded-2xl bg-primary p-3 text-white shadow-soft sm:rounded-[2rem] sm:p-4">
            <User className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight text-text sm:text-3xl lg:text-4xl">Votre profil</h1>
            <p className="text-sm font-medium text-muted sm:text-base">Pour des analyses personnalisées.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-black text-white shadow-soft transition-all hover:bg-primary-hover disabled:opacity-50 sm:w-auto sm:px-8 sm:py-4"
        >
          {saving ? (
            'Enregistrement…'
          ) : (
            <>
              <Save className="h-5 w-5" /> Sauvegarder
            </>
          )}
        </button>
      </div>

      {message && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-[#94dfbd] bg-[#e9f9f1] p-4 font-bold text-success">
          <CheckCircle2 className="h-5 w-5" /> {message}
        </div>
      )}

      <section className="mb-6 rounded-2xl border border-line bg-surface p-5 shadow-card sm:mb-8 sm:rounded-[2.5rem] sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-rose-500/15 p-3 text-rose-500 ring-1 ring-rose-500/30">
              <FileStack className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-text">Assist candidatures</h2>
              <p className="mt-1 max-w-xl text-sm font-medium text-muted">
                Forfaits emploi & université : consultez la grille tarifaire et retrouvez l’historique de vos dossiers délégués.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/services/delegated-applications"
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-[#f8f2e8] px-5 py-3 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary-soft"
            >
              Catalogue & garantie
            </Link>
            <Link
              href="/overview#assist-requests"
              className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-soft hover:bg-primary-hover"
            >
              Mes demandes
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        <section className="space-y-6 rounded-2xl border border-line bg-surface p-5 shadow-card sm:rounded-[2.5rem] sm:p-8">
          <h2 className="mb-2 flex items-center gap-2 text-xl font-black text-text">
            <User className="h-5 w-5 text-primary" /> Informations de base
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted">Email</label>
              <div className="flex items-center gap-3 rounded-2xl border border-line bg-[#f8f2e8] p-4 font-bold text-muted">
                <Mail className="h-4 w-4" /> {user?.primaryEmailAddress?.emailAddress}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted">Âge</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-line bg-surface py-4 pl-12 pr-4 font-bold text-text outline-none focus:ring-2 focus:ring-primary/40"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value, 10) })}
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted">
                  Statut marital
                </label>
                <select
                  className="w-full rounded-2xl border border-line bg-surface p-4 font-bold text-text outline-none focus:ring-2 focus:ring-primary/40"
                  value={profile.marital_status}
                  onChange={(e) => setProfile({ ...profile, marital_status: e.target.value })}
                >
                  <option value="single">Célibataire</option>
                  <option value="married">Marié(e)</option>
                  <option value="divorced">Divorcé(e)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Professional & Financial */}
        <section className="space-y-6 rounded-2xl border border-line bg-surface p-5 shadow-card sm:rounded-[2.5rem] sm:p-8">
          <h2 className="mb-2 flex items-center gap-2 text-xl font-black text-text">
            <Briefcase className="h-5 w-5 text-success" /> Pro & finances
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted">
                Profession
              </label>
              <select
                className="w-full rounded-2xl border border-line bg-surface p-4 font-bold text-text outline-none focus:ring-2 focus:ring-primary/40"
                value={profile.profession}
                onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
              >
                <option value="self-employed">Indépendant / Auto-entrepreneur</option>
                <option value="salaried">Salarié secteur privé</option>
                <option value="public">Fonctionnaire</option>
                <option value="freelance">Freelance (International)</option>
                <option value="unemployed">Sans emploi</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted">
                  Revenu (MAD)
                </label>
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-line bg-surface py-4 pl-12 pr-4 font-bold text-text outline-none focus:ring-2 focus:ring-primary/40"
                    value={profile.income}
                    onChange={(e) => setProfile({ ...profile, income: parseInt(e.target.value, 10) })}
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted">
                  Épargne (MAD)
                </label>
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-line bg-surface py-4 pl-12 pr-4 font-bold text-text outline-none focus:ring-2 focus:ring-primary/40"
                    value={profile.savings}
                    onChange={(e) => setProfile({ ...profile, savings: parseInt(e.target.value, 10) })}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-line bg-[#f8f2e8] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
              <span className="text-sm font-bold text-muted">CNSS déclaré ?</span>
              <button
                type="button"
                aria-pressed={profile.CNSS_status}
                onClick={() => setProfile({ ...profile, CNSS_status: !profile.CNSS_status })}
                className={`relative h-6 w-12 shrink-0 self-end rounded-full transition-colors sm:self-auto ${profile.CNSS_status ? 'bg-primary' : 'bg-[#b8c1cf]'}`}
              >
                <div
                  className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-all ${profile.CNSS_status ? 'left-7' : 'left-1'}`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Family & Social */}
        <section className="space-y-6 rounded-2xl border border-line bg-surface p-5 shadow-card sm:rounded-[2.5rem] sm:p-8">
          <h2 className="mb-2 flex items-center gap-2 text-xl font-black text-text">
            <Users className="h-5 w-5 text-[#8b5cf6]" /> Famille
          </h2>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-line bg-[#f8f2e8] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
              <span className="text-sm font-bold text-muted">Famille en Europe ?</span>
              <button
                type="button"
                aria-pressed={profile.family_in_europe}
                onClick={() =>
                  setProfile({ ...profile, family_in_europe: !profile.family_in_europe })
                }
                className={`relative h-6 w-12 shrink-0 self-end rounded-full transition-colors sm:self-auto ${profile.family_in_europe ? 'bg-primary' : 'bg-[#b8c1cf]'}`}
              >
                <div
                  className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-all ${profile.family_in_europe ? 'left-7' : 'left-1'}`}
                />
              </button>
            </div>

            {profile.family_in_europe && (
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted">
                  Détails
                </label>
                <textarea
                  className="min-h-[100px] w-full rounded-2xl border border-line bg-surface p-4 font-bold text-text outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
                  placeholder="Ex: Frère en Italie (PR), sœur en France…"
                  value={profile.family_details}
                  onChange={(e) =>
                    setProfile({ ...profile, family_details: e.target.value })
                  }
                />
              </div>
            )}
          </div>
        </section>

        {/* Goals */}
        <section className="space-y-6 rounded-2xl border border-line bg-surface p-5 shadow-card sm:rounded-[2.5rem] sm:p-8 md:col-span-2">
          <h2 className="mb-2 flex items-center gap-2 text-xl font-black text-text">
            <Target className="h-5 w-5 text-danger" /> Objectif principal
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted">
                Type de mobilité
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { id: 'tourism', label: 'Tourisme / courte', icon: Heart },
                  { id: 'study', label: 'Études', icon: GraduationCap },
                  { id: 'work', label: 'Travail / pro', icon: Briefcase },
                  { id: 'business', label: 'Business', icon: Target },
                ].map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => setProfile({ ...profile, goal_type: goal.id })}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-sm font-bold transition-all ${
                      profile.goal_type === goal.id
                        ? 'border-primary/45 bg-primary-soft text-primary'
                        : 'border-line bg-[#f8f2e8] text-muted hover:border-primary/20'
                    }`}
                  >
                    <goal.icon className="h-4 w-4" />
                    {goal.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
