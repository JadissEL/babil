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
} from 'lucide-react'
import PageContainer from '@/components/layout/PageContainer'
import AppSidebar from '@/components/layout/AppSidebar'
import GoalFilter from '@/components/filters/GoalFilter'
import BudgetFilter from '@/components/filters/BudgetFilter'
import RegionFilter from '@/components/filters/RegionFilter'
import RiskFilter from '@/components/filters/RiskFilter'
import CountryGrid, { type CountryGridItem } from '@/components/country/CountryGrid'
import GoogleAd from '../components/GoogleAd'

export const metadata: Metadata = {
  title: 'VisaFlow — Mobilité internationale pour profils marocains',
  description:
    'Explorez les destinations : scores visa, friction, études et business. Filtres par objectif, budget et risque — puis approfondissez chaque pays.',
}

export default function Home() {
  const topCountries: CountryGridItem[] = [
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

  return (
    <PageContainer className="py-12">
        <section className="rounded-2xl border border-white/10 bg-[#111827] p-8 md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" /> Global Mobility Intelligence
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-white md:text-5xl">Decision intelligence SaaS for visas, education, business and mobility.</h1>
          <p className="mt-4 max-w-2xl text-sm font-medium text-slate-400 md:text-base">
            Data-first dashboard for Moroccan users: compare countries, understand risk and friction, and choose your best path with explainable scoring.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/recommendations" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-500">
              Start Free Analysis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/explorer" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-100 hover:bg-white/10">
              Open Explorer
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-[#111827] p-4">
          <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Filter Engine</p>
          <div className="flex flex-wrap gap-2">
            <GoalFilter value="all" />
            <BudgetFilter value="all" />
            <RegionFilter value="all" />
            <RiskFilter value="all" />
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-white">Top Countries Grid</h2>
            <Link href="/explorer" className="text-xs font-black uppercase tracking-widest text-blue-400 hover:text-blue-300">View all</Link>
          </div>
          <CountryGrid countries={topCountries} />
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <AppSidebar />
          <div className="space-y-4 rounded-2xl border border-white/10 bg-[#111827] p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Features</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Feature href="/probability" icon={<Zap className="h-5 w-5 text-blue-400" />} title="Visa Engine" description="Deterministic scoring with explainable breakdown." />
              <Feature href="/schengen" icon={<ShieldCheck className="h-5 w-5 text-indigo-400" />} title="Schengen Hub" description="Side-by-side country friction and acceptance." />
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

        <div className="mt-8">
          <GoogleAd slot="home_top" />
        </div>
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
    <Link href={href} className="rounded-xl border border-white/10 bg-[#0B0F19] p-4 transition-colors hover:border-blue-500/30">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-black text-white">{title}</h3>
      </div>
      <p className="text-sm font-medium text-slate-400">{description}</p>
    </Link>
  )
}
