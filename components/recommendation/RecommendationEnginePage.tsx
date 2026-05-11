'use client';

import {
  ArrowLeftRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import { RecommendationPanel } from '@/components/engine/RecommendationPanel';
import type { RadarBreakdown } from '@/components/engine/ScoreBreakdownChart';
import { ScoreBreakdownChart } from '@/components/engine/ScoreBreakdownChart';
import { useObjectivePreferenceOptional } from '@/components/objectives/ObjectivePreferenceProvider';
import { PulseDualRadarChart } from '@/components/recommendation/PulseDualRadarChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatGoalTypeLabelFr } from '@/lib/probability-profile-narrative';
import type { ApiRecommendation } from '@/lib/recommendation-ui';
import { mapApiRecommendationToPanelRow } from '@/lib/recommendation-ui';
import { formatScoreDriversFrench } from '@/lib/score-driver-explain';
import { appToast } from '@/lib/toast-store';
import { getObjectiveBySlug } from '@/lib/user-objectives/registry';
import { userGoalTypeToEngineGoal } from '@/lib/user-profile-enums';

const GOALS = ['TOURISM', 'STUDY', 'WORK', 'BUSINESS', 'SHORT_COURSE'] as const;

type PulseWeights = {
  workMobility: number;
  costOfLiving: number;
  consularRisk: number;
  qualityOfLife: number;
  education: number;
};

const DEFAULT_WEIGHTS: PulseWeights = {
  workMobility: 85,
  costOfLiving: 40,
  consularRisk: 60,
  qualityOfLife: 75,
  education: 30,
};

function engineGoalToCompareObjectiveId(g: (typeof GOALS)[number]): string {
  const m: Record<(typeof GOALS)[number], string> = {
    TOURISM: 'tourism',
    STUDY: 'studies_master',
    WORK: 'work',
    BUSINESS: 'business',
    SHORT_COURSE: 'training_short_technical',
  };
  return m[g] ?? 'tourism';
}

function weightedComposite(r: ApiRecommendation, w: PulseWeights): number {
  const b = r.breakdown;
  if (!b) return Number(r.score) || 0;
  const den = w.workMobility + w.costOfLiving + w.consularRisk + w.qualityOfLife + w.education;
  if (den <= 0) return Number(r.score) || 0;
  return (
    w.workMobility * b.visa +
    w.costOfLiving * b.friction +
    w.consularRisk * (100 - b.risk) +
    (w.qualityOfLife + w.education) * b.goalMatch
  ) / den;
}

function confidenceBadge(level: string | undefined): { text: string; className: string } {
  const l = (level ?? '').toLowerCase();
  if (l.includes('very high') || l === 'high') {
    return {
      text: 'CONFIANCE HAUTE',
      className: 'border-sky-200 bg-sky-50 text-sky-950',
    };
  }
  if (l === 'medium') {
    return {
      text: 'CONFIANCE MOYENNE',
      className: 'border-slate-200 bg-slate-100 text-slate-800',
    };
  }
  return {
    text: 'À VÉRIFIER',
    className: 'border-amber-200 bg-amber-50 text-amber-950',
  };
}

function formatRunAgo(d: Date | null): string {
  if (!d) return '—';
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 90) return 'il y a moins de 2 min';
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  return `il y a ${Math.floor(s / 86400)} j`;
}

function PulseWeightSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs font-black uppercase tracking-wide text-[#0D1B3E]">
        <span>{label}</span>
        <span className="rounded border border-[#0D1B3E]/10 bg-[#FDFBF4] px-2 py-0.5 font-mono text-[11px] tabular-nums text-[#0D1B3E]/70">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#0D1B3E]/15 accent-[#0D1B3E]"
      />
    </div>
  );
}

export default function RecommendationEnginePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFBF4] bg-[linear-gradient(rgba(13,27,62,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(13,27,62,0.035)_1px,transparent_1px)] bg-[length:22px_22px]">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-16 sm:px-6">
            <Loader2 className="h-8 w-8 shrink-0 animate-spin text-[#0D1B3E]" aria-hidden />
            <p className="text-sm font-medium text-[#0D1B3E]/70">Chargement du terminal Pulse…</p>
          </div>
        </div>
      }
    >
      <RecommendationEnginePageInner />
    </Suspense>
  );
}

