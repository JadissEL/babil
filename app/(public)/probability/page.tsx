'use client';

import { SignUpButton, useUser } from '@clerk/nextjs';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  Lock,
  PencilLine,
  TrendingUp,
  Scale,
  ShieldAlert,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { DashboardPageSkeleton } from '@/components/dashboard/DashboardPageSkeleton';
import { useObjectivePreferenceOptional } from '@/components/objectives/ObjectivePreferenceProvider';
import { ctaCompareHref, ctaExploreHref } from '@/lib/cta-hrefs';
import {
  NEXUS_FOCUS_VISIBLE,
  NEXUS_FOCUS_VISIBLE_ON_INK_SOLID,
  NEXUS_TRANSITION,
} from '@/lib/nexus-chrome';
import { formatGoalTypeLabelFr } from '@/lib/probability-profile-narrative';
import {
  describeTopCountrySignals,
  orderedProbabilityBreakdown,
  PROBABILITY_DEFAULT_FIELD_LABELS_FR,
  type ProbabilityCountrySignals,
  type ProbabilitySheetFieldDefault,
} from '@/lib/probability-result-display';
import { PUBLIC_READ_ONLY_DEMO_PROFILE } from '@/lib/public-read-only-demo-profile';
import { formatScoreDriversFrench } from '@/lib/score-driver-explain';
import { englishScoreLevelToFr } from '@/lib/score-level-fr';
import {
  SITE_FOCUS_VISIBLE_ON_PRIMARY,
  SITE_FOCUS_VISIBLE_SOFT,
  SITE_INTERACTION_TRANSITION,
} from '@/lib/site-chrome-tokens';
import { appToast } from '@/lib/toast-store';
import type { ProbabilityApiRow } from '@/lib/types';
import { isPhdPerspectiveRelevant } from '@/lib/user-objectives/perspective-nav';
import { getObjectiveBySlug } from '@/lib/user-objectives/registry';
import { cn } from '@/lib/utils';

const ORBIT_NAVY = '#0D1B3E';

function ProbabilityScoreRing({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, Math.round(score)));
  const r = 56;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div className="relative mx-auto flex h-[220px] w-[220px] flex-col items-center justify-center sm:h-[240px] sm:w-[240px]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 140 140" aria-hidden>
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(13,27,62,0.12)" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={ORBIT_NAVY}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 70 70)"
        />
      </svg>
      <div className="relative z-[1] flex flex-col items-center justify-center">
        <span className="font-serif text-4xl font-bold tabular-nums text-[#0D1B3E] sm:text-[2.75rem]">
          {pct}%
        </span>
        <span className="mt-1 text-center text-xs font-semibold text-[#0D1B3E]/60">
          Probabilité estimée
        </span>
      </div>
    </div>
  );
}

export default function ProbabilityPage() {
  return (
    <Suspense fallback={<ProbabilityPageFallback />}>
      <ProbabilityPageInner />
    </Suspense>
  );
}

function ProbabilityPageFallback() {
  return (
    <div className="min-h-screen bg-[#FDFBF4]">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10">
        <h1 className="text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">
          Moteur de probabilités visa
        </h1>
        <p className="mt-2 max-w-2xl font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/80 sm:text-base">
          Analyse prédictive basée sur les historiques consulaires récents et les signaux
          socio-économiques de votre profil.
        </p>
        <div className="mt-8">
          <DashboardPageSkeleton />
        </div>
      </div>
    </div>
  );
}

