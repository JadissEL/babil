'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import {
  Brain,
  Map,
  Car,
  Briefcase,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  LayoutDashboard,
  Globe,
  MessageSquare,
  Scale,
  Activity,
  ListOrdered,
  FileStack,
} from 'lucide-react'

export default function OverviewPageClient() {
  const { user } = useUser()

  const stats = [
    { label: 'Score de succès moyen', value: '64%', icon: TrendingUp, tone: 'text-success ring-[#94dfbd] bg-[#e9f9f1]' },
    { label: 'Pays analysés', value: '12', icon: Globe, tone: 'text-primary ring-primary/30 bg-primary-soft' },
    { label: 'Alertes critiques', value: '2', icon: AlertTriangle, tone: 'text-danger ring-[#f3afaf] bg-[#fff0f0]' },
    { label: 'Avis communauté', value: '124', icon: MessageSquare, tone: 'text-accent ring-accent/30 bg-accent-soft' },
  ]

  const modules = [
    {
      title: 'Probability Engine',
      description: "Calculez vos chances réelles d'obtention de visa selon votre profil.",
      icon: Brain,
      link: '/probability',
      color: 'bg-primary',
      status: 'Prêt',
    },
    {
      title: 'Moteur reco (pro)',
      description: 'Radar, barres et classement — même API que les recommandations.',
      icon: Activity,
      link: '/recommendation-engine',
      color: 'bg-[#5b6ccf]',
      status: 'Prêt',
    },
    {
      title: 'Comparer pays',
      description: "Jusqu'à 4 destinations, tableau et mise en avant du meilleur score.",
      icon: Scale,
      link: '/compare',
      color: 'bg-[#2f8bb9]',
      status: 'Prêt',
    },
    {
      title: 'Recommandations',
      description: 'Classement personnalisé à partir de votre profil enregistré.',
      icon: ListOrdered,
      link: '/recommendations',
      color: 'bg-[#64748b]',
      status: 'Prêt',
    },
    {
      title: 'Friction Map',
      description: 'Découvrez les pays où les rendez-vous sont les plus saturés.',
      icon: Map,
      link: '/explorer',
      color: 'bg-[#475569]',
      status: 'Mise à jour',
    },
    {
      title: 'Permis International',
      description: 'Vérifiez la validité de votre permis marocain dans le monde.',
      icon: Car,
      link: '/permis',
      color: 'bg-success',
      status: 'Nouveau',
    },
    {
      title: 'Assist candidatures',
      description: 'Délégation emploi & universités : forfaits, garantie et formulaire après connexion.',
      icon: FileStack,
      link: '/services/delegated-applications',
      color: 'bg-rose-500',
      status: 'Nouveau',
    },
    {
      title: 'Éducation & Formation',
      description: "Opportunités d'études et formations courtes à l'étranger.",
      icon: GraduationCap,
      link: '/education',
      color: 'bg-[#8b5cf6]',
      status: 'Bientôt',
    },
    {
      title: 'Business & Invest',
      description: "Découvrez les opportunités d'investissement et de business micro.",
      icon: Briefcase,
      link: '/business',
      color: 'bg-success',
      status: 'Prêt',
    },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight text-text">
          Bonjour, {user?.firstName || 'Voyageur'}
        </h1>
        <p className="mt-2 font-medium text-muted">Aperçu de votre situation de mobilité sur VisaFlow.</p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-3xl border border-line bg-surface p-6 shadow-soft"
          >
            <div className={`rounded-2xl p-3 ring-1 ${stat.tone}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-text">{stat.value}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-black text-text">
              <LayoutDashboard className="h-5 w-5 text-primary" /> Outils mobilité
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {modules.map((module, i) => (
              <Link
                key={i}
                href={module.link}
                className="group relative overflow-hidden rounded-[2rem] border border-line bg-surface p-6 shadow-card transition-all duration-300 hover:border-primary/35 hover:shadow-soft"
              >
                <div
                  className={`absolute right-0 top-0 rounded-bl-xl px-4 py-1 text-[10px] font-black uppercase tracking-widest ring-1 ${
                    module.status === 'Prêt'
                      ? 'bg-[#e9f9f1] text-success ring-[#94dfbd]'
                      : module.status === 'Bientôt'
                        ? 'bg-[#f8f2e8] text-muted ring-line'
                        : 'bg-primary-soft text-primary ring-primary/35'
                  }`}
                >
                  {module.status}
                </div>

                <div
                  className={`mb-6 w-fit rounded-2xl p-4 ${module.color} text-white shadow-lg transition-transform group-hover:scale-[1.02]`}
                >
                  <module.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-black text-text">{module.title}</h3>
                <p className="mb-6 text-sm font-medium leading-relaxed text-muted">{module.description}</p>
                <div className="flex items-center gap-1 text-sm font-bold text-primary transition-all group-hover:gap-2">
                  Accéder <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-black text-text">Flash OSINT</h2>
          <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface p-8 shadow-card">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary opacity-15 blur-3xl" />

            <div className="relative space-y-6">
              <div className="border-l-2 border-primary pl-4">
                <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-primary">Espagne (BLS)</div>
                <p className="text-sm font-bold leading-relaxed text-text">
                  Libération massive de créneaux prévue ce mardi à 10h. Préparez vos dossiers.
                </p>
              </div>

              <div className="border-l-2 border-danger pl-4">
                <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-danger">France (TLS)</div>
                <p className="text-sm font-bold leading-relaxed text-text">
                  Saturation critique sur Casablanca. Délais moyens passés à 45 jours.
                </p>
              </div>

              <div className="border-l-2 border-success pl-4">
                <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-success">Italie</div>
                <p className="text-sm font-bold leading-relaxed text-text">
                  Nouveau portail de réservation plus stable. Moins de friction signalée.
                </p>
              </div>
            </div>

            <Link
              href="/explorer"
              className="mt-8 flex w-full items-center justify-center rounded-2xl border border-line bg-[#f8f2e8] py-4 text-sm font-black text-text transition-colors hover:bg-primary-soft"
            >
              Ouvrir l&apos;Explorer
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
