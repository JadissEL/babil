'use client';

import { SignInButton, useUser } from '@clerk/nextjs';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { DashboardPageSkeleton } from '@/components/dashboard/DashboardPageSkeleton';
import { ProfileContextBanner } from '@/components/dashboard/ProfileContextBanner';
import RecommendationPanel from '@/components/engine/RecommendationPanel';
import { ScoreBreakdownChart } from '@/components/engine/ScoreBreakdownChart';
import { useObjectivePreferenceOptional } from '@/components/objectives/ObjectivePreferenceProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CTA_COMPARE_TOURISM_HREF, CTA_EXPLORE_HREF } from '@/lib/cta-hrefs';
import { writeOnboarding } from '@/lib/onboarding-storage';
import { PUBLIC_READ_ONLY_DEMO_PROFILE } from '@/lib/public-read-only-demo-profile';
import type { ApiRecommendation } from '@/lib/recommendation-ui';
import { mapApiRecommendationToPanelRow } from '@/lib/recommendation-ui';
import { formatScoreDriversFrench } from '@/lib/score-driver-explain';
import { appToast } from '@/lib/toast-store';
import { getObjectiveBySlug } from '@/lib/user-objectives/registry';

function RecoMetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] font-black uppercase tracking-widest text-muted">
        <span>{label}</span>
        <span className="font-bold text-text">{Math.round(value)}</span>
      </div>
      <Progress value={Math.min(100, Math.max(0, value))} />
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
    <div>
      <div className="mb-8 sm:mb-10">
        <h1 className="mb-2 text-2xl font-black tracking-tight text-text sm:text-3xl lg:text-4xl">
          Intelligence de recommandation
        </h1>
      </div>
      <DashboardPageSkeleton />
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
              withFocus(
                anonymousEngineGoal ? { anonymous_goal_type: anonymousEngineGoal } : {},
              ),
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
      <div>
        <div className="mb-8 sm:mb-10">
          <h1 className="mb-2 text-2xl font-black tracking-tight text-text sm:text-3xl lg:text-4xl">
            Intelligence de recommandation
          </h1>
        </div>
        <DashboardPageSkeleton />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 sm:mb-10">
        <h1 className="mb-2 text-2xl font-black tracking-tight text-text sm:text-3xl lg:text-4xl">
          Intelligence de recommandation
        </h1>
        <p className="text-sm font-medium text-muted sm:text-base">
          Analyses basées sur votre profil et les données terrain — scoring déterministe et
          explicable.
        </p>
      </div>

      {readOnlyDemo ? (
        <div className="mb-6 rounded-2xl border border-primary/35 bg-primary-soft/50 p-4 text-sm font-medium text-text shadow-card sm:p-5">
          <span className="font-black text-primary">Mode découverte.</span> Résultats calculés avec
          un profil de démonstration fixe (non personnalisable).{' '}
          <SignInButton mode="modal">
            <button
              type="button"
              className="font-black text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
            >
              Connectez-vous
            </button>
          </SignInButton>{' '}
          puis complétez votre profil pour des recommandations sur mesure.
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
            className="font-black text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
          >
            Revoir la fiche
          </Link>
          {' · '}
          <Link
            href="/recommendations"
            className="font-black text-muted underline decoration-muted/50 underline-offset-2 hover:text-primary hover:decoration-primary"
          >
            Effacer le contexte
          </Link>
        </div>
      ) : null}

      {recommendations.length === 0 ? (
        <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-surface px-6 py-10 text-center shadow-card sm:rounded-[2rem] sm:p-12">
          <AlertCircle className="mx-auto mb-6 h-16 w-16 text-primary" />
          <h2 className="mb-4 text-2xl font-black text-text">Besoin de plus d&apos;infos</h2>
          <p className="mb-8 font-medium leading-relaxed text-muted">
            Complétez votre profil pour obtenir des recommandations personnalisées basées sur votre
            budget et vos objectifs.
          </p>
          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/profile"
              className="inline-flex justify-center rounded-2xl bg-primary px-8 py-4 font-black text-white shadow-soft transition-colors hover:bg-primary-hover"
            >
              Configurer mon profil
            </Link>
            <Link
              href={CTA_EXPLORE_HREF}
              className="inline-flex justify-center rounded-2xl border border-line bg-inset px-8 py-4 font-black text-text transition-colors hover:bg-primary-soft"
            >
              Explorer les pays
            </Link>
            <Link
              href={CTA_COMPARE_TOURISM_HREF}
              className="inline-flex justify-center rounded-2xl border border-line bg-inset px-8 py-4 font-black text-text transition-colors hover:bg-primary-soft"
            >
              Tester le comparateur
            </Link>
          </div>
        </div>
      ) : (
        <>
          {profileUsed ? (
            <ProfileContextBanner profile={profileUsed} variant="recommendation" />
          ) : null}

          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-text">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
                checked={compareMode}
                onChange={(ev) => {
                  setCompareMode(ev.target.checked);
                  if (!ev.target.checked) setCompareSelectedIds([]);
                }}
              />
              Mode comparaison radar (2 à 3 pays)
            </label>
            {compareMode ? (
              <p className="text-xs font-medium text-muted sm:max-w-md sm:text-right">
                Activez les cases dans le classement ci-dessous ; la zone de comparaison apparaît
                sous le radar principal.
              </p>
            ) : null}
          </div>

          {chartReco?.breakdown ? (
            <div className="mb-10 grid min-w-0 gap-6 lg:grid-cols-2">
              <Card className="min-w-0 border-line bg-surface shadow-card">
                <CardContent className="space-y-4 p-4 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-black text-text">Radar — {chartReco.name}</h2>
                    <Select
                      value={String(chartReco.id)}
                      onValueChange={(v) => setChartCountryId(Number(v))}
                    >
                      <SelectTrigger className="w-full border-line bg-inset sm:w-[220px]">
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
                  <ScoreBreakdownChart breakdown={chartReco.breakdown} />
                  <Link
                    href={`/countries/${chartReco.id}`}
                    className="inline-block text-xs font-bold text-primary underline-offset-2 hover:underline"
                  >
                    Ouvrir la fiche pays →
                  </Link>
                </CardContent>
              </Card>

              <Card className="min-w-0 border-line bg-surface shadow-card">
                <CardContent className="space-y-4 p-4 sm:p-6">
                  <h2 className="text-lg font-black text-text">Détail des piliers</h2>
                  <div className="grid gap-3">
                    <RecoMetricBar label="Visa" value={chartReco.breakdown.visa} />
                    <RecoMetricBar
                      label="Friction (facilité)"
                      value={chartReco.breakdown.friction}
                    />
                    <RecoMetricBar
                      label="Adéquation objectif"
                      value={chartReco.breakdown.goalMatch}
                    />
                    <RecoMetricBar
                      label="Risque refus (inv.)"
                      value={100 - chartReco.breakdown.risk}
                    />
                  </div>
                  <p className="text-xs font-medium text-muted">
                    Même décomposition que le moteur d&apos;analyse manuelle : visa, friction,
                    objectif et risque perçu.
                  </p>
                  {chartReco.topDrivers && chartReco.topDrivers.length > 0 ? (
                    <div className="rounded-lg border border-line bg-inset p-3">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted">
                        Facteurs les plus influents (vs neutre)
                      </p>
                      <ul className="list-disc space-y-1.5 pl-4 text-xs font-medium text-muted">
                        {formatScoreDriversFrench(chartReco.topDrivers).map((line, i) => (
                          <li key={`${chartReco.id}-driver-${i}`}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          ) : null}

          {compareRecos.length >= 2 ? (
            <Card className="mb-10 min-w-0 border-line bg-surface shadow-card">
              <CardContent className="space-y-4 p-4 sm:p-6">
                <h2 className="text-lg font-black text-text">Comparaison radar (2–3 pays)</h2>
                <p className="text-xs font-medium text-muted">
                  Même échelle que le radar principal — survolez un axe pour la définition alignée
                  sur le moteur.
                </p>
                <div className="grid min-w-0 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {compareRecos.map((r) => (
                    <div
                      key={String(r.id)}
                      className="min-w-0 rounded-xl border border-line bg-inset p-4"
                    >
                      <p className="mb-2 text-sm font-black text-text">{r.name}</p>
                      <ScoreBreakdownChart
                        breakdown={r.breakdown!}
                        chartHeight={200}
                        withAxisLegend={false}
                      />
                      <Link
                        href={`/countries/${r.id}`}
                        className="mt-2 inline-block text-xs font-bold text-primary underline-offset-2 hover:underline"
                      >
                        Ouvrir la fiche pays →
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="mb-4">
            <h2 className="text-lg font-black text-text">Classement</h2>
          </div>

          <RecommendationPanel
            results={panelRows}
            compareMode={compareMode}
            compareSelectedIds={compareSelectedIds}
            onCompareToggle={toggleCompare}
          />
        </>
      )}
    </div>
  );
}
