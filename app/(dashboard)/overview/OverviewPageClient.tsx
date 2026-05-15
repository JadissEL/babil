'use client'

import { useUser } from '@clerk/nextjs'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Brain,
  Briefcase,
  Car,
  ChevronRight,
  FileStack,
  GraduationCap,
  ListOrdered,
  Map,
  MessageSquare,
  Scale,
  Star,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { ObjectivePreferencePanel } from '@/components/dashboard/ObjectivePreferencePanel'
import { PostSignupOnboarding } from '@/components/dashboard/PostSignupOnboarding'
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider'
import { MyDelegatedRequests } from '@/components/services/MyDelegatedRequests'
import { RecentlyViewedCountries } from '@/components/user/RecentlyViewedCountries'
import { ctaCompareHref, ctaExploreHref } from '@/lib/cta-hrefs'
import { NEXUS_FOCUS_VISIBLE, NEXUS_TRANSITION } from '@/lib/nexus-chrome'
import { cn } from '@/lib/utils'

const SHELL = '#FAF7EE'
const INK_10 = 'rgba(13,27,62,0.10)'

type ModuleDescriptor = {
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
  link: string
  status: 'Prêt' | 'Bientôt' | 'Nouveau' | 'Mise à jour'
}

type StatTone = 'success' | 'danger' | 'rating' | 'neutral'

type StatDescriptor = {
  label: string
  value: string
  tone: StatTone
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/55">
      {children}
    </p>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-xl font-black tracking-tight text-[#0D1B3E] sm:text-2xl">
      {children}
    </h2>
  )
}

function StatTile({ stat }: { stat: StatDescriptor }) {
  return (
    <div
      className="flex flex-col rounded-xl border bg-white px-5 py-4"
      style={{ borderColor: INK_10 }}
    >
      <Eyebrow>{stat.label}</Eyebrow>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="font-serif text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">
          {stat.value}
        </p>
        {stat.tone === 'success' ? (
          <ArrowUpRight className="h-4 w-4 text-emerald-600" aria-hidden />
        ) : null}
        {stat.tone === 'danger' ? (
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full bg-rose-500"
          />
        ) : null}
        {stat.tone === 'rating' ? (
          <span className="text-xs font-black text-[#0D1B3E]/45">/5</span>
        ) : null}
      </div>
    </div>
  )
}

function statusToneClasses(status: ModuleDescriptor['status']): string {
  switch (status) {
    case 'Prêt':
      return 'border-emerald-600/30 bg-emerald-600/10 text-emerald-700'
    case 'Nouveau':
      return 'border-[#0D1B3E]/30 bg-[#0D1B3E]/10 text-[#0D1B3E]'
    case 'Mise à jour':
      return 'border-amber-600/30 bg-amber-600/10 text-amber-700'
    case 'Bientôt':
    default:
      return 'border-[#0D1B3E]/15 bg-[#0D1B3E]/05 text-[#0D1B3E]/55'
  }
}

