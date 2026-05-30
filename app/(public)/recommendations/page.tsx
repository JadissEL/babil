'use client';

import { SignInButton, useUser } from '@clerk/nextjs';
import { AlertCircle, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { DashboardPageSkeleton } from '@/components/dashboard/DashboardPageSkeleton';
import RecommendationPanel from '@/components/engine/RecommendationPanel';
import { ScoreBreakdownChart } from '@/components/engine/ScoreBreakdownChart';
import { useObjectivePreferenceOptional } from '@/components/objectives/ObjectivePreferenceProvider';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ctaCompareHref, ctaExploreHref } from '@/lib/cta-hrefs';
import { writeOnboarding } from '@/lib/onboarding-storage';
import { formatGoalTypeLabelFr } from '@/lib/probability-profile-narrative';
import { PUBLIC_READ_ONLY_DEMO_PROFILE } from '@/lib/public-read-only-demo-profile';
import type { ApiRecommendation } from '@/lib/recommendation-ui';
import { mapApiRecommendationToPanelRow } from '@/lib/recommendation-ui';
import { formatScoreDriversFrench } from '@/lib/score-driver-explain';
import { appToast } from '@/lib/toast-store';
import { getObjectiveBySlug } from '@/lib/user-objectives/registry';

function globalProjectionBadgeLabel(): string {
  const d = new Date();
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `GLOBAL PROJECTION — Q${q} ${d.getFullYear()}`;
}