function ProbabilityPageInner() {
  const searchParams = useSearchParams();
  const objectivePref = useObjectivePreferenceOptional();
  const anonymousEngineGoal = useMemo(() => {
    if (!objectivePref?.ready) return undefined;
    const slug = objectivePref.preference.primarySlug;
    if (!slug) return undefined;
    return getObjectiveBySlug(slug)?.engineGoal;
  }, [objectivePref?.ready, objectivePref?.preference.primarySlug]);
  const showPhdBadges = useMemo(
    () =>
      isPhdPerspectiveRelevant(
        getObjectiveBySlug(objectivePref?.ready ? objectivePref.preference.primarySlug : null),
      ),
    [objectivePref?.ready, objectivePref?.preference.primarySlug],
  );
  const emptyCtaExploreHref = useMemo(
    () => ctaExploreHref(objectivePref?.ready ? objectivePref.preference.primarySlug : null),
    [objectivePref?.ready, objectivePref?.preference.primarySlug],
  );
  const emptyCtaCompareHref = useMemo(
    () => ctaCompareHref(objectivePref?.ready ? objectivePref.preference.primarySlug : null),
    [objectivePref?.ready, objectivePref?.preference.primarySlug],
  );
  const focusCountryId = useMemo(() => {
    const raw = searchParams?.get('countryId');
    if (!raw) return undefined;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n >= 1 ? n : undefined;
  }, [searchParams]);

  const focusCountryName = useMemo(() => {
    const n = searchParams?.get('countryName')?.trim();
    return n ? n : undefined;
  }, [searchParams]);

  const didAutoExpand = useRef(false);
  const { user, isLoaded } = useUser();
  const [results, setResults] = useState<ProbabilityApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileUsed, setProfileUsed] = useState<Record<string, unknown> | null>(null);
  const [readOnlyDemo, setReadOnlyDemo] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [comparisonList, setComparisonList] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    didAutoExpand.current = false;
  }, [focusCountryId]);

  useEffect(() => {
    if (didAutoExpand.current || focusCountryId == null || results.length === 0) return;
    const row = results.find((r) => r.id === focusCountryId);
    if (row) {
      setExpanded(row.country);
      didAutoExpand.current = true;
    }
  }, [focusCountryId, results]);

  useEffect(() => {
    if (!isLoaded) return;

    const loadData = async () => {
      try {
        const withFocus = (body: Record<string, unknown>) =>
          focusCountryId != null ? { ...body, focusCountryId } : body;

        if (!user) {
          setReadOnlyDemo(true);
          setProfileUsed({
            ...PUBLIC_READ_ONLY_DEMO_PROFILE,
            ...(anonymousEngineGoal ? { goal_type: anonymousEngineGoal } : {}),
          });
          const probRes = await fetch('/api/probability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
              withFocus(anonymousEngineGoal ? { anonymous_goal_type: anonymousEngineGoal } : {}),
            ),
          });
          const data = await probRes.json();
          if (!probRes.ok) {
            const msg =
              typeof (data as { error?: unknown })?.error === 'string'
                ? (data as { error: string }).error
                : 'Le moteur de probabilités a échoué.';
            appToast.error(msg);
            setResults([]);
          } else if (!Array.isArray(data)) {
            appToast.error('Réponse probabilité inattendue.');
            setResults([]);
          } else {
            setResults(data as ProbabilityApiRow[]);
          }
          return;
        }

        setReadOnlyDemo(false);
        const profileRes = await fetch('/api/user/profile');
        const profile = await profileRes.json();

        if (!profile || profile.error) {
          setProfileUsed(null);
          setLoading(false);
          return;
        }

        setProfileUsed(profile);
        const probRes = await fetch('/api/probability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(withFocus({ profile })),
        });
        const data = await probRes.json();
        if (!probRes.ok) {
          const msg =
            typeof (data as { error?: unknown })?.error === 'string'
              ? (data as { error: string }).error
              : 'Le moteur de probabilités a échoué.';
          appToast.error(msg);
          setResults([]);
        } else if (!Array.isArray(data)) {
          appToast.error('Réponse probabilité inattendue.');
          setResults([]);
        } else {
          setResults(data as ProbabilityApiRow[]);
        }
      } catch (err) {
        console.error(err);
        appToast.error('Erreur réseau — probabilités non chargées.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isLoaded, user, focusCountryId, anonymousEngineGoal]);

  const toggleComparison = (country: string) => {
    if (comparisonList.includes(country)) {
      setComparisonList(comparisonList.filter((c) => c !== country));
    } else if (comparisonList.length < 3) {
      setComparisonList([...comparisonList, country]);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Very High':
        return 'border-[#94dfbd] bg-[#e9f9f1] text-success';
      case 'High':
        return 'border-primary/40 bg-primary-soft text-primary';
      case 'Medium':
        return 'border-[#f2c27a] bg-[#fff5e7] text-warning';
      case 'Low':
        return 'border-accent/40 bg-accent-soft text-accent';
      case 'Very Low':
        return 'border-[#f3afaf] bg-[#fff0f0] text-danger';
      default:
        return 'border-line bg-inset text-muted';
    }
  };

  const topCountry = results[0];

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF4]">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10">
          <h1 className="text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl lg:text-4xl">
            Moteur de probabilités visa
          </h1>
          <p className="mt-2 max-w-2xl font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/80 sm:text-base">
            Analyse prédictive basée sur les historiques consulaires récents et les signaux
            socio-économiques de votre profil.
          </p>
          <div className="mt-8">
            <DashboardPageSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF4]">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10">
        <div className="mb-8 flex flex-col justify-between gap-6 border-b border-[#0D1B3E]/10 pb-8 sm:mb-10 md:flex-row md:items-start">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl lg:text-4xl">
              Moteur de probabilités visa
            </h1>
            <p className="mt-3 max-w-2xl font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/80 sm:text-[15px]">
              Analyse prédictive basée sur les historiques consulaires récents et les signaux
              socio-économiques de votre profil.
            </p>
          </div>
          <div className="flex w-full shrink-0 md:w-auto">
            <button
              type="button"
              onClick={() => setShowComparison(!showComparison)}
              disabled={comparisonList.length < 2}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-xs font-black uppercase tracking-wider motion-reduce:transition-none sm:w-auto sm:px-5',
                NEXUS_TRANSITION,
                comparisonList.length >= 2
                  ? cn(
                      'border-[#0D1B3E] bg-[#0D1B3E] text-white shadow-md hover:bg-[#0D1B3E]/90',
                      NEXUS_FOCUS_VISIBLE_ON_INK_SOLID,
                    )
                  : cn(
                      'cursor-not-allowed border-[#0D1B3E]/15 bg-white text-[#0D1B3E]/40',
                      NEXUS_FOCUS_VISIBLE,
                    ),
              )}
            >
              <Scale className="h-5 w-5 shrink-0" />
              <span className="truncate">
                {showComparison ? 'Masquer la comparaison' : `Comparer (${comparisonList.length})`}
              </span>
            </button>
          </div>
        </div>

        {readOnlyDemo ? (
          <div className="mb-8 flex flex-col gap-5 rounded-2xl border border-[#0D1B3E]/12 bg-white p-5 shadow-md sm:flex-row sm:items-center sm:justify-between sm:rounded-3xl sm:p-6">
            <div className="flex min-w-0 gap-4">
              <Lock className="h-10 w-10 shrink-0 text-[#0D1B3E]" aria-hidden />
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0D1B3E]">
                  Mode Découverte
                </p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-[#0D1B3E]/75">
                  Vos résultats ne sont pas sauvegardés. Créez un compte pour conserver
                  l&apos;historique et débloquer les analyses détaillées.
                </p>
              </div>
            </div>
            <SignUpButton mode="modal">
              <button
                type="button"
                className={cn(
                  'w-full shrink-0 rounded-xl bg-[#0D1B3E] px-6 py-3.5 text-center text-xs font-black uppercase tracking-[0.2em] text-white shadow-md hover:bg-[#0D1B3E]/90 sm:w-auto',
                  NEXUS_TRANSITION,
                  NEXUS_FOCUS_VISIBLE_ON_INK_SOLID,
                )}
              >
                Créer un compte
              </button>
            </SignUpButton>
          </div>
        ) : null}

        {focusCountryId != null ? (
          <div
            className="mb-6 rounded-2xl border border-accent/35 bg-accent-soft/45 p-4 text-sm font-medium text-text shadow-card sm:p-5"
            role="status"
          >
            <span className="font-black text-accent">Contexte pays.</span> Classement priorisé pour{' '}
            <strong>{focusCountryName ?? `le pays #${focusCountryId}`}</strong>
            {focusCountryName ? ` (#${focusCountryId})` : null}.{' '}
            <Link
              href={`/countries/${focusCountryId}`}
              className={cn(
                'rounded-sm font-black text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary',
                NEXUS_FOCUS_VISIBLE,
                NEXUS_TRANSITION,
              )}
            >
              Revoir la fiche
            </Link>
            {' · '}
            <Link
              href="/probability"
              className={cn(
                'rounded-sm font-black text-muted underline decoration-muted/50 underline-offset-2 hover:text-primary hover:decoration-primary',
                NEXUS_FOCUS_VISIBLE,
                NEXUS_TRANSITION,
              )}
            >
              Effacer le contexte
            </Link>
          </div>
        ) : null}

        {results.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-surface px-5 py-10 text-center shadow-card sm:rounded-[2rem] sm:p-12">
            <ShieldAlert className="mx-auto mb-6 h-16 w-16 text-warning" />
            <h2 className="mb-4 text-2xl font-black text-text">Profil incomplet</h2>
            <p className="mb-8 font-medium leading-relaxed text-muted">
              Pour calculer vos probabilités, renseignez votre situation financière et
              professionnelle.
            </p>
            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/profile"
                className={cn(
                  'inline-flex justify-center rounded-2xl bg-primary px-8 py-4 font-black text-white shadow-soft hover:bg-primary-hover',
                  SITE_INTERACTION_TRANSITION,
                  SITE_FOCUS_VISIBLE_ON_PRIMARY,
                )}
              >
                Compléter mon profil
              </Link>
              <Link
                href={emptyCtaExploreHref}
                className={cn(
                  'inline-flex justify-center rounded-2xl border border-line bg-inset px-8 py-4 font-black text-text hover:bg-primary-soft',
                  SITE_INTERACTION_TRANSITION,
                  SITE_FOCUS_VISIBLE_SOFT,
                )}
              >
                Explorer les pays
              </Link>
              <Link
                href={emptyCtaCompareHref}
                className={cn(
                  'inline-flex justify-center rounded-2xl border border-line bg-inset px-8 py-4 font-black text-text hover:bg-primary-soft',
                  SITE_INTERACTION_TRANSITION,
                  SITE_FOCUS_VISIBLE_SOFT,
                )}
              >
                Ouvrir le comparateur
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#0D1B3E]/10 pb-5">
              <p className="min-w-0 text-[11px] font-black uppercase leading-snug tracking-[0.2em] text-[#0D1B3E]/55">
                Profil actif{' '}
                <span className="mt-1 block font-sans text-sm font-black normal-case tracking-normal text-[#0D1B3E] sm:inline sm:mt-0">
                  {formatGoalTypeLabelFr(profileUsed?.goal_type)} — {topCountry?.country ?? '—'}
                </span>
              </p>
              {readOnlyDemo ? (
                <SignUpButton mode="modal">
                  <button
                    type="button"
                    className={cn(
                      'inline-flex shrink-0 items-center gap-2 rounded-sm text-[11px] font-black uppercase tracking-[0.18em] text-[#0D1B3E] underline decoration-[#0D1B3E]/30 underline-offset-4 hover:decoration-[#0D1B3E]',
                      NEXUS_FOCUS_VISIBLE,
                      NEXUS_TRANSITION,
                    )}
                  >
                    <PencilLine className="h-4 w-4" aria-hidden />
                    Modifier
                  </button>
                </SignUpButton>
              ) : (
                <Link
                  href="/profile"
                  className={cn(
                    'inline-flex shrink-0 items-center gap-2 rounded-sm text-[11px] font-black uppercase tracking-[0.18em] text-[#0D1B3E] underline decoration-[#0D1B3E]/30 underline-offset-4 hover:decoration-[#0D1B3E]',
                    NEXUS_FOCUS_VISIBLE,
                    NEXUS_TRANSITION,
                  )}
                >
                  <PencilLine className="h-4 w-4" aria-hidden />
                  Modifier
                </Link>
              )}
            </div>

            <section className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
              <div className="flex min-h-0 flex-col rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/45">
                  Score global
                </p>
                <div className="mt-4 flex flex-1 flex-col items-center justify-center py-2">
                  <ProbabilityScoreRing score={topCountry?.globalScore ?? 0} />
                </div>
                {topCountry?.country ? (
                  <p className="mt-2 text-center text-sm font-bold text-[#0D1B3E]/80">
                    {topCountry.country}
                  </p>
                ) : null}
              </div>

              <div className="flex min-h-0 flex-col gap-6">
                <div className="flex flex-1 flex-col rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8">
                  <div className="mb-4 flex items-center gap-2 text-[#0D1B3E]">
                    <Lightbulb className="h-5 w-5 shrink-0" aria-hidden />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                      Brief conseiller
                    </span>
                  </div>
                  <p className="font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/85 sm:text-[15px]">
                    {describeTopCountrySignals(
                      topCountry?.countrySignals as ProbabilityCountrySignals | undefined,
                    )}
                  </p>
                  <div className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-sky-200/80 bg-sky-50 px-3 py-1.5 text-xs font-bold text-[#0D1B3E]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0D1B3E]" aria-hidden />
                    {topCountry?.level === 'Very High' || topCountry?.level === 'High'
                      ? 'Favorable'
                      : topCountry?.level === 'Medium'
                        ? 'Modéré'
                        : topCountry?.level === 'Low' || topCountry?.level === 'Very Low'
                          ? 'Sous réserve'
                          : (englishScoreLevelToFr(topCountry?.level) ?? 'À confirmer')}
                  </div>
                </div>

                <div className="flex flex-1 flex-col rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8">
                  <div className="mb-4 flex items-center gap-2 text-[#0D1B3E]">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" aria-hidden />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                      Points de vigilance
                    </span>
                  </div>
                  <p className="font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/85 sm:text-[15px]">
                    {topCountry?.reasons?.length
                      ? topCountry.reasons[0]
                      : 'Les estimations restent indicatives : vérifiez les exigences officielles du consulat et la cohérence de votre dossier (garanties, liens au pays, pièces à jour).'}
                  </p>
                </div>
              </div>
            </section>

            {/* Comparison View */}
            {showComparison && (
              <section className="rounded-2xl border border-line bg-surface p-5 text-text shadow-card sm:rounded-[2.5rem] sm:p-8 md:p-10">
                <div className="mb-6 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-black sm:text-2xl md:text-3xl">
                    Comparaison Détaillée
                  </h2>
                  <button
                    type="button"
                    onClick={() => setComparisonList([])}
                    className={cn(
                      'self-start rounded-sm text-sm font-bold text-muted hover:text-primary sm:self-auto',
                      NEXUS_FOCUS_VISIBLE,
                      NEXUS_TRANSITION,
                    )}
                  >
                    Vider la liste
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {results
                    .filter((r) => comparisonList.includes(r.country))
                    .map((r) => (
                      <div key={r.country} className="rounded-3xl border border-line bg-inset p-6">
                        <h3 className="text-2xl font-black mb-6">{r.country}</h3>
                        <div className="space-y-6">
                          {orderedProbabilityBreakdown(
                            r.breakdown as Record<string, unknown>,
                            r.defaultsUsed as ProbabilitySheetFieldDefault[] | undefined,
                          ).map(({ key, label, value }) => (
                            <div key={key}>
                              <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-widest text-muted">
                                <span>{label}</span>
                                <span>{value}%</span>
                              </div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-[#eadfcf]">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${value}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                          <div className="border-t border-line pt-6">
                            <div className="text-4xl font-black text-center">{r.globalScore}%</div>
                            <div className="mt-2 text-center text-[10px] font-black uppercase tracking-widest text-muted">
                              Probabilité Totale
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Country Cards */}
            <div className="grid grid-cols-1 gap-6">
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-black text-text">Analyse par pays</h2>
                <p className="text-sm font-bold italic text-muted">
                  Cliquez pour détails et stratégie.
                </p>
              </div>
              {results.map((r) => (
                <div
                  key={r.country}
                  className={`rounded-3xl border transition-all duration-300 ${
                    expanded === r.country
                      ? 'border-primary/50 bg-surface shadow-soft ring-2 ring-primary/30'
                      : 'border-line bg-surface hover:border-primary/20'
                  }`}
                >
                  <div
                    className="flex cursor-pointer flex-col items-stretch justify-between gap-4 p-5 sm:gap-6 sm:p-6 md:flex-row md:items-center md:p-8"
                    onClick={() => setExpanded(expanded === r.country ? null : r.country)}
                  >
                    <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 md:w-auto">
                      <div className="min-w-0 shrink-0 text-left">
                        <h3 className="text-xl font-black tracking-tight text-text sm:text-2xl">
                          {r.country}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <div
                            className={`inline-block rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getLevelColor(r.level)}`}
                          >
                            {englishScoreLevelToFr(r.level) ?? r.level ?? '—'}
                          </div>
                          {r.hasPhdStudies && showPhdBadges ? (
                            <span className="rounded-full border border-primary/40 bg-primary-soft px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                              Bloc PhD
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="mx-4 hidden h-12 w-px shrink-0 bg-line md:block" />

                      <div className="flex items-center gap-6 sm:gap-8">
                        <div className="text-left sm:text-center">
                          <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted">
                            Score global
                          </div>
                          <div className="text-2xl font-black text-text sm:text-3xl">
                            {r.globalScore}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full items-center justify-between gap-3 border-t border-line pt-4 md:w-auto md:border-t-0 md:pt-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComparison(r.country);
                        }}
                        className={cn(
                          'rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest motion-reduce:transition-none',
                          NEXUS_TRANSITION,
                          comparisonList.includes(r.country)
                            ? cn('bg-primary text-white shadow-soft', SITE_FOCUS_VISIBLE_ON_PRIMARY)
                            : cn('bg-inset text-muted hover:bg-primary-soft', NEXUS_FOCUS_VISIBLE, SITE_FOCUS_VISIBLE_SOFT),
                        )}
                      >
                        {comparisonList.includes(r.country) ? 'Sélectionné' : 'Comparer'}
                      </button>
                      {expanded === r.country ? (
                        <ChevronUp className="h-6 w-6 text-muted" />
                      ) : (
                        <ChevronDown className="h-6 w-6 text-muted" />
                      )}
                    </div>
                  </div>

                  {expanded === r.country && (
                    <div className="border-t border-line bg-inset px-4 pb-6 sm:px-6 md:px-8 md:pb-8">
                      <div className="mt-8 space-y-8">
                        {Array.isArray(r.defaultsUsed) && r.defaultsUsed.length > 0 ? (
                          <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4 text-sm font-medium text-text">
                            Données fiche incomplètes : le moteur utilise une valeur neutre (50)
                            pour{' '}
                            {(r.defaultsUsed as ProbabilitySheetFieldDefault[])
                              .map((k) => PROBABILITY_DEFAULT_FIELD_LABELS_FR[k])
                              .join(' ; ')}
                            .
                          </div>
                        ) : null}
                        {Array.isArray(r.topDrivers) && r.topDrivers.length > 0 ? (
                          <div className="rounded-2xl border border-line bg-surface p-5">
                            <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-muted">
                              Facteurs les plus influents (vs neutre)
                            </h4>
                            <ul className="list-disc space-y-2 pl-5 text-sm font-medium text-muted">
                              {formatScoreDriversFrench(r.topDrivers).map((line, i) => (
                                <li key={`${r.country}-td-${i}`}>{line}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                          {/* Breakdown */}
                          <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted">
                              <TrendingUp className="h-4 w-4" /> Facteurs
                            </h4>
                            <div className="space-y-4 rounded-2xl border border-line bg-surface p-6">
                              {orderedProbabilityBreakdown(
                                r.breakdown as Record<string, unknown>,
                                r.defaultsUsed as ProbabilitySheetFieldDefault[] | undefined,
                              ).map(({ key, label, value }) => (
                                <div key={key} className="space-y-2">
                                  <div className="flex justify-between text-xs font-bold text-muted">
                                    <span>{label}</span>
                                    <span>{value}%</span>
                                  </div>
                                  <div className="h-2 overflow-hidden rounded-full bg-[#eadfcf]">
                                    <div
                                      className="h-full rounded-full bg-blue-500"
                                      style={{ width: `${value}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Reasons */}
                          <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted">
                              <AlertCircle className="h-4 w-4" /> Analyse critique
                            </h4>
                            <div className="space-y-3">
                              {r.reasons.map((reason: string, i: number) => (
                                <div
                                  key={i}
                                  className="flex gap-3 rounded-2xl border border-line bg-surface p-4 text-sm font-medium leading-relaxed text-muted"
                                >
                                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                                  {reason}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Strategy */}
                          <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted">
                              <Lightbulb className="h-4 w-4" /> Stratégie
                            </h4>
                            <div className="space-y-3">
                              {r.strategy.map((s: string, i: number) => (
                                <div
                                  key={i}
                                  className="flex gap-3 rounded-2xl border border-primary/30 bg-primary-soft p-5 text-sm font-bold text-text shadow-soft"
                                >
                                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/70 text-[10px]">
                                    {i + 1}
                                  </div>
                                  {s}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted">
                            <Info className="h-4 w-4" /> Signaux issus de la fiche pays
                          </h4>
                          <div className="rounded-2xl border border-line bg-surface p-5 text-sm font-medium leading-relaxed text-muted">
                            <p>
                              {describeTopCountrySignals(
                                r.countrySignals as ProbabilityCountrySignals | undefined,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