function RecommendationEnginePageInner() {
  const searchParams = useSearchParams();
  const objectivePref = useObjectivePreferenceOptional();
  const [goalLockedFromAccount, setGoalLockedFromAccount] = useState(false);
  const [weights, setWeights] = useState<PulseWeights>(DEFAULT_WEIGHTS);
  const [lastRunAt, setLastRunAt] = useState<Date | null>(null);

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
  const [age, setAge] = useState('');
  const [income, setIncome] = useState('8000');
  const [savings, setSavings] = useState('70000');
  const [cnss, setCnss] = useState(true);
  const [maritalStatus, setMaritalStatus] = useState<'SINGLE' | 'MARRIED'>('SINGLE');
  const [familyInEU, setFamilyInEU] = useState(false);
  const [goal, setGoal] = useState<(typeof GOALS)[number]>('STUDY');

  const [results, setResults] = useState<ApiRecommendation[]>([]);
  const [chartCountryId, setChartCountryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileHint, setProfileHint] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelectedIds, setCompareSelectedIds] = useState<number[]>([]);

  const rankedResults = useMemo(() => {
    if (!results.length) return [];
    return [...results].sort((a, b) => weightedComposite(b, weights) - weightedComposite(a, weights));
  }, [results, weights]);

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/user/profile');
      const p = await res.json();
      if (!res.ok) {
        setGoalLockedFromAccount(false);
        setProfileHint('Profil introuvable — saisissez les valeurs manuellement.');
        return;
      }
      if (p === null || p === undefined) {
        setGoalLockedFromAccount(false);
        setProfileHint('Complétez votre profil ou saisissez les valeurs manuellement.');
        return;
      }
      if (typeof p === 'object' && p !== null && 'error' in p && p.error) {
        setGoalLockedFromAccount(false);
        setProfileHint('Profil introuvable — saisissez les valeurs manuellement.');
        return;
      }
      setGoalLockedFromAccount(true);
      setProfileHint('Profil chargé depuis votre compte.');
      setIncome(String(Math.round(p.income ?? 0)));
      setSavings(String(Math.round(p.savings ?? 0)));
      setCnss(Boolean(p.CNSS_status));
      setFamilyInEU(Boolean(p.family_in_europe));
      const m = String(p.marital_status || 'SINGLE').toUpperCase();
      setMaritalStatus(m === 'MARRIED' ? 'MARRIED' : 'SINGLE');
      const a = Number(p.age);
      setAge(Number.isFinite(a) && a >= 16 && a <= 120 ? String(Math.round(a)) : '');
      const g = String(p.goal_type || 'TOURISM').toUpperCase();
      if ((GOALS as readonly string[]).includes(g)) setGoal(g as (typeof GOALS)[number]);
    } catch {
      setGoalLockedFromAccount(false);
      setProfileHint('Impossible de charger le profil.');
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (goalLockedFromAccount) return;
    if (!objectivePref?.ready) return;
    const slug = objectivePref.preference.primarySlug;
    if (!slug) return;
    const engine = getObjectiveBySlug(slug)?.engineGoal;
    if (!engine) return;
    const upper = userGoalTypeToEngineGoal(engine);
    if ((GOALS as readonly string[]).includes(upper)) {
      setGoal(upper as (typeof GOALS)[number]);
    }
  }, [goalLockedFromAccount, objectivePref?.ready, objectivePref?.preference.primarySlug]);

  const handleRun = async () => {
    setLoading(true);
    setProfileHint(null);
    try {
      const ageN = Number.parseInt(age.trim(), 10);
      const profile: Record<string, unknown> = {
        income: Number(income) || 0,
        savings: Number(savings) || 0,
        CNSS_status: cnss,
        marital_status: maritalStatus,
        family_in_europe: familyInEU,
        goal_type: goal,
      };
      if (Number.isFinite(ageN) && ageN >= 16 && ageN <= 120) {
        profile.age = ageN;
      }
      const res = await fetch('/api/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          playground: true,
          ...(focusCountryId != null ? { focusCountryId } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResults([]);
        setProfileHint(typeof data?.error === 'string' ? data.error : 'Erreur API');
        return;
      }
      const list = Array.isArray(data) ? (data as ApiRecommendation[]) : [];
      setResults(list);
      if (list.length > 0) setLastRunAt(new Date());
    } catch {
      setProfileHint('Échec réseau.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const panelRows = useMemo(
    () => rankedResults.map((r, idx) => mapApiRecommendationToPanelRow(r, idx + 1)),
    [rankedResults],
  );

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
    const byId = new Map(rankedResults.map((r) => [Number(r.id), r]));
    return compareSelectedIds
      .map((id) => byId.get(id))
      .filter((r): r is ApiRecommendation => Boolean(r?.breakdown));
  }, [compareSelectedIds, rankedResults]);

  const chartReco = useMemo(() => {
    if (!rankedResults.length) return null;
    const id = chartCountryId ?? Number(rankedResults[0].id);
    return rankedResults.find((r) => Number(r.id) === id) ?? rankedResults[0];
  }, [rankedResults, chartCountryId]);

  const chartRank = useMemo(() => {
    if (!chartReco) return 1;
    const i = rankedResults.findIndex((r) => Number(r.id) === Number(chartReco.id));
    return i >= 0 ? i + 1 : 1;
  }, [chartReco, rankedResults]);

  useEffect(() => {
    if (!rankedResults.length) return;
    setChartCountryId((prev) => {
      if (prev != null && rankedResults.some((r) => Number(r.id) === prev)) return prev;
      return Number(rankedResults[0].id);
    });
  }, [rankedResults]);

  const idealBreakdown: RadarBreakdown = useMemo(
    () => ({
      visa: Math.min(100, Math.max(0, (weights.workMobility + weights.education) / 2)),
      friction: Math.min(
        100,
        Math.max(0, (weights.qualityOfLife + (100 - weights.costOfLiving)) / 2),
      ),
      goalMatch: Math.min(100, Math.max(0, weights.education)),
      risk: Math.min(100, Math.max(0, 100 - weights.consularRisk)),
    }),
    [weights],
  );

  const decisionLogItems = useMemo(() => {
    if (!chartReco?.breakdown) return [];
    const drivers = formatScoreDriversFrench(chartReco.topDrivers ?? []).slice(0, 3);
    if (drivers.length > 0) {
      return drivers.map((text, i) => {
        const cut = text.indexOf('·');
        const title =
          cut > 0 ? text.slice(0, cut).trim() : text.slice(0, 48).trim() + (text.length > 48 ? '…' : '');
        const body = cut > 0 ? text.slice(cut + 1).trim() : text;
        return { title: title || `Lecture ${i + 1}`, body };
      });
    }
    const reason = chartReco.reason?.trim();
    const expl = (chartReco.explanation ?? []).map((x) => String(x).trim()).filter(Boolean);
    const lines = [reason, expl[0], expl[1]].filter(Boolean) as string[];
    return lines.slice(0, 3).map((body, i) => ({
      title: ['Synthèse modèle', 'Contexte pays', 'Objectif'][i] ?? `Point ${i + 1}`,
      body,
    }));
  }, [chartReco]);

  const compareTop3Href = useMemo(() => {
    if (rankedResults.length < 2) return null;
    const ids = rankedResults
      .slice(0, 3)
      .map((r) => Number(r.id))
      .filter((n) => Number.isFinite(n));
    const obj = engineGoalToCompareObjectiveId(goal);
    return `/compare?objective=${encodeURIComponent(obj)}&countries=${ids.join(',')}`;
  }, [rankedResults, goal]);

  const shellClass =
    'min-h-screen bg-[#FDFBF4] bg-[linear-gradient(rgba(13,27,62,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(13,27,62,0.035)_1px,transparent_1px)] bg-[length:22px_22px]';

  return (
    <div className={shellClass}>
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
        <div className="mb-8 flex flex-col gap-6 border-b border-[#0D1B3E]/10 pb-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="font-serif text-4xl font-bold tracking-tight text-[#0D1B3E] sm:text-5xl">Pulse</h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#0D1B3E]/20 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#0D1B3E] shadow-sm">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                Pro
              </span>
            </div>
            <p className="mt-4 max-w-2xl font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/85 sm:text-[15px]">
              Recommandations avancées : ajustez les pondérations pour affiner l&apos;analyse de destination optimale
              basée sur des flux de données cohérents avec le moteur Babil (scoring déterministe et explicable).
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => setWeights({ ...DEFAULT_WEIGHTS })}
              className="rounded-xl border-2 border-[#0D1B3E] bg-transparent px-4 py-2.5 text-center text-[11px] font-black uppercase tracking-[0.18em] text-[#0D1B3E] transition-colors hover:bg-[#0D1B3E]/5"
            >
              Réinitialiser
            </button>
            <button
              type="button"
              onClick={() => appToast.info('Export PDF — bientôt disponible.')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0D1B3E] bg-transparent px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#0D1B3E] transition-colors hover:bg-[#0D1B3E]/5"
            >
              <Upload className="h-4 w-4" aria-hidden />
              Exporter
            </button>
            {compareTop3Href ? (
              <Link
                href={compareTop3Href}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D1B3E] px-4 py-2.5 text-center text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-md transition-colors hover:bg-[#0D1B3E]/90"
              >
                <ArrowLeftRight className="h-4 w-4 shrink-0" aria-hidden />
                Comparer le top 3
              </Link>
            ) : (
              <span className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border-2 border-[#0D1B3E]/15 bg-[#0D1B3E]/10 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#0D1B3E]/40">
                <ArrowLeftRight className="h-4 w-4 shrink-0" aria-hidden />
                Comparer le top 3
              </span>
            )}
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="outline"
            type="button"
            onClick={() => void loadProfile()}
            className="w-full shrink-0 gap-2 border-[#0D1B3E]/25 text-[#0D1B3E] hover:bg-[#0D1B3E]/5 sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 shrink-0" /> Recharger profil
          </Button>
        </div>

        {profileHint ? (
          <p className="mb-6 rounded-xl border border-[#0D1B3E]/12 bg-white px-4 py-3 text-sm font-medium text-[#0D1B3E]/85 shadow-sm">
            {profileHint}
          </p>
        ) : null}

        {focusCountryId != null ? (
          <p
            className="mb-6 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm font-medium text-[#0D1B3E]"
            role="status"
          >
            <span className="font-black text-amber-800">Contexte pays.</span> Le classement priorisera{' '}
            <strong>{focusCountryName ?? `le pays #${focusCountryId}`}</strong>
            {focusCountryName ? ` (#${focusCountryId})` : null} après chaque exécution.{' '}
            <Link
              href={`/countries/${focusCountryId}`}
              className="font-bold text-[#0D1B3E] underline decoration-[#0D1B3E]/30 underline-offset-2 hover:decoration-[#0D1B3E]"
            >
              Revoir la fiche
            </Link>
            {' · '}
            <Link
              href="/recommendation-engine"
              className="font-bold text-[#0D1B3E]/55 underline underline-offset-2 hover:text-[#0D1B3E]"
            >
              Effacer le contexte
            </Link>
          </p>
        ) : null}

        <details className="group mb-10 rounded-2xl border border-[#0D1B3E]/10 bg-white shadow-sm open:shadow-md" open>
          <summary className="cursor-pointer list-none rounded-2xl px-5 py-4 font-black text-[#0D1B3E] marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" aria-hidden />
              Paramètres d&apos;exécution du modèle
              <span className="ml-2 text-xs font-medium text-[#0D1B3E]/50">(profil synthétique · playground)</span>
            </span>
          </summary>
          <div className="border-t border-[#0D1B3E]/10 px-5 pb-6 pt-2">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="reco-age" className="text-[#0D1B3E]">
                  Âge (optionnel)
                </Label>
                <Input
                  id="reco-age"
                  inputMode="numeric"
                  placeholder="16–120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="border-[#0D1B3E]/15"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income" className="text-[#0D1B3E]">
                  Revenu mensuel (MAD)
                </Label>
                <Input
                  id="income"
                  inputMode="numeric"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="border-[#0D1B3E]/15"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="savings" className="text-[#0D1B3E]">
                  Épargne (MAD)
                </Label>
                <Input
                  id="savings"
                  inputMode="numeric"
                  value={savings}
                  onChange={(e) => setSavings(e.target.value)}
                  className="border-[#0D1B3E]/15"
                />
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[#0D1B3E]">Objectif principal</Label>
                <Select value={goal} onValueChange={(v) => setGoal(v as (typeof GOALS)[number])}>
                  <SelectTrigger
                    disabled={goalLockedFromAccount}
                    className="w-full max-w-md border-[#0D1B3E]/15"
                  >
                    <SelectValue placeholder="Objectif" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOALS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {formatGoalTypeLabelFr(g)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[#0D1B3E]">Statut marital</Label>
                <Select
                  value={maritalStatus}
                  onValueChange={(v) => setMaritalStatus(v as 'SINGLE' | 'MARRIED')}
                >
                  <SelectTrigger className="w-full max-w-md border-[#0D1B3E]/15">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE">Célibataire</SelectItem>
                    <SelectItem value="MARRIED">Marié(e)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#0D1B3E]/85">
                <input
                  type="checkbox"
                  className="size-4 rounded border-[#0D1B3E]/25 text-[#0D1B3E] focus:ring-[#0D1B3E]/30"
                  checked={cnss}
                  onChange={(e) => setCnss(e.target.checked)}
                />
                CNSS / activité déclarée
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#0D1B3E]/85">
                <input
                  type="checkbox"
                  className="size-4 rounded border-[#0D1B3E]/25 text-[#0D1B3E] focus:ring-[#0D1B3E]/30"
                  checked={familyInEU}
                  onChange={(e) => setFamilyInEU(e.target.checked)}
                />
                Famille en Europe
              </label>
            </div>
            <Button
              type="button"
              onClick={() => void handleRun()}
              disabled={loading}
              className="mt-6 w-full gap-2 bg-[#0D1B3E] hover:bg-[#0D1B3E]/90 sm:w-auto"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Lancer l&apos;analyse
            </Button>
          </div>
        </details>

        {rankedResults.length > 0 ? (
          <>
            <div className="mb-10 grid min-w-0 gap-6 lg:grid-cols-3">
              <Card className="min-w-0 border-[#0D1B3E]/10 bg-white shadow-sm">
                <CardContent className="space-y-5 p-5 sm:p-6">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                    Pondérations paramétriques
                  </h2>
                  <PulseWeightSlider
                    label="Mobilité travail"
                    value={weights.workMobility}
                    onChange={(n) => setWeights((w) => ({ ...w, workMobility: n }))}
                  />
                  <PulseWeightSlider
                    label="Coût de la vie"
                    value={weights.costOfLiving}
                    onChange={(n) => setWeights((w) => ({ ...w, costOfLiving: n }))}
                  />
                  <PulseWeightSlider
                    label="Risque consulaire"
                    value={weights.consularRisk}
                    onChange={(n) => setWeights((w) => ({ ...w, consularRisk: n }))}
                  />
                  <PulseWeightSlider
                    label="Qualité de vie"
                    value={weights.qualityOfLife}
                    onChange={(n) => setWeights((w) => ({ ...w, qualityOfLife: n }))}
                  />
                  <PulseWeightSlider
                    label="Éducation"
                    value={weights.education}
                    onChange={(n) => setWeights((w) => ({ ...w, education: n }))}
                  />
                  <p className="text-[11px] font-medium leading-relaxed text-[#0D1B3E]/55">
                    Les curseurs réordonnent le classement localement (pondération des quatre piliers du radar) sans
                    rappel serveur.
                  </p>
                </CardContent>
              </Card>

              <Card className="min-w-0 border-[#0D1B3E]/10 bg-white shadow-sm">
                <CardContent className="space-y-4 p-5 sm:p-6">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                    Analyse dimensionnelle
                  </h2>
                  {chartReco?.breakdown ? (
                    <>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <Select
                          value={String(chartReco.id)}
                          onValueChange={(v) => setChartCountryId(Number(v))}
                        >
                          <SelectTrigger className="w-full border-[#0D1B3E]/15 sm:max-w-[220px]">
                            <SelectValue placeholder="Pays" />
                          </SelectTrigger>
                          <SelectContent>
                            {rankedResults.map((r) => (
                              <SelectItem key={String(r.id)} value={String(r.id)}>
                                {r.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <PulseDualRadarChart
                        destinationBreakdown={chartReco.breakdown}
                        idealBreakdown={idealBreakdown}
                        destinationLabel={`${chartReco.name} (TOP #${chartRank})`}
                      />
                    </>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="min-w-0 border-[#0D1B3E]/10 bg-white shadow-sm">
                <CardContent className="space-y-4 p-5 sm:p-6">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                    Log de décision
                  </h2>
                  <ul className="space-y-5">
                    {decisionLogItems.map((item, i) => (
                      <li key={`log-${i}`} className="border-b border-[#0D1B3E]/6 pb-5 last:border-0 last:pb-0">
                        <p className="text-sm font-black text-[#0D1B3E]">{item.title}</p>
                        <p className="mt-1.5 font-serif text-sm italic leading-relaxed text-[#0D1B3E]/78">{item.body}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="mb-10 grid min-w-0 gap-6 lg:grid-cols-3">
              <Card className="min-w-0 border border-amber-200/50 bg-[#fdf8ed] shadow-sm">
                <CardContent className="space-y-4 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="mt-0.5 h-6 w-6 shrink-0 text-[#0D1B3E]" aria-hidden />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/50">
                        Insight exclusif
                      </p>
                      <h3 className="mt-1 font-serif text-lg font-bold text-[#0D1B3E]">Rapport approfondi</h3>
                    </div>
                  </div>
                  <p className="font-serif text-sm leading-relaxed text-[#0D1B3E]/80">
                    Générez un export structuré (projections, jalons consulaires et synthèse des signaux pays) dès que
                    l&apos;offre PDF sera activée côté produit.
                  </p>
                  <button
                    type="button"
                    onClick={() => appToast.info('Génération PDF — bientôt disponible.')}
                    className="inline-flex w-full items-center justify-center rounded-xl border-2 border-[#0D1B3E] py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[#0D1B3E] transition-colors hover:bg-white sm:w-auto sm:px-6"
                  >
                    Générer le PDF →
                  </button>
                </CardContent>
              </Card>

              <Card className="min-w-0 border-[#0D1B3E]/10 bg-white shadow-sm lg:col-span-2">
                <CardContent className="p-5 sm:p-6">
                  <div className="mb-6 flex flex-col gap-2 border-b border-[#0D1B3E]/08 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                      Résultats du calcul
                    </h2>
                    <p className="inline-flex items-center gap-2 text-xs font-medium text-[#0D1B3E]/55">
                      <Clock className="h-4 w-4 shrink-0" aria-hidden />
                      Modèle exécuté {formatRunAgo(lastRunAt)}
                    </p>
                  </div>
                  <ul className="divide-y divide-[#0D1B3E]/08">
                    {rankedResults.slice(0, 8).map((r, idx) => {
                      const comp = weightedComposite(r, weights);
                      const badge = confidenceBadge(r.level);
                      return (
                        <li key={String(r.id)}>
                          <Link
                            href={`/countries/${r.id}`}
                            className="group flex flex-wrap items-center gap-4 py-4 transition-colors hover:bg-[#FDFBF4]/80 sm:flex-nowrap sm:gap-6"
                          >
                            <span className="w-8 shrink-0 font-mono text-sm font-black text-[#0D1B3E]/45">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-black text-[#0D1B3E]">{r.name}</p>
                              {r.reason ? (
                                <p className="mt-0.5 line-clamp-1 text-xs font-medium text-[#0D1B3E]/55">{r.reason}</p>
                              ) : null}
                            </div>
                            <span
                              className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${badge.className}`}
                            >
                              {badge.text}
                            </span>
                            <span className="shrink-0 text-right font-mono text-xs font-black uppercase tracking-wide text-[#0D1B3E]">
                              Score composite {comp.toFixed(1)}
                            </span>
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#0D1B3E]/10 text-[#0D1B3E] transition-colors group-hover:bg-[#0D1B3E] group-hover:text-white">
                              <ChevronRight className="h-5 w-5" aria-hidden />
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[#0D1B3E]">
                <input
                  type="checkbox"
                  className="size-4 rounded border-[#0D1B3E]/25 text-[#0D1B3E] focus:ring-[#0D1B3E]/30"
                  checked={compareMode}
                  onChange={(ev) => {
                    setCompareMode(ev.target.checked);
                    if (!ev.target.checked) setCompareSelectedIds([]);
                  }}
                />
                Mode comparaison radar (2 à 3 pays)
              </label>
              {compareMode ? (
                <p className="max-w-xl text-xs font-medium text-[#0D1B3E]/60 sm:text-right">
                  Cochez des pays dans le classement détaillé ci-dessous.
                </p>
              ) : null}
            </div>

            {compareRecos.length >= 2 ? (
              <Card className="mb-10 min-w-0 border-[#0D1B3E]/10 bg-white shadow-sm">
                <CardContent className="space-y-4 p-4 sm:p-6">
                  <h2 className="text-lg font-black text-[#0D1B3E]">Comparaison radar (2–3 pays)</h2>
                  <p className="text-xs font-medium text-[#0D1B3E]/65">
                    Même échelle que le radar principal — survolez un axe pour le détail.
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

            <div className="space-y-4">
              <h2 className="text-lg font-black tracking-tight text-[#0D1B3E]">Classement détaillé</h2>
              <RecommendationPanel
                results={panelRows}
                compareMode={compareMode}
                compareSelectedIds={compareSelectedIds}
                onCompareToggle={toggleCompare}
                variant="compass"
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
