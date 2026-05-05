import type { Metadata } from 'next'
import Link from 'next/link'
import { ReactNode } from 'react'
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Car,
  GraduationCap,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Zap,
  FileStack,
} from 'lucide-react'
import PageContainer from '@/components/layout/PageContainer'
import AppSidebar from '@/components/layout/AppSidebar'
import HomeQuickFilterEngine from '@/components/home/HomeQuickFilterEngine'
import CountryGrid from '@/components/country/CountryGrid'
import GoogleAd from '../components/GoogleAd'
import HeroWorldCarousel from '@/components/home/HeroWorldCarousel'
import { DelegatedApplicationsHomePromo } from '@/components/services/DelegatedApplicationsHomePromo'
import { buildHomeHeroSlides } from '@/lib/home-hero-slides'
import { resolveHomeShowcaseCountries } from '@/lib/home-showcase-countries'
import { PAYPAL_DONATE_URL } from '@/lib/paypal-donate'

export const metadata: Metadata = {
  title: 'VisaFlow — Mobilité internationale pour profils marocains',
  description:
    'Explorez les destinations : scores visa, friction, études et business. Filtres par objectif, budget et risque — puis approfondissez chaque pays.',
}

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [topCountries, heroSlides] = await Promise.all([
    resolveHomeShowcaseCountries(),
    buildHomeHeroSlides(),
  ])
  const testimonials = [
    {
      name: 'Yassine A.',
      role: 'Profil travail - Casablanca',
      quote:
        'J’ai réduit mon shortlist de 12 pays à 3 en une soirée. Les scores de friction m’ont évité des pistes trop compliquées pour mon profil.',
    },
    {
      name: 'Salma M.',
      role: 'Objectif études - Rabat',
      quote:
        'La comparaison Schengen + les modules education m’ont aidée à comprendre où mes chances étaient réalistes, pas seulement “populaires”.',
    },
    {
      name: 'Imane K.',
      role: 'Projet business - Tanger',
      quote:
        'Le croisement visa, business et terrain m’a donné un plan concret. J’ai pu prioriser un pays avec moins de risque opérationnel.',
    },
  ]

  const bestPractices = [
    {
      title: 'Commencer par ton objectif réel',
      text: 'Sélectionne d’abord ton intention principale (études, travail, business). Le filtrage devient plus pertinent et évite les comparaisons inutiles.',
    },
    {
      title: 'Comparer au moins 3 pays avant décision',
      text: 'Utilise Explorer puis Compare pour voir les écarts de friction, score visa et risques. Une seule destination ne donne pas de référence fiable.',
    },
    {
      title: 'Valider les points bloquants en premier',
      text: 'Regarde en priorité l’audit rendez-vous, la difficulté réelle et les signaux de refus. Ce sont les facteurs qui cassent le plus souvent un projet.',
    },
    {
      title: 'Utiliser les retours terrain',
      text: 'Consulte la section communauté et les commentaires modérés pour compléter la vue “officielle” par la réalité d’exécution.',
    },
  ]

  return (
    <PageContainer className="py-12">
        <section className="rounded-2xl border border-line bg-surface p-8 shadow-card md:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-inset px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Intelligence mobilité internationale
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-text md:text-5xl">
                Aide à la décision pour visas, études, business et mobilité.
              </h1>
              <p className="mt-4 max-w-2xl text-sm font-medium text-muted md:text-base">
                Données et scores explicables pour profils marocains : comparez les pays, la friction et les risques, puis
                choisissez un parcours réaliste.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/recommendations" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-primary-hover">
                  Lancer une analyse <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/explorer" className="inline-flex items-center gap-2 rounded-xl border border-line bg-inset px-5 py-3 text-xs font-black uppercase tracking-widest text-text hover:bg-primary-soft">
                  Ouvrir l&apos;Explorer
                </Link>
              </div>
            </div>
            <HeroWorldCarousel slides={heroSlides} />
          </div>
        </section>

        <HomeQuickFilterEngine />

        <DelegatedApplicationsHomePromo />

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-text">Pays à la une</h2>
            <Link href="/explorer" className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary-hover">
              Tout voir
            </Link>
          </div>
          <CountryGrid countries={topCountries} />
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <AppSidebar />
          <div className="space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-soft">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Fonctionnalités</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Feature
                href="/probability"
                icon={<Zap className="h-5 w-5 text-blue-400" />}
                title="Moteur de probabilités"
                description="Scores déterministes avec décomposition lisible pays par pays."
              />
              <Feature
                href="/schengen"
                icon={<ShieldCheck className="h-5 w-5 text-indigo-400" />}
                title="Espace Schengen"
                description="Friction, acceptation et comparaisons côte à côte."
              />
              <Feature
                href="/services/delegated-applications"
                icon={<FileStack className="h-5 w-5 text-rose-400" />}
                title="Assist candidatures"
                description="CV, lettres et dossiers délégués — utilisateurs connectés."
              />
              <Feature
                href="/education"
                icon={<GraduationCap className="h-5 w-5 text-violet-400" />}
                title="Éducation"
                description="Langues, formations techniques et cours courts à l&apos;étranger."
              />
              <Feature
                href="/community"
                icon={<MessagesSquare className="h-5 w-5 text-fuchsia-400" />}
                title="Communauté"
                description="Retours terrain et commentaires modérés par pays."
              />
              <Feature
                href="/business"
                icon={<Briefcase className="h-5 w-5 text-amber-400" />}
                title="Business"
                description="Installation, marchés et pistes investissement."
              />
              <Feature
                href="/permis"
                icon={<Car className="h-5 w-5 text-emerald-400" />}
                title="Permis de conduire"
                description="Validité et conversion selon la destination."
              />
              <Feature
                href="/recommendations"
                icon={<BarChart3 className="h-5 w-5 text-cyan-400" />}
                title="Recommandations"
                description="Classement type IA avec logique reproduisible."
              />
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-line bg-surface p-6 shadow-soft md:p-8">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted">Avis utilisateurs</p>
              <h2 className="mt-2 text-2xl font-black text-text">Retours après utilisation</h2>
            </div>
            <Link href="/community" className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary-hover">
              Voir la communauté
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-xl border border-line bg-inset p-4">
                <p className="text-sm font-medium italic text-text">"{t.quote}"</p>
                <p className="mt-4 text-sm font-black text-text">{t.name}</p>
                <p className="text-xs font-semibold text-muted">{t.role}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-line bg-surface p-6 shadow-soft md:p-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted">Bonnes pratiques</p>
          <h2 className="mt-2 text-2xl font-black text-text">Enchaînez les étapes dans le bon ordre</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {bestPractices.map((item, idx) => (
              <div key={item.title} className="rounded-xl border border-line bg-inset p-4">
                <p className="text-xs font-black uppercase tracking-widest text-primary">Étape {idx + 1}</p>
                <h3 className="mt-2 text-base font-black text-text">{item.title}</h3>
                <p className="mt-2 text-sm font-medium text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8">
          <GoogleAd slot="home_top" />
        </div>

        <footer className="mt-8 rounded-2xl border border-line bg-surface p-6 shadow-soft md:p-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted">VisaFlow</p>
              <p className="mt-2 text-sm font-medium text-muted">
                Plateforme d&apos;aide à la décision pour la mobilité internationale : visas, études, business et
                installation.
              </p>
            </div>
            <div>
              <p className="text-sm font-black text-text">Plateforme</p>
              <div className="mt-3 space-y-2 text-sm">
                <Link href="/explorer" className="block font-medium text-muted hover:text-primary">
                  Explorer
                </Link>
                <Link href="/compare" className="block font-medium text-muted hover:text-primary">
                  Comparer
                </Link>
                <Link href="/schengen" className="block font-medium text-muted hover:text-primary">
                  Schengen
                </Link>
                <Link href="/probability" className="block font-medium text-muted hover:text-primary">
                  Moteur de probabilités
                </Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-black text-text">Parcours mobilité</p>
              <div className="mt-3 space-y-2 text-sm">
                <Link href="/services/delegated-applications" className="block font-medium text-muted hover:text-primary">
                  Assist candidatures
                </Link>
                <Link href="/education" className="block font-medium text-muted hover:text-primary">
                  Éducation
                </Link>
                <Link href="/business" className="block font-medium text-muted hover:text-primary">
                  Business
                </Link>
                <Link href="/investment" className="block font-medium text-muted hover:text-primary">
                  Investissement
                </Link>
                <Link href="/permis" className="block font-medium text-muted hover:text-primary">
                  Permis de conduire
                </Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-black text-text">Compte & communauté</p>
              <div className="mt-3 space-y-2 text-sm">
                <Link href="/overview" className="block font-medium text-muted hover:text-primary">
                  Tableau de bord
                </Link>
                <Link href="/recommendations" className="block font-medium text-muted hover:text-primary">
                  Recommandations
                </Link>
                <Link href="/community" className="block font-medium text-muted hover:text-primary">
                  Communauté
                </Link>
                <Link href="/moderation" className="block font-medium text-muted hover:text-primary">
                  Modération
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 space-y-2 border-t border-line pt-4 text-xs font-semibold text-muted">
            <p>Conçu pour des décisions de mobilité concrètes et comparables.</p>
            <p>
              © {new Date().getFullYear()} VisaFlow · Réalisé par{' '}
              <span className="font-black text-text">JADISS EL ANTAKI</span>
              {' · '}
              <a
                href={PAYPAL_DONATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-primary underline decoration-primary/35 underline-offset-2 hover:text-primary-hover"
              >
                Soutenir via PayPal
              </a>
            </p>
          </div>
        </footer>
    </PageContainer>
  )
}

function Feature({
  href,
  icon,
  title,
  description,
}: {
  href: string
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <Link href={href} className="rounded-xl border border-line bg-inset p-4 transition-colors hover:border-primary/30">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-black text-text">{title}</h3>
      </div>
      <p className="text-sm font-medium text-muted">{description}</p>
    </Link>
  )
}
