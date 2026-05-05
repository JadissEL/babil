'use client'

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
  GraduationCap
} from 'lucide-react'

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

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
      </div>
    )

  return (
    <div className="mx-auto max-w-4xl pb-20">
      <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-[2rem] bg-blue-600 p-4 text-white shadow-xl shadow-blue-900/40">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">Votre profil</h1>
            <p className="font-medium text-slate-400">Pour des analyses personnalisées.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-black text-white shadow-lg shadow-blue-900/40 transition-all hover:bg-blue-500 disabled:opacity-50"
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
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-4 font-bold text-emerald-200">
          <CheckCircle2 className="h-5 w-5" /> {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <section className="space-y-6 rounded-[2.5rem] border border-white/10 bg-[#111827] p-8 shadow-lg shadow-black/15">
          <h2 className="mb-2 flex items-center gap-2 text-xl font-black text-white">
            <User className="h-5 w-5 text-blue-400" /> Informations de base
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Email</label>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 font-bold text-slate-400">
                <Mail className="h-4 w-4" /> {user?.primaryEmailAddress?.emailAddress}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Âge</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-white/15 bg-white/5 py-4 pl-12 pr-4 font-bold text-white outline-none focus:ring-2 focus:ring-blue-500/40"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value, 10) })}
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                  Statut marital
                </label>
                <select
                  className="w-full rounded-2xl border border-white/15 bg-white/5 p-4 font-bold text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/40"
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
        <section className="space-y-6 rounded-[2.5rem] border border-white/10 bg-[#111827] p-8 shadow-lg shadow-black/15">
          <h2 className="mb-2 flex items-center gap-2 text-xl font-black text-white">
            <Briefcase className="h-5 w-5 text-emerald-400" /> Pro & finances
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                Profession
              </label>
              <select
                className="w-full rounded-2xl border border-white/15 bg-white/5 p-4 font-bold text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/40"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                  Revenu (MAD)
                </label>
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-white/15 bg-white/5 py-4 pl-12 pr-4 font-bold text-white outline-none focus:ring-2 focus:ring-blue-500/40"
                    value={profile.income}
                    onChange={(e) => setProfile({ ...profile, income: parseInt(e.target.value, 10) })}
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                  Épargne (MAD)
                </label>
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-white/15 bg-white/5 py-4 pl-12 pr-4 font-bold text-white outline-none focus:ring-2 focus:ring-blue-500/40"
                    value={profile.savings}
                    onChange={(e) => setProfile({ ...profile, savings: parseInt(e.target.value, 10) })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="text-sm font-bold text-slate-300">CNSS déclaré ?</span>
              <button
                type="button"
                aria-pressed={profile.CNSS_status}
                onClick={() => setProfile({ ...profile, CNSS_status: !profile.CNSS_status })}
                className={`relative h-6 w-12 rounded-full transition-colors ${profile.CNSS_status ? 'bg-blue-600' : 'bg-slate-600'}`}
              >
                <div
                  className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-all ${profile.CNSS_status ? 'left-7' : 'left-1'}`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Family & Social */}
        <section className="space-y-6 rounded-[2.5rem] border border-white/10 bg-[#111827] p-8 shadow-lg shadow-black/15">
          <h2 className="mb-2 flex items-center gap-2 text-xl font-black text-white">
            <Users className="h-5 w-5 text-purple-400" /> Famille
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="text-sm font-bold text-slate-300">Famille en Europe ?</span>
              <button
                type="button"
                aria-pressed={profile.family_in_europe}
                onClick={() =>
                  setProfile({ ...profile, family_in_europe: !profile.family_in_europe })
                }
                className={`relative h-6 w-12 rounded-full transition-colors ${profile.family_in_europe ? 'bg-blue-600' : 'bg-slate-600'}`}
              >
                <div
                  className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-all ${profile.family_in_europe ? 'left-7' : 'left-1'}`}
                />
              </button>
            </div>

            {profile.family_in_europe && (
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                  Détails
                </label>
                <textarea
                  className="min-h-[100px] w-full rounded-2xl border border-white/15 bg-white/5 p-4 font-bold text-slate-100 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40"
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
        <section className="space-y-6 rounded-[2.5rem] border border-white/10 bg-[#111827] p-8 shadow-lg shadow-black/15 md:col-span-2">
          <h2 className="mb-2 flex items-center gap-2 text-xl font-black text-white">
            <Target className="h-5 w-5 text-red-400" /> Objectif principal
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
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
                        ? 'border-blue-500/45 bg-blue-500/15 text-blue-200'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
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