function CompassAxisBar({ label, value }: { label: string; value: number }) {
  const v = Math.round(Math.min(100, Math.max(0, value)));
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-[10px] font-black uppercase tracking-[0.12em] text-[#0D1B3E]/55">
        <span>{label}</span>
        <span className="tabular-nums text-[#0D1B3E]">{v}</span>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-[#0D1B3E]/10"
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-[#0D1B3E] transition-[width] duration-300"
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense fallback={<RecommendationsPageFallback />}>
      <RecommendationsPageInner />
    </Suspense>
  );
}

function RecommendationsPageFallback() {
  return (
    <div className="min-h-screen bg-[#FDFBF4]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl lg:text-4xl">
          Intelligence de recommandation
        </h1>
        <p className="mt-2 max-w-2xl font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/80 sm:text-base">
          Analyse multi-critères pour prioriser les destinations alignées avec votre profil de
          mobilité.
        </p>
        <div className="mt-8">
          <DashboardPageSkeleton />
        </div>
      </div>
    </div>
  );
}

function RecommendationsPageInner() {
  const searchParams = useSearchParams();
  const objectivePref = useObjectivePreferenceOptional();
  const anonymousEngineGoal = useMemo(() => {
    if (!objectivePref?.ready) return undefined;
    const slug = objectivePref.preference.primarySlug;
    if (!slug) return undefined;
    return getObjectiveBySlug(slug)?.engineGoal;
  }, [objectivePref?.ready, objectivePref?.preference.primarySlug]);
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
  const { user, isLoaded } = useUser();
  const [recommendations, setRecommendations] = useState<ApiRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileUsed, setProfileUsed] = useState<Record<string, unknown> | null>(null);
  const [readOnlyDemo, setReadOnlyDemo] = useState(false);
  const [chartCountryId, setChartCountryId] = useState<number | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelectedIds, setCompareSelectedIds] = useState<number[]>([]);

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
          const recoRes = await fetch('/api/recommendation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
              withFocus(anonymousEngineGoal ? { anonymous_goal_type: anonymousEngineGoal } : {}),
            ),
          });
          const data = await recoRes.json();
          if (!recoRes.ok) {
            const msg =
              typeof (data as { error?: unknown })?.error === 'string'
                ? (data as { error: string }).error
                : 'Le moteur de recommandation a échoué.';
            appToast.error(msg);
            setRecommendations([]);
          } else if (!Array.isArray(data)) {
            appToast.error('Réponse recommandation inattendue.');
            setRecommendations([]);
          } else {
            setRecommendations(data);
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
        const recoRes = await fetch('/api/recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(withFocus({ profile })),
        });
        const data = await recoRes.json();
        if (!recoRes.ok) {
          const msg =
            typeof (data as { error?: unknown })?.error === 'string'
              ? (data as { error: string }).error
              : 'Le moteur de recommandation a échoué.';
          appToast.error(msg);
          setRecommendations([]);
        } else if (!Array.isArray(data)) {
          appToast.error('Réponse recommandation inattendue.');
          setRecommendations([]);
        } else {
          setRecommendations(data);
        }
      } catch (err) {
        console.error(err);
        appToast.error('Erreur réseau — recommandations non chargées.');
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isLoaded, user, focusCountryId, anonymousEngineGoal]);

  useEffect(() => {
    if (!loading && recommendations.length > 0) {
      writeOnboarding({ recoSeen: true });
    }
  }, [loading, recommendations.length]);

  useEffect(() => {
    if (!recommendations.length) {
      setChartCountryId(null);
      return;
    }
    setChartCountryId((prev) => {
      const ids = recommendations.map((r) => Number(r.id));
      if (prev != null && ids.includes(prev)) return prev;
      return Number(recommendations[0].id);
    });
  }, [recommendations]);

  const chartReco = useMemo(() => {
    if (!recommendations.length || chartCountryId == null) return null;
    return recommendations.find((r) => Number(r.id) === chartCountryId) ?? recommendations[0];
  }, [recommendations, chartCountryId]);

  const chartRank = useMemo(() => {
    if (!chartReco) return 1;
    const idx = recommendations.findIndex((r) => Number(r.id) === Number(chartReco.id));
    return idx >= 0 ? idx + 1 : 1;
  }, [chartReco, recommendations]);

  const intelligenceSerifBlurb = useMemo(() => {
    const g = formatGoalTypeLabelFr(profileUsed?.goal_type);
    return `Analyse générée pour un profil ${g}, orientée vers les destinations présentant le meilleur équilibre entre accès visa, fluidité des démarches et adéquation avec votre objectif principal.`;
  }, [profileUsed?.goal_type]);

  const toggleCompare = useCallback((countryId: number) => {
    setCompareSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(countryId)) next.delete(countryId);
      else if (next.size < 3) next.add(countryId);
      return Array.from(next);
    });
  }, []);

  const compareRecos = useMemo(() => {
    if (compareSelectedIds.length < 2) return [];
    const byId = new Map(recommendations.map((r) => [Number(r.id), r]));
    return compareSelectedIds
      .map((id) => byId.get(id))
      .filter((r): r is ApiRecommendation => Boolean(r?.breakdown));
  }, [compareSelectedIds, recommendations]);

  const panelRows = recommendations.map((r, idx) => mapApiRecommendationToPanelRow(r, idx + 1));

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF4]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <h1 className="text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl lg:text-4xl">
            Intelligence de recommandation
          </h1>
          <p className="mt-2 max-w-2xl font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/80 sm:text-base">
            Analyse multi-critères pour prioriser les destinations alignées avec votre profil de
            mobilité.
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
      {focusCountryId != null ? (
        <div
          className="border-b border-[#0D1B3E]/10 bg-white/80 px-4 py-4 text-sm font-medium text-[#0D1B3E]/90 sm:px-6"
          role="status"
        >
          <span className="font-black text-[#0D1B3E]">Contexte pays.</span> Classement priorisé pour{' '}
          <strong>{focusCountryName ?? `le pays #${focusCountryId}`}</strong>
          {focusCountryName ? ` (#${focusCountryId})` : null}.{' '}
          <Link
            href={`/countries/${focusCountryId}`}
            className="font-black text-[#0D1B3E] underline decoration-[#0D1B3E]/35 underline-offset-2 hover:decoration-[#0D1B3E]"
          >
            Revoir la fiche
          </Link>
          {' · '}
          <Link
            href="/recommendations"
            className="font-black text-[#0D1B3E]/55 underline decoration-[#0D1B3E]/25 underline-offset-2 hover:text-[#0D1B3E]"
          >
            Effacer le contexte
          </Link>
        </div>
      ) : null}

      {recommendations.length === 0 ? (
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
          <h1 className="mb-2 text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">
            Intelligence de recommandation
          </h1>
          <p className="mb-8 max-w-xl font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/78 sm:text-base">
            Analyse multi-critères pour prioriser les destinations alignées avec votre profil de
            mobilité.
          </p>
          <div className="rounded-2xl border border-[#0D1B3E]/10 bg-white px-6 py-10 text-center shadow-sm sm:rounded-3xl sm:p-12">
            <AlertCircle className="mx-auto mb-6 h-16 w-16 text-[#0D1B3E]/35" />
            <h2 className="mb-4 text-2xl font-black text-[#0D1B3E]">Besoin de plus d&apos;infos</h2>
            <p className="mb-8 font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/75 sm:text-base">
              Complétez votre profil pour obtenir des recommandations personnalisées basées sur
              votre budget et vos objectifs.
            </p>
            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/profile"
                className="inline-flex justify-center rounded-xl bg-[#0D1B3E] px-8 py-4 text-xs font-black uppercase tracking-wider text-white shadow-md transition-colors hover:bg-[#0D1B3E]/90"
              >
                Configurer mon profil
              </Link>
              <Link
                href={emptyCtaExploreHref}
                className="inline-flex justify-center rounded-xl border-2 border-[#0D1B3E]/20 bg-white px-8 py-4 text-xs font-black uppercase tracking-wider text-[#0D1B3E] transition-colors hover:border-[#0D1B3E]/40"
              >
                Explorer les pays
              </Link>
              <Link
                href={emptyCtaCompareHref}
                className="inline-flex justify-center rounded-xl border-2 border-[#0D1B3E]/20 bg-white px-8 py-4 text-xs font-black uppercase tracking-wider text-[#0D1B3E] transition-colors hover:border-[#0D1B3E]/40"
              >
                Tester le comparateur
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex min-h-[min(100vh,520px)] flex-1 flex-col lg:min-h-[calc(100vh-0px)] lg:flex-row">
            <aside className="w-full shrink-0 border-b border-[#0D1B3E]/10 bg-[#FDFBF4] px-5 py-8 sm:px-8 lg:w-[min(100%,420px)] lg:border-b-0 lg:border-r lg:py-10 xl:w-[440px]">
              {readOnlyDemo ? (
                <div className="mb-8 rounded-2xl border border-[#0D1B3E]/12 bg-white p-5 shadow-sm">
                  <div className="flex gap-4">
                    <UserCircle className="h-11 w-11 shrink-0 text-[#0D1B3E]" aria-hidden />
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]">
                        Session invité
                      </p>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-[#0D1B3E]/75">
                        Vos recommandations sont temporaires. Connectez-vous pour sauvegarder ce
                        profil de mobilité et accéder aux analyses comparatives détaillées.
                      </p>
                      <SignInButton mode="modal">
                        <button
                          type="button"
                          className="mt-4 w-full rounded-xl border-2 border-[#0D1B3E] bg-transparent px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.2em] text-[#0D1B3E] transition-colors hover:bg-[#0D1B3E]/5 sm:w-auto sm:min-w-[200px]"
                        >
                          S&apos;authentifier
                        </button>
                      </SignInButton>
                    </div>
                  </div>
                </div>
              ) : null}

              <h1 className="text-2xl font-black leading-tight tracking-tight text-[#0D1B3E] sm:text-3xl lg:text-[1.65rem] xl:text-3xl">
                Intelligence de recommandation
              </h1>
              <p className="mt-4 font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/82 sm:text-[15px]">
                {intelligenceSerifBlurb}
              </p>

              {chartReco ? (
                <div className="mt-8 space-y-6">
                  <div>
                    <span className="inline-flex bg-[#0D1B3E] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                      Rank #{chartRank}
                    </span>
                    <p className="mt-3 text-3xl font-black tracking-tight text-[#0D1B3E] sm:text-4xl">
                      {chartReco.name}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="compass-country-select" className="sr-only">
                      Pays affiché sur la projection
                    </label>
                    <Select
                      value={String(chartReco.id)}
                      onValueChange={(v) => setChartCountryId(Number(v))}
                    >
                      <SelectTrigger
                        id="compass-country-select"
                        className="h-11 w-full max-w-full border-[#0D1B3E]/20 bg-white text-[#0D1B3E] sm:max-w-xs"
                      >
                        <SelectValue placeholder="Pays" />
                      </SelectTrigger>
                      <SelectContent>
                        {recommendations.map((r) => (
                          <SelectItem key={String(r.id)} value={String(r.id)}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {chartReco.breakdown ? (
                    <div className="space-y-5 pt-2">
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/50">
                        Axes de mobilité
                      </p>
                      <CompassAxisBar
                        label="Économie & objectif"
                        value={chartReco.breakdown.goalMatch}
                      />
                      <CompassAxisBar label="Visa et immigration" value={chartReco.breakdown.visa} />
                      <CompassAxisBar
                        label="Qualité de parcours"
                        value={chartReco.breakdown.friction}
                      />
                    </div>
                  ) : null}

                  {chartReco.topDrivers && chartReco.topDrivers.length > 0 ? (
                    <div className="rounded-xl border border-[#0D1B3E]/10 bg-white/90 p-4">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#0D1B3E]/45">
                        Facteurs clés
                      </p>
                      <ul className="list-disc space-y-1.5 pl-4 text-xs font-medium leading-relaxed text-[#0D1B3E]/78">
                        {formatScoreDriversFrench(chartReco.topDrivers).map((line, i) => (
                          <li key={`${chartReco.id}-drv-${i}`}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <Link
                    href={`/countries/${chartReco.id}`}
                    className="inline-block text-xs font-black uppercase tracking-wider text-[#0D1B3E] underline decoration-[#0D1B3E]/30 underline-offset-4 hover:decoration-[#0D1B3E]"
                  >
                    Ouvrir la fiche pays →
                  </Link>
                </div>
              ) : null}
            </aside>

            <main className="relative flex min-h-[320px] flex-1 flex-col bg-[#e8e8e8] lg:min-h-0">
              <div className="absolute right-4 top-4 z-[1] max-w-[calc(100%-2rem)] sm:right-6 sm:top-6">
                <span className="inline-block border border-[#0D1B3E]/10 bg-white px-3 py-1.5 text-[9px] font-black uppercase leading-tight tracking-[0.14em] text-[#0D1B3E] shadow-sm sm:text-[10px]">
                  {globalProjectionBadgeLabel()}
                </span>
              </div>
              {chartReco?.breakdown ? (
                <div className="flex flex-1 flex-col items-center justify-center px-4 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-20">
                  <div className="relative w-full max-w-[min(100%,420px)]">
                    <div
                      className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 select-none text-center font-sans text-[11px] font-light tracking-[0.3em] text-[#0D1B3E]/15"
                      aria-hidden
                    >
                      300×300
                    </div>
                    <div className="relative z-[1] mx-auto w-full min-w-0">
                      <ScoreBreakdownChart
                        breakdown={chartReco.breakdown}
                        chartHeight={300}
                        withAxisLegend={false}
                      />
                    </div>
                  </div>
                  <div
                    className="relative z-[1] mt-6 flex justify-center gap-8 opacity-40"
                    aria-hidden
                  >
                    <span className="h-3 w-3 rounded-full border-2 border-[#0D1B3E] bg-white shadow-inner" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#0D1B3E]/35" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#0D1B3E]/25" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center p-8 text-sm font-medium text-[#0D1B3E]/50">
                  Projection indisponible pour ce résultat.
                </div>
              )}
            </main>
          </div>

          <div className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6 sm:py-14">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[#0D1B3E]">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#0D1B3E]/25 text-[#0D1B3E] focus:ring-[#0D1B3E]/30"
                  checked={compareMode}
                  onChange={(ev) => {
                    setCompareMode(ev.target.checked);
                    if (!ev.target.checked) setCompareSelectedIds([]);
                  }}
                />
                Mode comparaison radar (2 à 3 pays)
              </label>
              {compareMode ? (
                <p className="text-xs font-medium text-[#0D1B3E]/60 sm:max-w-md sm:text-right">
                  Activez les cases dans le classement ci-dessous ; la zone de comparaison apparaît
                  sous le radar principal.
                </p>
              ) : null}
            </div>

            {compareRecos.length >= 2 ? (
              <Card className="min-w-0 border-[#0D1B3E]/10 bg-white shadow-sm">
                <CardContent className="space-y-4 p-4 sm:p-6">
                  <h2 className="text-lg font-black text-[#0D1B3E]">
                    Comparaison radar (2–3 pays)
                  </h2>
                  <p className="text-xs font-medium text-[#0D1B3E]/65">
                    Même échelle que le radar principal — survolez un axe pour la définition alignée
                    sur le moteur.
                  </p>
                  <div className="grid min-w-0 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {compareRecos.map((r) => (
                      <div
                        key={String(r.id)}
                        className="min-w-0 rounded-xl border border-[#0D1B3E]/10 bg-[#FDFBF4] p-4"
                      >
                        <p className="mb-2 text-sm font-black text-[#0D1B3E]">{r.name}</p>
                        <ScoreBreakdownChart
                          breakdown={r.breakdown!}
                          chartHeight={200}
                          withAxisLegend={false}
                        />
                        <Link
                          href={`/countries/${r.id}`}
                          className="mt-2 inline-block text-xs font-bold text-[#0D1B3E] underline-offset-2 hover:underline"
                        >
                          Ouvrir la fiche pays →
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <div>
              <h2 className="mb-6 text-lg font-black tracking-tight text-[#0D1B3E]">Classement</h2>
              <RecommendationPanel
                results={panelRows}
                compareMode={compareMode}
                compareSelectedIds={compareSelectedIds}
                onCompareToggle={toggleCompare}
                variant="compass"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
