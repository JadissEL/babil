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
import GoalFilter from '@/components/filters/GoalFilter'
import BudgetFilter from '@/components/filters/BudgetFilter'
import RegionFilter from '@/components/filters/RegionFilter'
import RiskFilter from '@/components/filters/RiskFilter'
import CountryGrid, { type CountryGridItem } from '@/components/country/CountryGrid'
import GoogleAd from '../components/GoogleAd'
import HeroWorldCarousel from '@/components/home/HeroWorldCarousel'
import { DelegatedApplicationsHomePromo } from '@/components/services/DelegatedApplicationsHomePromo'
import prisma from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'VisaFlow — Mobilité internationale pour profils marocains',
  description:
    'Explorez les destinations : scores visa, friction, études et business. Filtres par objectif, budget et risque — puis approfondissez chaque pays.',
}

export const dynamic = 'force-dynamic'

const TOP_COUNTRIES_BASE: CountryGridItem[] = [
    {
      id: 'fr-showcase',
      name: 'France',
      code: 'fr',
      score: 82,
      visaScore: 80,
      friction: 'Medium',
      study: 'Strong',
      business: 'Medium',
    },
    {
      id: 'ca-showcase',
      name: 'Canada',
      code: 'ca',
      score: 78,
      visaScore: 76,
      friction: 'Low',
      study: 'Strong',
      business: 'Strong',
    },
    {
      id: 'de-showcase',
      name: 'Germany',
      code: 'de',
      score: 76,
      visaScore: 77,
      friction: 'Medium',
      study: 'Strong',
      business: 'Strong',
    },
    {
      id: 'jp-showcase',
      name: 'Japan',
      code: 'jp',
      score: 74,
      visaScore: 72,
      friction: 'Medium',
      study: 'Medium',
      business: 'Medium',
    },
    {
      id: 'gb-showcase',
      name: 'United Kingdom',
      code: 'gb',
      score: 73,
      visaScore: 70,
      friction: 'High',
      study: 'Strong',
      business: 'Strong',
    },
]

async function resolveTopCountries(): Promise<CountryGridItem[]> {
  const names = TOP_COUNTRIES_BASE.map((c) => c.name)
  try {
    const rows = await prisma.country.findMany({
      where: { name: { in: names } },
      select: { id: true, name: true },
    })
    const idByName: Record<string, number> = Object.fromEntries(
      rows.map((r) => [r.name, r.id]),
    )
    return TOP_COUNTRIES_BASE.map((row) => ({
      ...row,
      id:
        typeof idByName[row.name] === 'number'
          ? String(idByName[row.name])
          : row.id,
    }))
  } catch {
    return TOP_COUNTRIES_BASE
  }
}

