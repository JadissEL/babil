'use client';

import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Car,
  GraduationCap,
  MessagesSquare,
  Scale,
  ShieldCheck,
  Sparkles,
  Zap,
  FileStack,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { type ReactNode, useMemo } from 'react';
import CountryGrid from '@/components/country/CountryGrid';
import type { CountryGridItem } from '@/components/country/CountryGrid';
import GoogleAd from '@/components/GoogleAd';
import HeroWorldCarousel from '@/components/home/HeroWorldCarousel';
import HomeQuickFilterEngine from '@/components/home/HomeQuickFilterEngine';
import AppSidebar from '@/components/layout/AppSidebar';
import PageContainer from '@/components/layout/PageContainer';
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider';
import { DelegatedApplicationsHomePromo } from '@/components/services/DelegatedApplicationsHomePromo';
import type { HomeHeroSlide } from '@/lib/home-hero-slides';
import {
  focusStripForObjective,
  homeFeatureOrderForObjective,
  homeHeroForObjective,
  type HomeFeatureKey,
} from '@/lib/user-objectives/home-orchestration';
import { getObjectiveBySlug } from '@/lib/user-objectives/registry';

const FEATURE_MAP: Record<
  HomeFeatureKey,
  { href: string; icon: ReactNode; title: string; description: string }
> = {
  probability: {
    href: '/probability',
    icon: <Zap className="h-5 w-5 text-blue-400" />,
    title: 'Moteur de probabilités',
    description: 'Scores déterministes avec décomposition lisible pays par pays.',
  },
  schengen: {
    href: '/schengen',
    icon: <ShieldCheck className="h-5 w-5 text-indigo-400" />,
    title: 'Espace Schengen',
    description: 'Friction, acceptation et comparaisons côte à côte.',
  },
  delegated: {
    href: '/services/delegated-applications',
    icon: <FileStack className="h-5 w-5 text-rose-400" />,
    title: 'Assist candidatures',
    description: 'CV, lettres et dossiers délégués — utilisateurs connectés.',
  },
  education: {
    href: '/education',
    icon: <GraduationCap className="h-5 w-5 text-violet-400" />,
    title: 'Éducation',
    description: 'Langues, formations techniques et cours courts à l’étranger.',
  },
  community: {
    href: '/community',
    icon: <MessagesSquare className="h-5 w-5 text-fuchsia-400" />,
    title: 'Communauté',
    description: 'Retours terrain et commentaires modérés par pays.',
  },
  business: {
    href: '/business',
    icon: <Briefcase className="h-5 w-5 text-amber-400" />,
    title: 'Business',
    description: 'Installation, marchés et pistes investissement.',
  },
  investment: {
    href: '/investment',
    icon: <BarChart3 className="h-5 w-5 text-emerald-400" />,
    title: 'Investissement',
    description: 'Cadres, risques et signaux pour projets capital.',
  },
  permis: {
    href: '/permis',
    icon: <Car className="h-5 w-5 text-teal-400" />,
    title: 'Permis de conduire',
    description: 'Validité et conversion selon la destination.',
  },
  recommendations: {
    href: '/recommendations',
    icon: <BarChart3 className="h-5 w-5 text-cyan-400" />,
    title: 'Recommandations',
    description: 'Classement explicable aligné sur votre profil.',
  },
  compare: {
    href: '/compare',
    icon: <Scale className="h-5 w-5 text-orange-400" />,
    title: 'Comparer',
    description: 'Comparer pays et critères visa / friction côte à côte.',
  },
};

export function HomeExperience({
  topCountries,
  heroSlides,
}: {
  topCountries: CountryGridItem[];
  heroSlides: HomeHeroSlide[];
}) {
  const { preference } = useObjectivePreference();
  const primaryDefinition = useMemo(
    () => getObjectiveBySlug(preference.primarySlug),
    [preference.primarySlug],
  );
  const heroCopy = useMemo(() => homeHeroForObjective(preference.primarySlug), [preference.primarySlug]);
  const featureKeys = useMemo(
    () => homeFeatureOrderForObjective(primaryDefinition),
    [primaryDefinition],
  );
  const focusStrip = useMemo(() => focusStripForObjective(preference.primarySlug), [preference.primarySlug]);
  const quickGoal = primaryDefinition?.explorerGoalDefault ?? 'all';

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
  ];

  const bestPractices = [
    {
      title: 'Commencer par ton objectif réel',
      text: 'Ton objectif principal pilote désormais l’accueil et les raccourcis. Tu peux le changer depuis l’en-tête à tout moment.',
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
  ];

  return (
    <PageContainer className="py-12">
      <section className="rounded-2xl border border-line bg-surface p-8 shadow-card md:p-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-inset px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> {heroCopy.badge}
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-text md:text-5xl">
              {heroCopy.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-medium text-muted md:text-base">{heroCopy.subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/recommendations"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-primary-hover"
              >
                Lancer une analyse <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/explorer"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-inset px-5 py-3 text-xs font-black uppercase tracking-widest text-text hover:bg-primary-soft"
              >
                Ouvrir l&apos;Explorer
              </Link>
            </div>
          </div>
          <HeroWorldCarousel slides={heroSlides} />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-primary/25 bg-primary-soft/35 p-5 shadow-soft md:p-6">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
          <Target className="h-4 w-4 shrink-0" aria-hidden />
          Priorités pour votre parcours
        </div>
        <ul className="grid gap-2 text-sm font-medium text-text md:grid-cols-2">
          {focusStrip.map((line) => (
            <li key={line} className="flex gap-2 rounded-xl border border-line/80 bg-surface/80 px-3 py-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <HomeQuickFilterEngine initialExplorerGoal={quickGoal} />

      <DelegatedApplicationsHomePromo />

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-text">Pays à la une</h2>
          <Link
            href="/explorer"
            className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary-hover"
          >
            Tout voir
          </Link>
        </div>
        <CountryGrid countries={topCountries} />
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <AppSidebar />
        <div className="space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-soft">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted">Fonctionnalités</p>
          <p className="text-xs font-medium text-muted">
            Ordre adapté à votre objectif — les moteurs restent les mêmes, seule la mise en avant change.
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {featureKeys.map((key) => {
              const f = FEATURE_MAP[key];
              return <Feature key={key} href={f.href} icon={f.icon} title={f.title} description={f.description} />;
            })}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-line bg-surface p-6 shadow-soft md:p-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Avis utilisateurs</p>
            <h2 className="mt-2 text-2xl font-black text-text">Retours après utilisation</h2>
          </div>
          <Link
            href="/community"
            className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary-hover"
          >
            Voir la communauté
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-xl border border-line bg-inset p-4">
              <p className="text-sm font-medium italic text-text">
                <span className="not-italic">&ldquo;</span>
                {t.quote}
                <span className="not-italic">&rdquo;</span>
              </p>
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
              <Link
                href="/services/delegated-applications"
                className="block font-medium text-muted hover:text-primary"
              >
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
          </p>
        </div>
      </footer>
    </PageContainer>
  );
}

function Feature({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="rounded-xl border border-line bg-inset p-4 transition-colors hover:border-primary/30">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-black text-text">{title}</h3>
      </div>
      <p className="text-sm font-medium text-muted">{description}</p>
    </Link>
  );
}
