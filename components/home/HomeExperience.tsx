'use client';

import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Car,
  Compass,
  FileStack,
  GraduationCap,
  MessagesSquare,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { type ReactNode, useMemo } from 'react';
import { ConsultantsAndDelegatedHomeSection } from '@/components/consultants/ConsultantsAndDelegatedHomeSection';
import CountryGrid from '@/components/country/CountryGrid';
import type { CountryGridItem } from '@/components/country/CountryGrid';
import GoogleAd from '@/components/GoogleAd';
import HeroWorldCarousel from '@/components/home/HeroWorldCarousel';
import HomeQuickFilterEngine from '@/components/home/HomeQuickFilterEngine';
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider';
import { DelegatedApplicationsHomePromo } from '@/components/services/DelegatedApplicationsHomePromo';
import { ctaCompareHref, ctaExploreHref } from '@/lib/cta-hrefs';
import { applyPerspectiveToShowcaseItems } from '@/lib/home-showcase-perspective';
import type { HomeHeroSlide } from '@/lib/home-hero-slides';
import {
  NEXUS_FOCUS_VISIBLE,
  NEXUS_FOCUS_VISIBLE_ON_INK_SOLID,
  NEXUS_TRANSITION,
} from '@/lib/nexus-chrome';
import {
  focusStripForObjective,
  homeHeroForObjective,
  visibleHomeFeatureKeysForObjective,
  type HomeFeatureKey,
} from '@/lib/user-objectives/home-orchestration';
import { getObjectiveBySlug } from '@/lib/user-objectives/registry';
import { cn } from '@/lib/utils';

const INK = '#0D1B3E';
const INK_60 = 'rgba(13,27,62,0.60)';
const INK_45 = 'rgba(13,27,62,0.45)';
const INK_10 = 'rgba(13,27,62,0.10)';
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