export default async function Home() {
  const topCountries = await resolveTopCountries()
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
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-[#f8f2e8] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Global Mobility Intelligence
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-text md:text-5xl">Decision intelligence SaaS for visas, education, business and mobility.</h1>
              <p className="mt-4 max-w-2xl text-sm font-medium text-muted md:text-base">
                Data-first dashboard for Moroccan users: compare countries, understand risk and friction, and choose your best path with explainable scoring.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/recommendations" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-primary-hover">
                  Start Free Analysis <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/explorer" className="inline-flex items-center gap-2 rounded-xl border border-line bg-[#f8f2e8] px-5 py-3 text-xs font-black uppercase tracking-widest text-text hover:bg-primary-soft">
                  Open Explorer
                </Link>
              </div>
            </div>
            <HeroWorldCarousel />
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-line bg-surface p-4 shadow-soft">
          <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted">Quick Filter Engine</p>
          <div className="flex flex-wrap gap-2">
            <GoalFilter value="all" />
            <BudgetFilter value="all" />
            <RegionFilter value="all" />
            <RiskFilter value="all" />
          </div>
        </section>

        <DelegatedApplicationsHomePromo />

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-text">Top Countries Grid</h2>
            <Link href="/explorer" className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary-hover">View all</Link>
          </div>
          <CountryGrid countries={topCountries} />
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <AppSidebar />
          <div className="space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-soft">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Features</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Feature href="/probability" icon={<Zap className="h-5 w-5 text-blue-400" />} title="Visa Engine" description="Deterministic scoring with explainable breakdown." />
              <Feature href="/schengen" icon={<ShieldCheck className="h-5 w-5 text-indigo-400" />} title="Schengen Hub" description="Side-by-side country friction and acceptance." />
              <Feature
                href="/services/delegated-applications"
                icon={<FileStack className="h-5 w-5 text-rose-400" />}
                title="Assist applications"
                description="Delegated CV, motivation letters & submissions — authenticated users."
              />
              <Feature href="/education" icon={<GraduationCap className="h-5 w-5 text-violet-400" />} title="Education" description="Languages, technical training, short courses." />
              <Feature
                href="/community"
                icon={<MessagesSquare className="h-5 w-5 text-fuchsia-400" />}
                title="Community"
                description="Terrain feedback and moderated comments per country."
              />
              <Feature href="/business" icon={<Briefcase className="h-5 w-5 text-amber-400" />} title="Business" description="Business setup and investment opportunities." />
              <Feature href="/permis" icon={<Car className="h-5 w-5 text-emerald-400" />} title="Driving License" description="Validity and conversion per destination." />
              <Feature href="/recommendations" icon={<BarChart3 className="h-5 w-5 text-cyan-400" />} title="Recommendation Mode" description="AI-like ranking with deterministic logic." />
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-line bg-surface p-6 shadow-soft md:p-8">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted">User Feedback</p>
              <h2 className="mt-2 text-2xl font-black text-text">What users say after using VisaFlow</h2>
            </div>
            <Link href="/community" className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary-hover">
              See community
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-xl border border-line bg-[#f8f2e8] p-4">
                <p className="text-sm font-medium italic text-text">"{t.quote}"</p>
                <p className="mt-4 text-sm font-black text-text">{t.name}</p>
                <p className="text-xs font-semibold text-muted">{t.role}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-line bg-surface p-6 shadow-soft md:p-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted">Best Practices</p>
          <h2 className="mt-2 text-2xl font-black text-text">Use the platform in the right order</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {bestPractices.map((item, idx) => (
              <div key={item.title} className="rounded-xl border border-line bg-[#f8f2e8] p-4">
                <p className="text-xs font-black uppercase tracking-widest text-primary">Step {idx + 1}</p>
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
                Decision intelligence platform for Moroccan mobility planning across visa, education, business and relocation.
              </p>
            </div>
            <div>
              <p className="text-sm font-black text-text">Platform</p>
              <div className="mt-3 space-y-2 text-sm">
                <Link href="/explorer" className="block font-medium text-muted hover:text-primary">Explorer</Link>
                <Link href="/compare" className="block font-medium text-muted hover:text-primary">Compare</Link>
                <Link href="/schengen" className="block font-medium text-muted hover:text-primary">Schengen</Link>
                <Link href="/probability" className="block font-medium text-muted hover:text-primary">Probability Engine</Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-black text-text">Mobility Tracks</p>
              <div className="mt-3 space-y-2 text-sm">
                <Link href="/services/delegated-applications" className="block font-medium text-muted hover:text-primary">Assist candidatures</Link>
                <Link href="/education" className="block font-medium text-muted hover:text-primary">Education</Link>
                <Link href="/business" className="block font-medium text-muted hover:text-primary">Business</Link>
                <Link href="/investment" className="block font-medium text-muted hover:text-primary">Investment</Link>
                <Link href="/permis" className="block font-medium text-muted hover:text-primary">Driving License</Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-black text-text">Account & Community</p>
              <div className="mt-3 space-y-2 text-sm">
                <Link href="/overview" className="block font-medium text-muted hover:text-primary">Dashboard</Link>
                <Link href="/recommendations" className="block font-medium text-muted hover:text-primary">Recommendations</Link>
                <Link href="/community" className="block font-medium text-muted hover:text-primary">Community</Link>
                <Link href="/moderation" className="block font-medium text-muted hover:text-primary">Moderation</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-line pt-4 text-xs font-semibold text-muted">
            © {new Date().getFullYear()} VisaFlow. Built for practical and comparable mobility decisions.
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
    <Link href={href} className="rounded-xl border border-line bg-[#f8f2e8] p-4 transition-colors hover:border-primary/30">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-black text-text">{title}</h3>
      </div>
      <p className="text-sm font-medium text-muted">{description}</p>
    </Link>
  )
}