function ModuleTile({ module }: { module: ModuleDescriptor }) {
  const Icon = module.icon
  return (
    <Link
      href={module.link}
      className={cn(
        'group relative flex flex-col rounded-xl border bg-white p-6 hover:border-[#0D1B3E]/30 hover:shadow-sm',
        NEXUS_TRANSITION,
        NEXUS_FOCUS_VISIBLE,
      )}
      style={{ borderColor: INK_10 }}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-md border bg-[#FAF7EE] text-[#0D1B3E]"
          style={{ borderColor: INK_10 }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span
          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.22em] ${statusToneClasses(module.status)}`}
        >
          {module.status}
        </span>
      </div>
      <h3 className="mt-6 font-serif text-base font-black leading-snug tracking-tight text-[#0D1B3E] sm:text-lg">
        {module.title}
      </h3>
      <p className="mt-2 flex-1 text-[13px] font-medium leading-relaxed text-[#0D1B3E]/60">
        {module.description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] transition-[gap] duration-200 ease-out motion-reduce:transition-none group-hover:gap-2">
        Accéder <ChevronRight className="h-3.5 w-3.5" aria-hidden />
      </span>
    </Link>
  )
}

export default function OverviewPageClient() {
  const { user } = useUser()
  const { preference } = useObjectivePreference()
  const explorerHref = useMemo(
    () => ctaExploreHref(preference.primarySlug),
    [preference.primarySlug],
  )
  const compareHref = useMemo(
    () => ctaCompareHref(preference.primarySlug),
    [preference.primarySlug],
  )

  // Stable client-only last-sync stamp (avoids SSR hydration drift).
  const [lastSync, setLastSync] = useState<string | null>(null)
  useEffect(() => {
    const now = new Date()
    setLastSync(
      `${now.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}, ${now
        .toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
    )
  }, [])

  const stats: StatDescriptor[] = [
    { label: 'Score moyen', value: '64%', tone: 'success' },
    { label: 'Pays analysés', value: '12', tone: 'neutral' },
    { label: 'Alertes actives', value: '2', tone: 'danger' },
    { label: 'Note utilisateur', value: '4.8', tone: 'rating' },
  ]

  const modules: ModuleDescriptor[] = useMemo(
    () => [
      {
        title: 'Moteur de probabilités',
        description: "Calculez vos chances réelles d'obtention de visa selon votre profil.",
        icon: Brain,
        link: '/probability',
        status: 'Prêt',
      },
      {
        title: 'Moteur reco (pro)',
        description: 'Radar, barres et classement — même API que les recommandations.',
        icon: Activity,
        link: '/recommendation-engine',
        status: 'Nouveau',
      },
      {
        title: 'Comparer pays',
        description: "Jusqu'à 4 destinations, tableau et mise en avant du meilleur score.",
        icon: Scale,
        link: compareHref,
        status: 'Prêt',
      },
      {
        title: 'Recommandations',
        description: 'Classement personnalisé à partir de votre profil enregistré.',
        icon: ListOrdered,
        link: '/recommendations',
        status: 'Prêt',
      },
      {
        title: 'Friction Map',
        description: 'Découvrez les pays où les rendez-vous sont les plus saturés.',
        icon: Map,
        link: explorerHref,
        status: 'Mise à jour',
      },
      {
        title: 'Permis International',
        description: 'Vérifiez la validité de votre permis marocain dans le monde.',
        icon: Car,
        link: '/permis',
        status: 'Nouveau',
      },
      {
        title: 'Assist candidatures',
        description:
          'Forfaits emploi & université, garantie — suivez vos dossiers ci-dessus (détail via « Voir »).',
        icon: FileStack,
        link: '/services/delegated-applications',
        status: 'Nouveau',
      },
      {
        title: 'Éducation & Formation',
        description: "Opportunités d'études et formations courtes à l'étranger.",
        icon: GraduationCap,
        link: '/education',
        status: 'Bientôt',
      },
      {
        title: 'Business & Invest',
        description: "Découvrez les opportunités d'investissement et de business micro.",
        icon: Briefcase,
        link: '/business',
        status: 'Prêt',
      },
    ],
    [compareHref, explorerHref],
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: SHELL }}>
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-6 lg:px-8">
        <header className="mb-10 grid grid-cols-1 items-start gap-4 sm:grid-cols-[1fr_auto] sm:gap-6">
          <div>
            <Eyebrow>Horizon Dashboard</Eyebrow>
            <h1 className="mt-3 font-serif text-3xl font-black leading-[1.05] tracking-tight text-[#0D1B3E] sm:text-4xl md:text-[42px]">
              Bonjour, {user?.firstName || 'Voyageur'}.
            </h1>
            <p className="mt-3 font-serif text-[15px] font-medium text-[#0D1B3E]/60">
              Aperçu de votre situation de mobilité sur VisaFlow.
            </p>
          </div>
          <div className="text-left sm:text-right">
            <Eyebrow>Dernière synchronisation</Eyebrow>
            <p className="mt-2 text-[13px] font-medium text-[#0D1B3E]/75">
              {lastSync ?? 'Synchronisation en cours…'}
            </p>
          </div>
        </header>

        <div className="mb-10">
          <MyDelegatedRequests />
        </div>

        <section className="mb-12" aria-label="Indicateurs clés">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <StatTile key={s.label} stat={s} />
            ))}
          </div>
        </section>

        <section className="mb-10" aria-label="Parcours initial">
          <div className="mb-5">
            <Eyebrow>Parcours initial</Eyebrow>
            <SectionTitle>Définissez votre cap</SectionTitle>
          </div>
          <div className="space-y-6">
            <ObjectivePreferencePanel />
            <PostSignupOnboarding />
          </div>
        </section>

        <section className="mb-12" aria-label="Récemment consulté">
          <div className="mb-5">
            <Eyebrow>Récemment consulté</Eyebrow>
          </div>
          <RecentlyViewedCountries />
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-5">
              <Eyebrow>Outils mobilité</Eyebrow>
              <SectionTitle>Vos moteurs analytiques</SectionTitle>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {modules.map((m) => (
                <ModuleTile key={m.title} module={m} />
              ))}
            </div>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="mb-5">
              <Eyebrow>Flash OSINT</Eyebrow>
            </div>
            <section
              className="rounded-xl border bg-white p-6"
              style={{ borderColor: INK_10 }}
              aria-label="Flash OSINT — alertes & signaux"
            >
              <p className="font-serif text-[13px] font-medium italic leading-relaxed text-[#0D1B3E]/65">
                Mises à jour réglementaires et signaux faibles détectés par nos analyses.
              </p>

              <ul className="mt-5 space-y-5">
                <li className="border-l-2 border-emerald-600/70 pl-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
                    Espagne (BLS) · Il y a 2h
                  </p>
                  <p className="mt-1.5 font-serif text-[14px] font-medium leading-relaxed text-[#0D1B3E]/85">
                    Libération massive de créneaux prévue ce mardi à 10h. Préparez vos dossiers.
                  </p>
                </li>
                <li className="border-l-2 border-rose-500/70 pl-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose-700">
                    France (TLS) · Hier
                  </p>
                  <p className="mt-1.5 font-serif text-[14px] font-medium leading-relaxed text-[#0D1B3E]/85">
                    Saturation critique sur Casablanca. Délais moyens passés à 45 jours.
                  </p>
                </li>
                <li className="border-l-2 border-amber-500/70 pl-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-700">
                    Italie · 12 mars
                  </p>
                  <p className="mt-1.5 font-serif text-[14px] font-medium leading-relaxed text-[#0D1B3E]/85">
                    Nouveau portail de réservation plus stable. Moins de friction signalée.
                  </p>
                </li>
              </ul>

              <Link
                href={explorerHref}
                className={cn(
                  'mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-md border bg-[#FAF7EE] px-4 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] hover:border-[#0D1B3E] hover:bg-white',
                  NEXUS_TRANSITION,
                  NEXUS_FOCUS_VISIBLE,
                )}
                style={{ borderColor: INK_10 }}
              >
                Ouvrir l&apos;Explorer <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </section>

            <div
              className="mt-4 flex items-center justify-between gap-3 rounded-xl border bg-white px-5 py-3"
              style={{ borderColor: INK_10 }}
            >
              <div className="flex items-center gap-2.5">
                <Star className="h-4 w-4 text-amber-500" aria-hidden />
                <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65">
                  Avis communauté
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[13px] font-bold text-[#0D1B3E]">
                <MessageSquare className="h-3.5 w-3.5 text-[#0D1B3E]/55" aria-hidden /> 124
              </span>
            </div>

            <div
              className="mt-4 flex items-center justify-between gap-3 rounded-xl border bg-white px-5 py-3"
              style={{ borderColor: INK_10 }}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="h-4 w-4 text-emerald-600" aria-hidden />
                <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65">
                  Tendance globale
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[13px] font-bold text-emerald-700">
                +6%
              </span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
