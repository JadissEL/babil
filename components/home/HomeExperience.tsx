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
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider';
import { DelegatedApplicationsHomePromo } from '@/components/services/DelegatedApplicationsHomePromo';
import { ctaCompareHref, ctaExploreHref } from '@/lib/cta-hrefs';
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
  const exploreCtaHref = useMemo(() => ctaExploreHref(preference.primarySlug), [preference.primarySlug]);
  const compareCtaHref = useMemo(() => ctaCompareHref(preference.primarySlug), [preference.primarySlug]);

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
    <div className="home-meridian -mx-4 -mt-5 min-w-0 bg-[#e8ecf2] px-4 pb-16 pt-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-8">
      <section className="relative overflow-hidden rounded-[1.25rem] border border-slate-200/90 bg-white p-8 shadow-[0_20px_50px_rgba(10,31,51,0.07)] md:p-10 lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          aria-hidden
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Cpath fill='%230a1f33' d='M120 180c40-30 90-50 150-45 80 5 140 50 200 95 50 40 100 70 170 75 60 5 110-15 160-45V400H0V160c35 20 75 35 120 20z'/%3E%3C/svg%3E")`,
            backgroundPosition: '80% 60%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'min(90%, 52rem)',
          }}
        />
        <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#0a1f33]/80">
              <Sparkles className="h-3.5 w-3.5 text-[#3157d5]" aria-hidden /> {heroCopy.badge}
            </div>
            <h1 className="mt-5 max-w-4xl text-3xl font-black tracking-tight text-[#0a1f33] md:text-4xl lg:text-[2.75rem] lg:leading-tight">
              {heroCopy.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-slate-600 md:text-base">
              {heroCopy.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/probability"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0a1f33] px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-md transition-colors hover:bg-[#0f2d4a]"
              >
                Évaluer mes chances <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={exploreCtaHref}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-xs font-black uppercase tracking-widest text-[#0a1f33] shadow-sm transition-colors hover:bg-slate-50"
              >
                Ouvrir l&apos;Explorer
              </Link>
            </div>
          </div>
          <div className="relative min-h-[220px] lg:min-h-[280px]">
            <div className="absolute inset-0 rounded-2xl opacity-90 ring-1 ring-slate-200/80 lg:opacity-100">
              <HeroWorldCarousel slides={heroSlides} />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-sm md:p-6">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0a1f33]">
          <Target className="h-4 w-4 shrink-0" aria-hidden />
          Priorités pour votre parcours
        </div>
        <ul className="grid gap-2 text-sm font-medium text-[#0a1f33] md:grid-cols-2">
          {focusStrip.map((line) => (
            <li key={line} className="flex gap-2 rounded-xl border border-slate-200/80 bg-slate-50/90 px-3 py-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3157d5]" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <HomeQuickFilterEngine initialExplorerGoal={quickGoal} />

      <DelegatedApplicationsHomePromo variant="meridianBanner" />

      <section className="mt-2">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-[#0a1f33]">Pays à la une</h2>
          <Link
            href={exploreCtaHref}
            className="text-xs font-black uppercase tracking-widest text-[#3157d5] hover:text-[#2749bb]"
          >
            Tout voir
          </Link>
        </div>
        <CountryGrid countries={topCountries} />
      </section>

      <section className="mt-8">
        <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fonctionnalités</p>
          <p className="text-xs font-medium text-slate-600">
            Ordre adapté à votre objectif — les moteurs restent les mêmes, seule la mise en avant change.
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {featureKeys.map((key) => {
              const f = FEATURE_MAP[key];
              const href = key === 'compare' ? compareCtaHref : f.href;
              return <Feature key={key} href={href} icon={f.icon} title={f.title} description={f.description} />;
            })}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Avis utilisateurs</p>
            <h2 className="mt-2 text-2xl font-black text-[#0a1f33]">Retours après utilisation</h2>
          </div>
          <Link
            href="/community"
            className="text-xs font-black uppercase tracking-widest text-[#3157d5] hover:text-[#2749bb]"
          >
            Voir la communauté
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
              <p className="text-sm font-medium italic text-[#0a1f33]">
                <span className="not-italic">&ldquo;</span>
                {t.quote}
                <span className="not-italic">&rdquo;</span>
              </p>
              <p className="mt-4 text-sm font-black text-[#0a1f33]">{t.name}</p>
              <p className="text-xs font-semibold text-muted">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm md:p-8">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bonnes pratiques</p>
        <h2 className="mt-2 text-2xl font-black text-[#0a1f33]">Enchaînez les étapes dans le bon ordre</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {bestPractices.map((item, idx) => (
            <div key={item.title} className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-[#3157d5]">Étape {idx + 1}</p>
              <h3 className="mt-2 text-base font-black text-[#0a1f33]">{item.title}</h3>
              <p className="mt-2 text-sm font-medium text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <GoogleAd slot="home_top" />
      </div>

      <footer className="mt-10 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm md:p-8">
        <nav
          className="mb-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 border-b border-slate-200/80 pb-6 text-sm font-semibold text-slate-600"
          aria-label="Liens pied de page"
        >
          <span className="cursor-default opacity-60" title="Bientôt disponible">
            Mentions légales
          </span>
          <span className="cursor-default opacity-60" title="Bientôt disponible">
            Confidentialité
          </span>
          <Link href="/community" className="text-[#0a1f33] underline-offset-4 hover:text-[#3157d5] hover:underline">
            Contact
          </Link>
        </nav>
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">VisaFlow</p>
            <p className="mt-2 text-sm font-medium text-slate-600">
              Plateforme d&apos;aide à la décision pour la mobilité internationale : visas, études, business et
              installation.
            </p>
          </div>
          <div>
            <p className="text-sm font-black text-[#0a1f33]">Plateforme</p>
            <div className="mt-3 space-y-2 text-sm">
              <Link href={exploreCtaHref} className="block font-medium text-slate-600 hover:text-[#3157d5]">
                Explorer
              </Link>
              <Link href={compareCtaHref} className="block font-medium text-slate-600 hover:text-[#3157d5]">
                Comparer
              </Link>
              <Link href="/schengen" className="block font-medium text-slate-600 hover:text-[#3157d5]">
                Schengen
              </Link>
              <Link href="/probability" className="block font-medium text-slate-600 hover:text-[#3157d5]">
                Moteur de probabilités
              </Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-black text-[#0a1f33]">Parcours mobilité</p>
            <div className="mt-3 space-y-2 text-sm">
              <Link
                href="/services/delegated-applications"
                className="block font-medium text-slate-600 hover:text-[#3157d5]"
              >
                Assist candidatures
              </Link>
              <Link href="/education" className="block font-medium text-slate-600 hover:text-[#3157d5]">
                Éducation
              </Link>
              <Link href="/business" className="block font-medium text-slate-600 hover:text-[#3157d5]">
                Business
              </Link>
              <Link href="/investment" className="block font-medium text-slate-600 hover:text-[#3157d5]">
                Investissement
              </Link>
              <Link href="/permis" className="block font-medium text-slate-600 hover:text-[#3157d5]">
                Permis de conduire
              </Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-black text-[#0a1f33]">Compte & communauté</p>
            <div className="mt-3 space-y-2 text-sm">
              <Link href="/overview" className="block font-medium text-slate-600 hover:text-[#3157d5]">
                Tableau de bord
              </Link>
              <Link href="/recommendations" className="block font-medium text-slate-600 hover:text-[#3157d5]">
                Recommandations
              </Link>
              <Link href="/community" className="block font-medium text-slate-600 hover:text-[#3157d5]">
                Communauté
              </Link>
              <Link href="/moderation" className="block font-medium text-slate-600 hover:text-[#3157d5]">
                Modération
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 space-y-2 border-t border-slate-200/80 pt-4 text-xs font-semibold text-slate-500">
          <p>Conçu pour des décisions de mobilité concrètes et comparables.</p>
          <p>
            © {new Date().getFullYear()} VisaFlow · Réalisé par{' '}
            <span className="font-black text-[#0a1f33]">JADISS EL ANTAKI</span>
          </p>
        </div>
      </footer>
      </div>
    </div>
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
    <Link
      href={href}
      className="rounded-xl border border-slate-200/90 bg-slate-50/90 p-4 transition-colors hover:border-[#3157d5]/35 hover:bg-white"
    >
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-black text-[#0a1f33]">{title}</h3>
      </div>
      <p className="text-sm font-medium text-slate-600">{description}</p>
    </Link>
  );
}
