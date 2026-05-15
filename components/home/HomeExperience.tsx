'use client';

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import {
  ArrowRight,
  BarChart3,
  Brain,
  Briefcase,
  Car,
  Compass,
  FileStack,
  Globe,
  GraduationCap,
  Heart,
  MessagesSquare,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { type ReactNode, useMemo } from 'react';
import CountryGrid from '@/components/country/CountryGrid';
import type { CountryGridItem } from '@/components/country/CountryGrid';
import GoogleAd from '@/components/GoogleAd';
import HeroWorldCarousel from '@/components/home/HeroWorldCarousel';
import HomeQuickFilterEngine from '@/components/home/HomeQuickFilterEngine';
import { GlobalCountrySearch } from '@/components/nav/GlobalCountrySearch';
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider';
import { DelegatedApplicationsHomePromo } from '@/components/services/DelegatedApplicationsHomePromo';
import { ctaCompareHref, ctaExploreHref } from '@/lib/cta-hrefs';
import type { HomeHeroSlide } from '@/lib/home-hero-slides';
import { PAYPAL_DONATE_URL } from '@/lib/paypal-donate';
import {
  focusStripForObjective,
  homeFeatureOrderForObjective,
  homeHeroForObjective,
  type HomeFeatureKey,
} from '@/lib/user-objectives/home-orchestration';
import { getObjectiveBySlug } from '@/lib/user-objectives/registry';

const INK = '#0D1B3E';
const INK_60 = 'rgba(13,27,62,0.60)';
const INK_45 = 'rgba(13,27,62,0.45)';
const INK_10 = 'rgba(13,27,62,0.10)';
const CREAM_BG = '#FDF8EF';
const CREAM_PANEL = '#F5F0E3';

const FEATURE_MAP: Record<
  HomeFeatureKey,
  { href: string; icon: ReactNode; title: string; description: string }
> = {
  probability: {
    href: '/probability',
    icon: <Zap className="h-4 w-4" style={{ color: INK }} aria-hidden />,
    title: 'Moteur de probabilités',
    description: 'Scores déterministes avec décomposition lisible pays par pays.',
  },
  schengen: {
    href: '/schengen',
    icon: <ShieldCheck className="h-4 w-4" style={{ color: INK }} aria-hidden />,
    title: 'Espace Schengen',
    description: 'Friction, acceptation et comparaisons côte à côte.',
  },
  delegated: {
    href: '/services/delegated-applications',
    icon: <FileStack className="h-4 w-4" style={{ color: INK }} aria-hidden />,
    title: 'Assist candidatures',
    description: 'CV, lettres et dossiers délégués — utilisateurs connectés.',
  },
  education: {
    href: '/education',
    icon: <GraduationCap className="h-4 w-4" style={{ color: INK }} aria-hidden />,
    title: 'Éducation',
    description: 'Langues, formations techniques et cours courts à l’étranger.',
  },
  community: {
    href: '/community',
    icon: <MessagesSquare className="h-4 w-4" style={{ color: INK }} aria-hidden />,
    title: 'Communauté',
    description: 'Retours terrain et commentaires modérés par pays.',
  },
  business: {
    href: '/business',
    icon: <Briefcase className="h-4 w-4" style={{ color: INK }} aria-hidden />,
    title: 'Business',
    description: 'Installation, marchés et pistes investissement.',
  },
  investment: {
    href: '/investment',
    icon: <BarChart3 className="h-4 w-4" style={{ color: INK }} aria-hidden />,
    title: 'Investissement',
    description: 'Cadres, risques et signaux pour projets capital.',
  },
  permis: {
    href: '/permis',
    icon: <Car className="h-4 w-4" style={{ color: INK }} aria-hidden />,
    title: 'Permis de conduire',
    description: 'Validité et conversion selon la destination.',
  },
  recommendations: {
    href: '/recommendations',
    icon: <BarChart3 className="h-4 w-4" style={{ color: INK }} aria-hidden />,
    title: 'Recommandations',
    description: 'Classement explicable aligné sur votre profil.',
  },
  compare: {
    href: '/compare',
    icon: <Scale className="h-4 w-4" style={{ color: INK }} aria-hidden />,
    title: 'Comparer',
    description: 'Comparer pays et critères visa / friction côte à côte.',
  },
};

const WORLD_MAP_DATA_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1280 640' preserveAspectRatio='xMidYMid meet'%3E%3Cpath fill='%230D1B3E' d='M156 240c44-22 88-30 132-22 38 7 70 26 100 50 24 19 50 33 78 41 33 9 68 9 102 4 35-5 70-15 105-22 33-7 67-12 100-7 30 4 58 18 84 36 22 16 41 36 56 60 12 19 21 41 26 64 5 22 6 46 1 69-4 22-13 43-26 61-15 22-35 39-58 50-25 12-52 18-79 19-30 0-60-6-87-19-25-12-46-31-63-53-15-19-26-41-31-66-5-25-5-51 1-76 6-25 17-49 33-69 18-22 41-38 67-49 9-3 18-6 27-8z M820 130c30-12 62-18 94-15 28 2 55 12 79 29 21 14 39 33 51 56 12 22 18 47 17 73-1 28-9 55-23 79-14 23-34 42-58 56-26 15-55 23-85 24-31 1-62-6-90-19-23-12-43-29-58-51-13-19-22-42-26-65-5-24-4-50 4-74 8-25 22-47 41-66 15-15 33-26 53-32 1-1 1-1 1-2zM280 410c34-10 70-12 104-5 31 6 60 19 86 36 22 14 41 31 57 51 14 17 25 36 31 56 6 19 7 39 4 59-4 21-13 41-27 58-15 19-34 33-56 43-23 11-49 17-75 17-28 0-56-6-81-19-22-12-41-29-56-50-13-18-22-39-26-60-5-22-5-44 1-65 7-22 19-43 36-60 14-15 30-26 49-32 5-1 9-2 14-3z'/%3E%3C/svg%3E\")";

const TRUST_BADGES = [
  'Sources officielles',
  'Méthodologie ouverte',
  'Mis à jour en continu',
];

/** Section-nav items rendered as the floating pill bar overlapping the dark banner. */
type SectionNavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  emphasized?: boolean;
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

  const sectionNav: SectionNavItem[] = useMemo(
    () => [
      {
        label: 'Explorer',
        href: exploreCtaHref,
        icon: <Compass className="h-3.5 w-3.5" aria-hidden />,
        emphasized: true,
      },
      {
        label: 'Schengen',
        href: '/schengen',
        icon: <ShieldCheck className="h-3.5 w-3.5" aria-hidden />,
      },
      {
        label: 'Comparer',
        href: compareCtaHref,
        icon: <Scale className="h-3.5 w-3.5" aria-hidden />,
      },
      {
        label: 'Moteur Visa',
        href: '/probability',
        icon: <Zap className="h-3.5 w-3.5" aria-hidden />,
      },
      {
        label: 'Intelligence',
        href: '/intelligence-fieldpaths',
        icon: <Brain className="h-3.5 w-3.5" aria-hidden />,
      },
    ],
    [compareCtaHref, exploreCtaHref],
  );

  const testimonials = [
    {
      name: 'Yassine A.',
      role: 'Profil travail · Casablanca',
      quote:
        'J’ai réduit mon shortlist de 12 pays à 3 en une soirée. Les scores de friction m’ont évité des pistes trop compliquées pour mon profil.',
    },
    {
      name: 'Salma M.',
      role: 'Objectif études · Rabat',
      quote:
        'La comparaison Schengen + les modules education m’ont aidée à comprendre où mes chances étaient réalistes, pas seulement « populaires ».',
    },
    {
      name: 'Imane K.',
      role: 'Projet business · Tanger',
      quote:
        'Le croisement visa, business et terrain m’a donné un plan concret. J’ai pu prioriser un pays avec moins de risque opérationnel.',
    },
  ];

  const bestPractices = [
    {
      title: 'Commencer par ton objectif réel',
      text: 'Ton objectif principal pilote l’accueil et les raccourcis. Tu peux le changer depuis l’en-tête à tout moment.',
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
      text: 'Consulte la section communauté et les commentaires modérés pour compléter la vue « officielle » par la réalité d’exécution.',
    },
  ];

  return (
    <div
      className="home-meridian flex min-h-screen flex-col"
      style={{ backgroundColor: CREAM_BG, color: INK }}
    >
      <MeridianHomeHeader />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 px-4 pb-16 pt-6 focus:outline-none sm:px-6 sm:pt-8 lg:px-10"
      >
        <div className="mx-auto w-full max-w-6xl space-y-14">
          {/* HERO — Stitch alignment: single-column over faded world map */}
          <section
            className="relative overflow-hidden rounded-[2rem] border bg-white shadow-[0_24px_60px_rgba(13,27,62,0.08)]"
            style={{ borderColor: INK_10 }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: WORLD_MAP_DATA_URL,
                backgroundPosition: 'right -2% top 50%',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'min(110%, 56rem)',
                opacity: 0.085,
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 hidden w-2/3 bg-gradient-to-r from-white via-white/95 to-transparent lg:block"
            />
            <div className="relative px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
              <div className="max-w-2xl">
                <p
                  className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.32em]"
                  style={{ color: INK_60 }}
                >
                  <Sparkles className="h-3 w-3" style={{ color: INK }} aria-hidden />
                  {heroCopy.badge}
                </p>
                <h1
                  className="mt-5 font-serif text-[clamp(2.5rem,5vw,3.75rem)] font-black leading-[1.02] tracking-tight"
                  style={{ color: INK }}
                >
                  {heroCopy.title}
                </h1>
                <p
                  className="mt-5 max-w-xl text-[15px] leading-relaxed sm:text-[16px]"
                  style={{ color: INK_60 }}
                >
                  {heroCopy.subtitle}
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <Link
                    href="/probability"
                    className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[12px] font-black uppercase tracking-[0.18em] text-white shadow-[0_8px_24px_rgba(13,27,62,0.20)] transition-[transform,filter] hover:translate-y-[-1px] hover:brightness-110"
                    style={{ backgroundColor: INK }}
                  >
                    Évaluer mes chances
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                  <Link
                    href={exploreCtaHref}
                    className="inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.22em] underline-offset-4 transition-colors hover:underline"
                    style={{ color: INK }}
                  >
                    Ouvrir l&apos;Explorer
                  </Link>
                </div>
                <ul
                  className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] font-black uppercase tracking-[0.22em]"
                  style={{ color: INK_45 }}
                  aria-label="Garanties éditoriales"
                >
                  {TRUST_BADGES.map((b) => (
                    <li key={b} className="inline-flex items-center gap-1.5">
                      <span
                        className="inline-block h-1 w-1 rounded-full"
                        style={{ backgroundColor: INK_45 }}
                        aria-hidden
                      />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* DARK NAVY BANNER + FLOATING SECTION NAV PILL — Stitch architecture */}
          <div className="relative">
            <DelegatedApplicationsHomePromo variant="meridianBanner" />
            <MeridianSectionNav items={sectionNav} />
          </div>

          {/* PRIORITIES STRIP — objective-aware */}
          <section
            className="rounded-2xl border bg-white px-5 py-5 sm:px-6"
            style={{ borderColor: INK_10 }}
            aria-labelledby="home-focus-title"
          >
            <h2
              id="home-focus-title"
              className="mb-3 flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.28em]"
              style={{ color: INK_60 }}
            >
              <Target className="h-3.5 w-3.5" aria-hidden style={{ color: INK }} />
              Priorités pour votre parcours
            </h2>
            <ul className="grid gap-2 text-[13.5px] font-medium md:grid-cols-2" style={{ color: INK }}>
              {focusStrip.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-2 rounded-xl border px-3 py-2"
                  style={{ borderColor: INK_10, backgroundColor: CREAM_PANEL }}
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: INK }}
                    aria-hidden
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* QUICK FILTER ENGINE */}
          <HomeQuickFilterEngine initialExplorerGoal={quickGoal} />

          {/* DESTINATIONS — vérified slide carousel */}
          <section aria-labelledby="home-destinations-title" className="space-y-4">
            <header className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p
                  className="font-mono text-[10px] font-black uppercase tracking-[0.28em]"
                  style={{ color: INK_60 }}
                >
                  Destinations vérifiées
                </p>
                <h2
                  id="home-destinations-title"
                  className="mt-1 font-serif text-[26px] font-black tracking-tight"
                  style={{ color: INK }}
                >
                  Le monde, en images sourcées.
                </h2>
              </div>
              <Link
                href={exploreCtaHref}
                className="font-mono text-[11px] font-black uppercase tracking-[0.22em] underline-offset-4 hover:underline"
                style={{ color: INK }}
              >
                Tout explorer
              </Link>
            </header>
            <HeroWorldCarousel slides={heroSlides} />
          </section>

          {/* COUNTRY GRID */}
          <section aria-labelledby="home-grid-title" className="space-y-4">
            <header className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p
                  className="font-mono text-[10px] font-black uppercase tracking-[0.28em]"
                  style={{ color: INK_60 }}
                >
                  Pays à la une
                </p>
                <h2
                  id="home-grid-title"
                  className="mt-1 font-serif text-[26px] font-black tracking-tight"
                  style={{ color: INK }}
                >
                  Atterrissez sur la bonne piste.
                </h2>
              </div>
              <Link
                href={exploreCtaHref}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] font-black uppercase tracking-[0.22em] underline-offset-4 hover:underline"
                style={{ color: INK }}
              >
                <Compass className="h-3.5 w-3.5" aria-hidden />
                Tout voir
              </Link>
            </header>
            <CountryGrid countries={topCountries} />
          </section>

          {/* FEATURES — objective-aware */}
          <section
            className="rounded-2xl border bg-white p-6 sm:p-8"
            style={{ borderColor: INK_10 }}
            aria-labelledby="home-features-title"
          >
            <p
              className="font-mono text-[10px] font-black uppercase tracking-[0.28em]"
              style={{ color: INK_60 }}
            >
              Modules VisaFlow
            </p>
            <h2
              id="home-features-title"
              className="mt-1 max-w-2xl font-serif text-[26px] font-black tracking-tight"
              style={{ color: INK }}
            >
              Une seule plateforme, alignée sur votre objectif.
            </h2>
            <p className="mt-2 max-w-2xl text-[13.5px]" style={{ color: INK_60 }}>
              L&apos;ordre s&apos;adapte à votre choix dans le dock — les moteurs restent les mêmes, seule la
              mise en avant change.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {featureKeys.map((key) => {
                const f = FEATURE_MAP[key];
                const href = key === 'compare' ? compareCtaHref : f.href;
                return (
                  <Feature key={key} href={href} icon={f.icon} title={f.title} description={f.description} />
                );
              })}
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section
            className="rounded-2xl border bg-white p-6 sm:p-8"
            style={{ borderColor: INK_10 }}
            aria-labelledby="home-testimonials-title"
          >
            <header className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p
                  className="font-mono text-[10px] font-black uppercase tracking-[0.28em]"
                  style={{ color: INK_60 }}
                >
                  Avis utilisateurs
                </p>
                <h2
                  id="home-testimonials-title"
                  className="mt-1 font-serif text-[26px] font-black tracking-tight"
                  style={{ color: INK }}
                >
                  Retours après utilisation.
                </h2>
              </div>
              <Link
                href="/community"
                className="font-mono text-[11px] font-black uppercase tracking-[0.22em] underline-offset-4 hover:underline"
                style={{ color: INK }}
              >
                Voir la communauté
              </Link>
            </header>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {testimonials.map((t) => (
                <figure
                  key={t.name}
                  className="flex h-full flex-col rounded-2xl border px-5 py-5"
                  style={{ borderColor: INK_10, backgroundColor: CREAM_PANEL }}
                >
                  <blockquote
                    className="text-[14px] leading-relaxed"
                    style={{ color: INK }}
                  >
                    « {t.quote} »
                  </blockquote>
                  <figcaption className="mt-auto pt-5">
                    <p className="text-[14px] font-black" style={{ color: INK }}>
                      {t.name}
                    </p>
                    <p className="text-[11.5px]" style={{ color: INK_60 }}>
                      {t.role}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          {/* BEST PRACTICES */}
          <section
            className="rounded-2xl border bg-white p-6 sm:p-8"
            style={{ borderColor: INK_10 }}
            aria-labelledby="home-bp-title"
          >
            <p
              className="font-mono text-[10px] font-black uppercase tracking-[0.28em]"
              style={{ color: INK_60 }}
            >
              Bonnes pratiques
            </p>
            <h2
              id="home-bp-title"
              className="mt-1 max-w-2xl font-serif text-[26px] font-black tracking-tight"
              style={{ color: INK }}
            >
              Enchaînez les étapes dans le bon ordre.
            </h2>
            <ol className="mt-6 grid gap-4 md:grid-cols-2">
              {bestPractices.map((item, idx) => (
                <li
                  key={item.title}
                  className="flex flex-col rounded-2xl border px-5 py-5"
                  style={{ borderColor: INK_10, backgroundColor: CREAM_PANEL }}
                >
                  <p
                    className="font-mono text-[10px] font-black uppercase tracking-[0.24em]"
                    style={{ color: INK_60 }}
                  >
                    Étape {idx + 1}
                  </p>
                  <h3 className="mt-2 text-[16px] font-black" style={{ color: INK }}>
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: INK_60 }}>
                    {item.text}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* AD SLOT — quiet placement */}
          <div className="pt-2">
            <GoogleAd slot="home_top" />
          </div>
        </div>
      </main>

      <MeridianHomeFooter />
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * MeridianHomeHeader — slim cream sticky header (PAGE 01 Stitch architecture).
 * Replaces the global SiteHeader on the `/` route (see SiteChrome).
 * - Left: VisaFlow logo (primary accent box)
 * - Right: GlobalCountrySearch pill + auth CTA (Espace perso / Tableau de bord)
 * ------------------------------------------------------------------------- */
function MeridianHomeHeader() {
  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{
        backgroundColor: 'rgba(253,248,239,0.88)',
        borderColor: INK_10,
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="VisaFlow — Accueil">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-[0_4px_12px_rgba(13,27,62,0.18)]"
            style={{ backgroundColor: '#3157d5' }}
            aria-hidden
          >
            <Globe className="h-5 w-5" />
          </span>
          <span
            className="font-serif text-[22px] font-black tracking-tight"
            style={{ color: '#3157d5' }}
          >
            VisaFlow
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <GlobalCountrySearch />
          <SignedOut>
            <SignInButton mode="modal">
              <button
                type="button"
                className="inline-flex items-center rounded-full px-5 py-2.5 font-mono text-[10.5px] font-black uppercase tracking-[0.22em] text-white shadow-[0_6px_18px_rgba(13,27,62,0.20)] transition-[filter,transform] hover:translate-y-[-1px] hover:brightness-110"
                style={{ backgroundColor: INK }}
              >
                Espace perso
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/overview"
              className="inline-flex items-center rounded-full px-5 py-2.5 font-mono text-[10.5px] font-black uppercase tracking-[0.22em] text-white shadow-[0_6px_18px_rgba(13,27,62,0.20)] transition-[filter,transform] hover:translate-y-[-1px] hover:brightness-110"
              style={{ backgroundColor: INK }}
            >
              Espace perso
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------------------
 * MeridianSectionNav — floating pill bar overlapping the bottom of the dark
 * navy services banner. Emphasised item ("Explorer") gets the dark inset,
 * others are light cream tabs.
 * ------------------------------------------------------------------------- */
function MeridianSectionNav({ items }: { items: SectionNavItem[] }) {
  return (
    <nav
      aria-label="Sections principales"
      className="pointer-events-none absolute inset-x-0 -bottom-6 z-10 flex justify-center px-4 sm:-bottom-7"
    >
      <ul
        className="pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-full border bg-white px-2 py-1.5 shadow-[0_12px_32px_rgba(13,27,62,0.18)] sm:gap-1.5"
        style={{ borderColor: INK_10 }}
      >
        {items.map((item) => {
          const isEmphasized = Boolean(item.emphasized);
          return (
            <li key={item.label} className="shrink-0">
              <Link
                href={item.href}
                className={
                  isEmphasized
                    ? 'inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-mono text-[10.5px] font-black uppercase tracking-[0.22em] text-white transition-[filter] hover:brightness-110'
                    : 'inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-mono text-[10.5px] font-black uppercase tracking-[0.22em] transition-colors hover:bg-[rgba(13,27,62,0.06)]'
                }
                style={{
                  backgroundColor: isEmphasized ? INK : 'transparent',
                  color: isEmphasized ? '#ffffff' : INK,
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ---------------------------------------------------------------------------
 * MeridianHomeFooter — ultra-slim cream footer (PAGE 01 Stitch architecture).
 * - Left: copyright micro-text
 * - Right: PayPal · Don pill (re-uses PAYPAL_DONATE_URL like SiteFooter)
 * ------------------------------------------------------------------------- */
function MeridianHomeFooter() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="border-t"
      style={{
        backgroundColor: CREAM_BG,
        borderColor: INK_10,
        paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))',
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <p className="font-mono text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: INK_60 }}>
            © {year} VisaFlow
          </p>
          <nav
            aria-label="Liens légaux"
            className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[10px] font-black uppercase tracking-[0.22em]"
            style={{ color: INK_45 }}
          >
            <Link href="/legal#mentions" className="hover:underline" style={{ color: INK_60 }}>
              Mentions
            </Link>
            <Link href="/legal#confidentialite" className="hover:underline" style={{ color: INK_60 }}>
              Confidentialité
            </Link>
            <Link href="/community" className="hover:underline" style={{ color: INK_60 }}>
              Contact
            </Link>
          </nav>
        </div>
        <a
          href={PAYPAL_DONATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-mono text-[10.5px] font-black uppercase tracking-[0.22em] shadow-[0_4px_14px_rgba(241,196,15,0.30)] transition-[filter,transform] hover:translate-y-[-1px] hover:brightness-[1.04]"
          style={{
            backgroundColor: '#FFF1A8',
            color: '#5C4806',
            border: '1px solid rgba(92,72,6,0.18)',
          }}
        >
          <Heart className="h-3.5 w-3.5" style={{ color: '#9C7A07', fill: '#9C7A07' }} aria-hidden />
          PayPal · Don
        </a>
      </div>
    </footer>
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
      className="group flex h-full flex-col rounded-2xl border px-5 py-4 transition-[transform,border-color,background-color] hover:translate-y-[-1px] hover:border-[#0D1B3E]"
      style={{ borderColor: INK_10, backgroundColor: CREAM_PANEL }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white"
          style={{ border: `1px solid ${INK_10}` }}
          aria-hidden
        >
          {icon}
        </span>
        <h3 className="text-[14px] font-black" style={{ color: INK }}>
          {title}
        </h3>
      </div>
      <p className="text-[13px] leading-relaxed" style={{ color: INK_60 }}>
        {description}
      </p>
      <span
        className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] font-black uppercase tracking-[0.22em] opacity-0 transition-opacity group-hover:opacity-100"
        style={{ color: INK }}
      >
        Ouvrir
        <ArrowRight className="h-3 w-3" aria-hidden />
      </span>
    </Link>
  );
}