export function HomeExperience({
  topCountries,
  heroSlides,
}: {
  topCountries: CountryGridItem[];
  heroSlides: HomeHeroSlide[];
}) {
  const { preference } = useObjectivePreference();
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const isGuest = userLoaded && !isSignedIn;
  const primaryDefinition = useMemo(
    () => getObjectiveBySlug(preference.primarySlug),
    [preference.primarySlug],
  );
  const heroCopy = useMemo(() => homeHeroForObjective(preference.primarySlug), [preference.primarySlug]);
  const featureKeys = useMemo(
    () => visibleHomeFeatureKeysForObjective(primaryDefinition),
    [primaryDefinition],
  );
  const focusStrip = useMemo(() => focusStripForObjective(preference.primarySlug), [preference.primarySlug]);
  const quickGoal = primaryDefinition?.explorerGoalDefault ?? 'all';
  const goalLocked = Boolean(primaryDefinition && quickGoal !== 'all');
  const goalLockedLabel = primaryDefinition?.labelFr;
  const showcaseCountries = useMemo(
    () => applyPerspectiveToShowcaseItems(topCountries, preference.primarySlug),
    [topCountries, preference.primarySlug],
  );
  const exploreCtaHref = useMemo(() => ctaExploreHref(preference.primarySlug), [preference.primarySlug]);
  const compareCtaHref = useMemo(() => ctaCompareHref(preference.primarySlug), [preference.primarySlug]);
  const compareFeatureHref = useMemo(() => {
    if (!isGuest) return compareCtaHref;
    if (typeof window === 'undefined') {
      return `/sign-in?redirect_url=${encodeURIComponent(compareCtaHref)}`;
    }
    const absolute = `${window.location.origin}${compareCtaHref.startsWith('/') ? compareCtaHref : `/${compareCtaHref}`}`;
    return `/sign-in?redirect_url=${encodeURIComponent(absolute)}`;
  }, [isGuest, compareCtaHref]);

  const testimonialsAll = [
    {
      categoryId: 'work' as const,
      name: 'Yassine A.',
      role: 'Profil travail · Casablanca',
      quote:
        'J’ai réduit mon shortlist de 12 pays à 3 en une soirée. Les scores de friction m’ont évité des pistes trop compliquées pour mon profil.',
    },
    {
      categoryId: 'studies' as const,
      name: 'Salma M.',
      role: 'Objectif études · Rabat',
      quote:
        'La comparaison Schengen + les modules education m’ont aidée à comprendre où mes chances étaient réalistes, pas seulement « populaires ».',
    },
    {
      categoryId: 'business' as const,
      name: 'Imane K.',
      role: 'Projet business · Tanger',
      quote:
        'Le croisement visa, business et terrain m’a donné un plan concret. J’ai pu prioriser un pays avec moins de risque opérationnel.',
    },
    {
      categoryId: 'tourism' as const,
      name: 'Karim B.',
      role: 'Voyage Schengen · Marrakech',
      quote:
        'En partant du tourisme, j’ai ciblé les pays où le visa visiteur et les délais étaient cohérents avec mon calendrier — sans me perdre dans les parcours études.',
    },
  ];

  const testimonials = useMemo(() => {
    const cat = primaryDefinition?.categoryId;
    if (!cat) return testimonialsAll;
    const matched = testimonialsAll.filter((t) => t.categoryId === cat);
    return matched.length > 0 ? matched : testimonialsAll.slice(0, 2);
  }, [primaryDefinition?.categoryId]);

  const bestPractices = [
    {
      title: 'Commencer par ton objectif réel',
      text: 'Ton objectif principal pilote l’accueil et les raccourcis. Tu peux le changer depuis la barre latérale à tout moment.',
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
    <div className="home-nexus mx-auto w-full max-w-6xl space-y-14" style={{ color: INK }}>
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
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[12px] font-black uppercase tracking-[0.18em] text-white shadow-[0_8px_24px_rgba(13,27,62,0.20)] transition-[transform,filter] motion-reduce:transition-none hover:translate-y-[-1px] hover:brightness-110',
                      NEXUS_FOCUS_VISIBLE_ON_INK_SOLID,
                    )}
                    style={{ backgroundColor: INK }}
                  >
                    Évaluer mes chances
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                  <Link
                    href={exploreCtaHref}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-sm text-[12px] font-black uppercase tracking-[0.22em] underline-offset-4 transition-colors hover:underline',
                      NEXUS_FOCUS_VISIBLE,
                      NEXUS_TRANSITION,
                    )}
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
          <DelegatedApplicationsHomePromo variant="meridianBanner" />

          <ConsultantsAndDelegatedHomeSection />

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
          <HomeQuickFilterEngine
            initialExplorerGoal={quickGoal}
            goalLocked={goalLocked}
            goalLockedLabel={goalLockedLabel}
          />

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
                className={cn(
                  'rounded-sm font-mono text-[11px] font-black uppercase tracking-[0.22em] underline-offset-4 transition-colors hover:underline',
                  NEXUS_FOCUS_VISIBLE,
                  NEXUS_TRANSITION,
                )}
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
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-sm font-mono text-[11px] font-black uppercase tracking-[0.22em] underline-offset-4 transition-colors hover:underline',
                  NEXUS_FOCUS_VISIBLE,
                  NEXUS_TRANSITION,
                )}
                style={{ color: INK }}
              >
                <Compass className="h-3.5 w-3.5" aria-hidden />
                Tout voir
              </Link>
            </header>
            <CountryGrid countries={showcaseCountries} />
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
              Les vignettes affichées suivent votre objectif principal (dock) — le reste est masqué tant que vous
              ne changez pas de perspective.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {featureKeys.map((key) => {
                const f = FEATURE_MAP[key];
                const href = key === 'compare' ? compareFeatureHref : f.href;
                const compareHint =
                  key === 'compare' && isGuest ? 'Connexion requise pour comparer.' : undefined;
                return (
                  <Feature
                    key={key}
                    href={href}
                    icon={f.icon}
                    title={f.title}
                    description={compareHint ?? f.description}
                  />
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
                className={cn(
                  'rounded-sm font-mono text-[11px] font-black uppercase tracking-[0.22em] underline-offset-4 transition-colors hover:underline',
                  NEXUS_FOCUS_VISIBLE,
                  NEXUS_TRANSITION,
                )}
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
      className={cn(
        'group flex h-full flex-col rounded-2xl border px-5 py-4 transition-[transform,border-color,background-color] motion-reduce:transition-none hover:translate-y-[-1px] hover:border-[#0D1B3E]',
        NEXUS_FOCUS_VISIBLE,
      )}
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
