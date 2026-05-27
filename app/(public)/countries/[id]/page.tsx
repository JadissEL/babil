'use client';

import { useUser } from '@clerk/nextjs';
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  Car,
  CheckCircle2,
  Clock,
  GraduationCap,
  Heart,
  Map as MapIcon,
  MapPin,
  MessageSquare,
  Printer,
  Send,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useState, useEffect, useMemo } from 'react';
import { DataFreshnessStrap } from '@/components/content/DataFreshnessStrap';
import { MoroccoFirstDisclaimer } from '@/components/content/MoroccoFirstDisclaimer';
import { CountryDbInsightsCollapsible } from '@/components/country/CountryDbInsightsCollapsible';
import { CountryPerspectiveSummaryStrip } from '@/components/country/CountryPerspectiveSummaryStrip';
import CountryFlag from '@/components/country/CountryFlag';
import { IntelligenceProvenanceCollapsible } from '@/components/country/IntelligenceProvenanceCollapsible';
import { CountryIntelligenceCoverageBadge } from '@/components/intelligence/CountryIntelligenceCoverageBadge';
import { CountryIntelligenceSemanticStrip } from '@/components/intelligence/CountryIntelligenceSemanticStrip';
import { IntelligenceDisputedFieldsAlert } from '@/components/intelligence/IntelligenceDisputedFieldsAlert';
import { MoroccoResearchPackSection } from '@/components/country/MoroccoResearchPackSection';
import { OfficialSourcesCard } from '@/components/country/OfficialSourcesCard';
import { PhDStudiesCountryTeaser } from '@/components/country/PhDStudiesCountryTeaser';
import { TravelerQuotesSection } from '@/components/country/TravelerQuotesSection';
import { VisitReasonsSection } from '@/components/country/VisitReasonsSection';
import { DrivingRightsIntelSection } from '@/components/driving/DrivingRightsIntelSection';
import { BlockFeedback } from '@/components/feedback/BlockFeedback';
import GoogleAd from '@/components/GoogleAd';
import { DeepReportTeaser } from '@/components/monetization/DeepReportTeaser';
import { ObjectiveAwareExplorerLink } from '@/components/nav/ObjectiveAwareNavLinks';
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider';
import { showConsultantMarketplaceNav } from '@/lib/consultant-nav';
import { iso2ForCountryNameOrEmpty } from '@/lib/country-card-mappers';
import { filterPublicCountryInsights } from '@/lib/country-db-insights';
import { buildCountryExperienceContent } from '@/lib/country-experience-content';
import { materializeCountryApiRow } from '@/lib/country-full-data-materialize';
import {
  formatObservationConfidencePrintFr,
  formatObservationConfidenceSidebarFr,
  parseObservationConfidenceAggregatePayload,
} from '@/lib/country-observation-confidence-aggregate';
import { buildPhdStudies, hasCountryPhdStoredData } from '@/lib/country-phd-studies';
import { materializeDrivingRightsIntel } from '@/lib/driving-rights-intel';
import { enrichCountryApiRecord } from '@/lib/enrich-country-api';
import {
  buildCountryIntelligenceSemanticItems,
  disputedFieldPathsFromFull,
} from '@/lib/intelligence-lineage-display';
import {
  formatIntelDateShortFr,
  isEconomyIntelFresh,
  latestMaterializedIsoFromIntelMeta,
} from '@/lib/intel-freshness';
import { parseDataQualityAnomaliesPayload } from '@/lib/intelligence-data-anomalies';
import { MOROCCO_REALITY_FALLBACK_FR } from '@/lib/morocco-content-constants';
import type { MoroccoResearchPack } from '@/lib/morocco-research-pack';
import {
  NEXUS_FOCUS_VISIBLE,
  NEXUS_FOCUS_VISIBLE_ON_INK_SOLID,
  NEXUS_TRANSITION,
} from '@/lib/nexus-chrome';
import { officialSourcesForCountry } from '@/lib/official-sources';
import {
  buildCountrySheetSignals,
  formatCountrySheetSignalsSummary,
} from '@/lib/probability-result-display';
import { isSchengenMember } from '@/lib/schengen-members';
import { SCORE_SCALE_LEGEND_FR } from '@/lib/score-scale-lexicon';
import { appToast } from '@/lib/toast-store';
import {
  countryScoreVisible,
  isPhdPerspectiveRelevant,
  orientationStraplineForPerspective,
  perspectiveContractFromDefinition,
  type CountryScoreFocus,
} from '@/lib/user-objectives/perspective-contract';
import { getObjectiveBySlug } from '@/lib/user-objectives/registry';
import { cn } from '@/lib/utils';

type PublicCountryComment = {
  id: number;
  content: string;
  createdAt: string;
  user?: { name?: string | null };
};

type ApiCountryDetail = Record<string, unknown> & {
  name: string;
  comments?: PublicCountryComment[];
};

type CountryDetailLoadState = null | { error: string } | ApiCountryDetail;

function isCountryLoadError(s: CountryDetailLoadState): s is { error: string } {
  return s !== null && typeof s === 'object' && 'error' in s && !('name' in s);
}

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));
const toNum = (v: unknown, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

function moroccoRealityText(full: Record<string, unknown>): string {
  const mi = full.morocco_insights as Record<string, unknown> | undefined;
  const r = mi?.reality;
  if (typeof r === 'string' && r.trim()) return r.trim();
  return MOROCCO_REALITY_FALLBACK_FR;
}

function moroccoProTipText(full: Record<string, unknown>): string {
  const mi = full.morocco_insights as Record<string, unknown> | undefined;
  const t = mi?.pro_tip;
  return typeof t === 'string' && t.trim() ? t.trim() : '—';
}

function fmtBrutalReality(v: unknown): string {
  if (typeof v === 'number' && Number.isFinite(v)) return `${v}/10`;
  if (typeof v === 'string' && v.trim()) return `${v.trim()}/10`;
  return '—';
}

function fmtFrictionBlock(v: unknown): string {
  if (typeof v === 'number' && Number.isFinite(v)) return `${v}/100`;
  if (typeof v === 'string' && v.trim()) return `${v.trim()}/100`;
  return '—';
}

function fmtConfidencePct(v: unknown): string {
  if (typeof v === 'number' && Number.isFinite(v)) return `${Math.round(v)}%`;
  if (typeof v === 'string' && v.trim())
    return (v as string).includes('%') ? (v as string).trim() : `${(v as string).trim()}%`;
  return '—';
}

function fmtAcceptanceRate(v: unknown): string {
  if (typeof v === 'string' && v.trim()) return v.trim();
  if (typeof v === 'number' && Number.isFinite(v)) return `${v}%`;
  return '—';
}

function readFiniteNumber(v: unknown): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  return v;
}

function fmtIntlFrInteger(n: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n);
}

function fmtUsdCompact(n: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n);
}

function fmtUsdInteger(n: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtLifeExpectancyYears(n: number): string {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(n)} ans`;
}

/** Part de la population active sans emploi (série WB / OIT), en %. */
function fmtUnemploymentLaborForcePct(n: number): string {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(n)} %`;
}

/** Part de la population en zones urbaines (série WB), en % du total. */
function fmtUrbanPopulationPct(n: number): string {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(n)} %`;
}

function scoreTone(score: number) {
  if (score >= 75) return 'border-[#94dfbd] bg-[#e9f9f1] text-success';
  if (score >= 55) return 'border-[#f2c27a] bg-[#fff5e7] text-warning';
  if (score >= 35) return 'border-[#f3afaf] bg-[#fff0f0] text-danger';
  return 'border-line bg-inset text-text';
}

function scoreToneStitch(score: number): string {
  if (score >= 75) return 'text-emerald-700';
  if (score >= 55) return 'text-amber-700';
  if (score >= 35) return 'text-rose-700';
  return 'text-[#0D1B3E]';
}

function clampPercent(v: unknown): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function brutalRealityToPercent(v: unknown): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  if (n <= 10) return Math.max(0, Math.min(100, Math.round(n * 10)));
  return clampPercent(n);
}

function acceptanceToPercent(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return clampPercent(v);
  if (typeof v === 'string') {
    const m = v.match(/(\d+(?:\.\d+)?)/);
    if (m) return clampPercent(Number(m[1]));
  }
  return 0;
}

function scoreLabel(score: number) {
  if (score >= 75) return 'Facile';
  if (score >= 55) return 'Moyenne';
  if (score >= 35) return 'Difficile';
  return 'Critique';
}

function barTone(score: number) {
  if (score >= 75) return 'bg-emerald-500';
  if (score >= 55) return 'bg-amber-500';
  if (score >= 35) return 'bg-red-500';
  return 'bg-[#94a3b8]';
}

export default function CountryDetailPage() {
  const params = useParams();
  const id = params?.id;
  const { user, isLoaded: userLoaded } = useUser();
  const isGuest = userLoaded && !user;
  const { preference } = useObjectivePreference();
  const primaryObjectiveDef = useMemo(
    () => getObjectiveBySlug(preference.primarySlug),
    [preference.primarySlug],
  );
  const perspectiveContract = useMemo(
    () => perspectiveContractFromDefinition(primaryObjectiveDef),
    [primaryObjectiveDef],
  );
  const showExpertsMarketplaceCta = showConsultantMarketplaceNav(primaryObjectiveDef);
  const [showOffPerspectiveScores, setShowOffPerspectiveScores] = useState(false);
  const [showOffPerspectiveModules, setShowOffPerspectiveModules] = useState(false);
  const [showTourismExtendedFiche, setShowTourismExtendedFiche] = useState(false);
  const [country, setCountry] = useState<CountryDetailLoadState>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/countries/${id}`)
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || 'Failed to load country');
        return payload;
      })
      .then((data: unknown) => {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
          setCountry({ error: 'Réponse invalide' });
          setLoading(false);
          return;
        }
        const row = data as Record<string, unknown>;
        if (typeof row.name !== 'string') {
          setCountry({ error: 'Réponse invalide' });
          setLoading(false);
          return;
        }
        setCountry(row as ApiCountryDetail);
        setLoading(false);
      })
      .catch((error) => {
        setCountry({ error: String(error?.message || error || 'Country not found') });
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    fetch(`/api/user/favorites?countryId=${id}`)
      .then((res) => res.json())
      .then((data) => {
        setFavorited(Boolean(data?.favorited));
      })
      .catch(() => {});
  }, [user, id]);

  useEffect(() => {
    if (!user || !id) return;
    // light history tracking (best-effort)
    fetch('/api/user/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'VIEW_COUNTRY',
        payload: { countryId: parseInt(id as string) },
      }),
    }).catch(() => {});
  }, [user, id]);

  const toggleFavorite = async () => {
    if (!user || !id) return;
    setFavLoading(true);
    try {
      const res = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryId: parseInt(id as string) }),
      });
      if (res.ok) {
        const data = await res.json();
        const next = Boolean(data?.favorited);
        setFavorited(next);
        appToast.success(next ? 'Ajouté aux favoris.' : 'Retiré des favoris.');
      } else {
        const err = await res.json().catch(() => ({}));
        appToast.error(
          typeof err?.error === 'string' ? err.error : 'Impossible de mettre à jour les favoris.',
        );
      }
    } catch {
      appToast.error('Erreur réseau — favoris non enregistrés.');
    } finally {
      setFavLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryId: parseInt(id as string),
          content: comment,
        }),
      });

      if (res.ok) {
        setComment('');
        setMessage('Merci ! Votre commentaire est en attente de modération.');
        appToast.success('Commentaire envoyé — modération en cours.');
        setTimeout(() => setMessage(''), 5000);
      } else {
        const err = await res.json().catch(() => ({}));
        appToast.error(typeof err?.error === 'string' ? err.error : 'Envoi du commentaire refusé.');
      }
    } catch (error) {
      console.error(error);
      appToast.error('Erreur réseau — commentaire non envoyé.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );

  if (!country || isCountryLoadError(country)) {
    return (
      <div className="p-20 text-center font-bold text-muted">
        {country && isCountryLoadError(country) ? `Erreur: ${country.error}` : 'Pays non trouvé.'}
      </div>
    );
  }

  const full = country.full_data as Record<string, unknown>;
  const agentBlock = full._agent as Record<string, unknown> | undefined;
  const agentUpdatedAt = typeof agentBlock?.updatedAt === 'string' ? agentBlock.updatedAt : null;
  const moroccoPack = full.morocco_research_pack as MoroccoResearchPack | undefined;
  const appointmentAudit = full.appointment_audit as Record<string, unknown> | undefined;
  const visaSystem = full.visa_system as Record<string, unknown> | undefined;
  const visaTourism = visaSystem?.tourism as Record<string, unknown> | undefined;
  const visaWork = visaSystem?.work as Record<string, unknown> | undefined;
  const experienceContent = buildCountryExperienceContent(country.name, full);
  const hasPhdStored = hasCountryPhdStoredData(full as Record<string, unknown>);
  const showPhdSurfaces = hasPhdStored && isPhdPerspectiveRelevant(perspectiveContract);
  const phdModel = showPhdSurfaces
    ? buildPhdStudies(country.name, full as Record<string, unknown>)
    : null;
  const row = materializeCountryApiRow(country);
  const enriched = enrichCountryApiRecord(row);
  const tourismScore = enriched._visa.tourism;
  const studyScore = enriched._visa.study;
  const workScore = enriched._visa.work;
  const businessScore = enriched._visa.business;
  const frictionScore = enriched._friction;
  const finalScore = enriched._finalScore;
  const drivingIntel = materializeDrivingRightsIntel(full as Record<string, unknown>);
  const dbInsightRows = filterPublicCountryInsights(country.insights);

  const economyBlock = full.economy as Record<string, unknown> | undefined;
  const healthBlock = full.health as Record<string, unknown> | undefined;
  const workBlock = full.work as Record<string, unknown> | undefined;
  const demographics = full.demographics as Record<string, unknown> | undefined;
  const intelMeta = full._intelligence as Record<string, unknown> | undefined;
  const popWb = readFiniteNumber(economyBlock?.population_wb);
  const gdpUsd = readFiniteNumber(economyBlock?.gdp_usd);
  const gdpCap = readFiniteNumber(economyBlock?.gdp_per_capita_usd);
  const gdpWbUnavailable = economyBlock?.gdp_wb_series_unavailable === true;
  const gdpCoverageNoteFr =
    typeof economyBlock?.gdp_coverage_note_fr === 'string'
      ? economyBlock.gdp_coverage_note_fr.trim()
      : '';
  const lifeExp = readFiniteNumber(healthBlock?.life_expectancy_years);
  const unempPct = readFiniteNumber(workBlock?.unemployment_rate_pct);
  const urbanPopPct = readFiniteNumber(demographics?.urban_population_wb_pct);
  const hasWbIndicators = [popWb, gdpUsd, gdpCap, lifeExp, unempPct, urbanPopPct].some(
    (v) => v != null,
  );
  const showWbBlock = hasWbIndicators || gdpWbUnavailable;
  const intelLatest = latestMaterializedIsoFromIntelMeta(intelMeta);
  const economyIntelFresh = isEconomyIntelFresh(intelLatest);
  const officialLinks = officialSourcesForCountry(country.name, String(country.region ?? ''));
  const countryPageId = String(Array.isArray(id) ? (id[0] ?? '') : (id ?? ''));
  const dataQualityAnomalies = parseDataQualityAnomaliesPayload(country.dataQualityAnomalies);
  const observationConfidenceAggregate = parseObservationConfidenceAggregatePayload(
    country.observationConfidenceAggregate,
  );

  const fullRecord = full as Record<string, unknown>;
  const disputedIntelPaths = disputedFieldPathsFromFull(fullRecord);
  const semanticStripItems = [
    ...buildCountryIntelligenceSemanticItems(fullRecord),
    {
      path: 'friction_score',
      value: frictionScore,
      meta: { label: 'Friction administrative' },
    },
  ];

  const iso2 = iso2ForCountryNameOrEmpty(country.name);
  const isSchengen = isSchengenMember(String(country.name ?? ''));
  const strapline = orientationStraplineForPerspective(perspectiveContract, {
    tourism: tourismScore,
    study: studyScore,
    work: workScore,
  });

  const visaScoreBars: { focus: CountryScoreFocus; label: string; value: number }[] = [
    { focus: 'tourism', label: 'Visa tourisme', value: tourismScore },
    { focus: 'study', label: 'Visa études', value: studyScore },
    { focus: 'work', label: 'Visa travail', value: workScore },
    { focus: 'business', label: 'Visa affaires', value: businessScore },
  ];
  const primaryVisaBars = visaScoreBars.filter(
    (b) => countryScoreVisible(b.focus, perspectiveContract) === 'primary',
  );
  const secondaryVisaBars = visaScoreBars.filter(
    (b) => countryScoreVisible(b.focus, perspectiveContract) === 'secondary',
  );
  const accessPct = brutalRealityToPercent(full.brutal_reality_score);
  const acceptancePct = acceptanceToPercent(full.acceptance_rate_morocco);
  const frictionPct = clampPercent(full.friction_score);
  const confidencePct = clampPercent(full.confidence_score);
  const tourismDifficulty =
    (typeof visaTourism?.difficulty === 'string' && (visaTourism.difficulty as string).trim()) ||
    '—';
  const workAvailability =
    (typeof visaWork?.availability === 'string' && (visaWork.availability as string).trim()) ||
    'Limitée';
  const isStrictTourism = /(strict|élev|high|difficile|difficult)/i.test(tourismDifficulty);
  const isStructuredWork = /(structur|limit|moder|modér|moy)/i.test(workAvailability);
  const isTourismPrimary = perspectiveContract?.primaryScoreFocus === 'tourism';
  const tourismCompact = isTourismPrimary && !showTourismExtendedFiche;
  const tourismProcessHint =
    typeof visaTourism?.process === 'string' && visaTourism.process.trim()
      ? visaTourism.process.trim()
      : null;
  const tourismCostHint =
    typeof visaTourism?.cost === 'string' && visaTourism.cost.trim() ? visaTourism.cost.trim() : null;

  return (
    <>
      <div className="min-h-screen bg-[#FDFBF4] print:hidden">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <ObjectiveAwareExplorerLink
            className={cn(
              'mb-5 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-[#0D1B3E]/65 hover:text-[#0D1B3E]',
              NEXUS_TRANSITION,
              NEXUS_FOCUS_VISIBLE,
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Retour à l&apos;explorateur
          </ObjectiveAwareExplorerLink>

          <MoroccoFirstDisclaimer className="mb-6" />

          {perspectiveContract ? (
            <CountryPerspectiveSummaryStrip
              contract={perspectiveContract}
              countryName={country.name}
              primarySlug={preference.primarySlug}
              tourismScore={tourismScore}
              tourismDifficulty={tourismDifficulty}
              isSchengen={isSchengen}
              isGuest={isGuest}
              processHint={tourismProcessHint}
              costHint={tourismCostHint}
            />
          ) : null}

          {!tourismCompact ? (
          <section
            aria-label="Hub intelligence"
            className="relative mb-6 overflow-hidden rounded-2xl border border-[#0D1B3E]/10 bg-white pl-1.5 pr-5 py-5 shadow-sm sm:py-6"
          >
            <span
              aria-hidden
              className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-[#0D1B3E]"
            />
            <div className="flex flex-col gap-4 pl-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0D1B3E]/55">
                  Hub intelligence
                </p>
                <h2 className="mt-1 font-serif text-xl font-black leading-tight tracking-tight text-[#0D1B3E] sm:text-2xl">
                  {country.name} — {strapline}
                </h2>
              </div>
              <div className="flex flex-wrap items-start gap-5 sm:items-center">
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                    VisaFlow Score
                  </p>
                  <p
                    className={`mt-0.5 font-serif text-2xl font-black leading-none ${scoreToneStitch(finalScore)}`}
                  >
                    {finalScore}
                    <span className="text-base font-medium text-[#0D1B3E]/55">/100</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                    Status
                  </p>
                  <p className="mt-0.5 font-serif text-sm font-black text-[#0D1B3E]">
                    {isSchengen ? 'Schengen' : 'Non-Schengen'}
                  </p>
                </div>
                <CountryIntelligenceCoverageBadge full={fullRecord} />
                {economyIntelFresh && intelLatest ? (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700"
                    title={`Dernière matérialisation : ${formatIntelDateShortFr(intelLatest)}`}
                  >
                    <Clock className="h-3 w-3 shrink-0" aria-hidden /> Fresh
                  </span>
                ) : null}
                <DataFreshnessStrap
                  agentUpdatedAt={agentUpdatedAt}
                  className="max-w-[220px] justify-end text-right normal-case"
                />
                <button
                  type="button"
                  onClick={() => window.print()}
                  aria-label="Imprimer / PDF"
                  className={cn(
                    'inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#0D1B3E]/15 bg-white text-[#0D1B3E] hover:bg-[#FDFBF4]',
                    NEXUS_TRANSITION,
                    NEXUS_FOCUS_VISIBLE,
                  )}
                >
                  <Printer className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          </section>
          ) : null}

          <section className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {iso2 ? (
                <CountryFlag
                  iso2={iso2}
                  className="h-8 w-12 shrink-0 rounded-sm border border-[#0D1B3E]/10"
                />
              ) : null}
              <h1 className="min-w-0 font-serif text-3xl font-black leading-tight tracking-tight text-[#0D1B3E] sm:text-4xl">
                {country.name}
              </h1>
              <span className="inline-flex items-center gap-1 text-[#0D1B3E]/55">
                <MapPin className="h-4 w-4" aria-hidden />
                <span className="font-serif text-sm">{String(country.region ?? '')}</span>
              </span>
            </div>
            {user && (
              <button
                type="button"
                onClick={toggleFavorite}
                disabled={favLoading}
                aria-label={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                className={cn(
                  'inline-flex h-10 w-10 items-center justify-center rounded-full border',
                  NEXUS_TRANSITION,
                  NEXUS_FOCUS_VISIBLE,
                  favorited
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-[#0D1B3E]/15 bg-white text-[#0D1B3E]/55 hover:text-[#0D1B3E]',
                  favLoading && 'opacity-60',
                )}
              >
                <Heart className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} aria-hidden />
              </button>
            )}
          </section>

          {tourismCompact ? (
            <div className="mb-8 rounded-2xl border border-[#0D1B3E]/12 bg-white p-5 shadow-sm sm:p-6">
              <p className="font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/75">
                Les indicateurs ci-dessus suffisent pour une première shortlist. Le détail couvre
                rendez-vous, terrain Maroc, inspirations voyage et retours communauté.
              </p>
              <button
                type="button"
                onClick={() => setShowTourismExtendedFiche(true)}
                className={cn(
                  'mt-4 inline-flex items-center justify-center rounded-xl bg-[#0D1B3E] px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0',
                  NEXUS_TRANSITION,
                  NEXUS_FOCUS_VISIBLE_ON_INK_SOLID,
                )}
              >
                Approfondir la fiche pays
              </button>
            </div>
          ) : null}

          {!tourismCompact ? (
          <>
          <MoroccoResearchPackSection countryName={country.name} pack={moroccoPack} />

          {officialLinks.length ? (
            <OfficialSourcesCard
              countryName={country.name}
              links={officialLinks}
              className="mb-8"
            />
          ) : null}

          {showExpertsMarketplaceCta ? (
            <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-emerald-200/90 bg-emerald-50/90 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex min-w-0 items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-300/80 bg-white text-emerald-900">
                  <CalendarClock className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-900/75">
                    Experts · hors tourisme
                  </p>
                  <p className="mt-1 font-serif text-base font-black text-[#0D1B3E] sm:text-lg">
                    Besoin d&apos;un créneau avec un conseiller pour {country.name} ?
                  </p>
                  <p className="mt-1 font-serif text-sm font-medium text-[#0D1B3E]/70">
                    Séances 30 ou 60 minutes, filtres par thème et tarif — paiement sécurisé pour bloquer l&apos;horaire.
                  </p>
                </div>
              </div>
              <Link
                href={`/services/consultants?interest=${encodeURIComponent(country.name)}`}
                className={cn(
                  'inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-800 px-5 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-white shadow-sm hover:bg-emerald-900',
                  NEXUS_TRANSITION,
                  NEXUS_FOCUS_VISIBLE_ON_INK_SOLID,
                )}
              >
                Réserver un expert
              </Link>
            </div>
          ) : null}

          {showPhdSurfaces && phdModel ? (
            <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-[#0D1B3E]/10 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex min-w-0 items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#0D1B3E]/15 bg-[#FDFBF4] text-[#0D1B3E]">
                  <GraduationCap className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                    Parcours doctorat
                  </p>
                  <p className="mt-1 font-serif text-base font-black text-[#0D1B3E] sm:text-lg">
                    Données structurées pour préparer un PhD à {country.name}
                  </p>
                  <p className="mt-1 font-serif text-sm font-medium text-[#0D1B3E]/65">
                    Financements, organismes, démarches et signaux utiles — contenu dédié hors de
                    cette fiche synthèse.
                  </p>
                </div>
              </div>
              <Link
                href={`/countries/${countryPageId}/doctorat`}
                className={cn(
                  'inline-flex shrink-0 items-center justify-center rounded-xl bg-[#0D1B3E] px-5 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0',
                  NEXUS_TRANSITION,
                  NEXUS_FOCUS_VISIBLE_ON_INK_SOLID,
                )}
              >
                Voir le parcours PhD
              </Link>
            </div>
          ) : null}

          <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="min-w-0 space-y-8 lg:col-span-2">
              <section className="relative overflow-hidden rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm sm:p-8">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                  Réalité terrain
                </p>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <p className="max-w-2xl font-serif text-base italic leading-relaxed text-[#0D1B3E]/85 sm:text-lg">
                    &laquo;&nbsp;{moroccoRealityText(full as Record<string, unknown>)}&nbsp;&raquo;
                  </p>
                  <div
                    aria-label="Lecture profil Maroc"
                    className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-2 border-[#0D1B3E]/25 text-[#0D1B3E]"
                  >
                    <BadgeCheck className="h-6 w-6" aria-hidden />
                    <span className="mt-1 text-center text-[8px] font-black uppercase leading-tight tracking-[0.15em]">
                      Lecture Maroc
                    </span>
                    <span className="text-[7px] font-bold uppercase tracking-[0.12em] text-[#0D1B3E]/55">
                      Indicatif
                    </span>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
                  <TerrainBar label="Access" value={accessPct} accent="emerald" />
                  <TerrainBar label="Acceptance" value={acceptancePct} accent="emerald" />
                  <TerrainBar label="Friction" value={frictionPct} accent="rose" />
                  <TerrainBar label="Confidence" value={confidencePct} accent="emerald" />
                </div>
                {observationConfidenceAggregate ? (
                  <p
                    className="mt-3 text-[10px] font-medium leading-relaxed text-[#0D1B3E]/55"
                    title={SCORE_SCALE_LEGEND_FR.pipelineObservationConfidence}
                  >
                    {formatObservationConfidenceSidebarFr(observationConfidenceAggregate)}
                  </p>
                ) : null}

                <IntelligenceDisputedFieldsAlert fieldPaths={disputedIntelPaths} />

                <CountryIntelligenceSemanticStrip items={semanticStripItems} />

                {showWbBlock ? (
                  <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {popWb != null ? (
                      <StatTile label="Population" value={fmtIntlFrInteger(popWb)} />
                    ) : null}
                    {gdpCap != null ? (
                      <StatTile label="GDP / Capita" value={fmtUsdInteger(gdpCap)} />
                    ) : null}
                    {unempPct != null ? (
                      <StatTile
                        label="Unemployment"
                        value={fmtUnemploymentLaborForcePct(unempPct)}
                      />
                    ) : null}
                  </div>
                ) : null}

                {gdpWbUnavailable && gdpCoverageNoteFr ? (
                  <p
                    className="mt-8 text-xs font-medium leading-relaxed text-[#0D1B3E]/65"
                    role="note"
                  >
                    {gdpCoverageNoteFr}
                  </p>
                ) : null}

                {intelLatest ? (
                  <p className="mt-4 text-[10px] font-medium text-[#0D1B3E]/55">
                    Dernière mise à jour des indicateurs :{' '}
                    {new Date(intelLatest).toLocaleString('fr-FR', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                ) : null}

                <IntelligenceProvenanceCollapsible
                  countryId={String(Array.isArray(id) ? (id[0] ?? '') : (id ?? ''))}
                />
                <CountryDbInsightsCollapsible rows={dbInsightRows} />

                <p className="mt-8 text-[10px] font-medium leading-relaxed text-[#0D1B3E]/55">
                  {SCORE_SCALE_LEGEND_FR.visaBarsSubtitle}
                </p>
                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {primaryVisaBars.map((b) => (
                    <ScoreBar key={b.focus} label={b.label} value={b.value} />
                  ))}
                </div>
                {secondaryVisaBars.length > 0 ? (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setShowOffPerspectiveScores((v) => !v)}
                      className="text-[10px] font-black uppercase tracking-widest text-[#0D1B3E]/60 underline-offset-2 hover:underline"
                      aria-expanded={showOffPerspectiveScores}
                    >
                      {showOffPerspectiveScores
                        ? 'Masquer les autres dimensions (hors parcours)'
                        : `Autres dimensions (hors parcours) · ${secondaryVisaBars.length}`}
                    </button>
                    {showOffPerspectiveScores ? (
                      <div className="mt-3 grid grid-cols-1 gap-4 opacity-80 md:grid-cols-2">
                        {secondaryVisaBars.map((b) => (
                          <ScoreBar key={b.focus} label={b.label} value={b.value} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <BlockFeedback blockId="country-reality" countryId={countryPageId} />
              </section>

              {dataQualityAnomalies.length > 0 ? (
                <section
                  role="status"
                  className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-800">
                      Data quality signals
                    </p>
                    <ul className="mt-2 space-y-1 font-serif text-sm font-medium leading-relaxed text-amber-900">
                      {dataQualityAnomalies.map((a) => (
                        <li key={a.code}>{a.messageFr}</li>
                      ))}
                    </ul>
                  </div>
                </section>
              ) : null}

              <DeepReportTeaser countryName={country.name} countryId={countryPageId} />

              <GoogleAd slot="country_detail_mid" />

              {isTourismPrimary ? (
                <div className="mb-2">
                  <button
                    type="button"
                    onClick={() => setShowOffPerspectiveModules((v) => !v)}
                    className="text-[10px] font-black uppercase tracking-widest text-[#0D1B3E]/60 underline-offset-2 hover:underline"
                    aria-expanded={showOffPerspectiveModules}
                  >
                    {showOffPerspectiveModules
                      ? 'Masquer les modules hors parcours'
                      : 'Modules hors parcours · 2'}
                  </button>
                </div>
              ) : null}

              {(!isTourismPrimary || showOffPerspectiveModules) && (
              <section aria-labelledby="appointment-audit-heading">
                <h2
                  id="appointment-audit-heading"
                  className="mb-4 font-serif text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl"
                >
                  Audit rendez-vous
                </h2>
                <div className="rounded-xl border border-[#0D1B3E]/10 bg-white p-5 shadow-sm sm:p-6">
                  <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div>
                      <dt className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                        Platform
                      </dt>
                      <dd className="mt-1.5 font-serif text-base font-black text-[#0D1B3E]">
                        {String(appointmentAudit?.platform ?? '—')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                        Difficulty Level
                      </dt>
                      <dd className="mt-1.5 font-serif text-base font-black text-rose-700">
                        {String(appointmentAudit?.real_difficulty ?? '—')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                        Avg. Delay
                      </dt>
                      <dd className="mt-1.5 font-serif text-base font-black text-[#0D1B3E]">
                        {String(appointmentAudit?.avg_wait_time ?? '—')}
                      </dd>
                    </div>
                  </dl>

                  {(appointmentAudit?.issues as string[] | undefined)?.length ? (
                    <div className="mt-6 border-t border-[#0D1B3E]/10 pt-5">
                      <p className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-rose-700">
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Issues signalés
                      </p>
                      <ul className="space-y-1.5">
                        {(appointmentAudit?.issues as string[] | undefined)?.map((issue, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/80"
                          >
                            <XCircle
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600"
                              aria-hidden
                            />
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <BlockFeedback blockId="country-appointment-audit" countryId={countryPageId} />
                </div>
              </section>
              )}

              {(!isTourismPrimary || showOffPerspectiveModules) && (
              <section aria-labelledby="driving-mobility-heading">
                <h2
                  id="driving-mobility-heading"
                  className="mb-4 font-serif text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl"
                >
                  Conduite et mobilité
                </h2>
                <div className="mb-4 rounded-xl border border-[#0D1B3E]/10 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#0D1B3E]/15 bg-[#FDFBF4] text-[#0D1B3E]">
                      <Car className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="font-serif text-base font-black text-[#0D1B3E]">
                        {drivingIntel.eligibility.idpRequired === true
                          ? 'International Driving Permit (IDP) Required'
                          : drivingIntel.eligibility.idpRequired === false
                            ? 'International Driving Permit (IDP) Not Required'
                            : 'International Driving Permit (IDP) — À confirmer'}
                      </p>
                      <p className="mt-1 font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/75">
                        {drivingIntel.simpleSummaryFr ||
                          'Consultez la matrice détaillée ci-dessous pour vos droits de conduite par profil de résidence.'}
                      </p>
                    </div>
                  </div>
                </div>
                <DrivingRightsIntelSection
                  countryName={country.name}
                  countryId={id as string}
                  intel={drivingIntel}
                />
              </section>
              )}

              {showPhdSurfaces && phdModel ? (
                <PhDStudiesCountryTeaser
                  countryId={String(Array.isArray(id) ? (id[0] ?? '') : (id ?? ''))}
                  countryName={country.name}
                  model={phdModel}
                />
              ) : null}

              <VisitReasonsSection
                countryName={country.name}
                reasons={experienceContent.reasons}
                countryId={id as string}
                previewOnly
              />

              <TravelerQuotesSection
                countryName={country.name}
                quotes={experienceContent.quotes}
                countryId={id as string}
                previewOnly
              />

              {/* Community Comments */}
              <section className="space-y-6">
                <h2 className="flex items-center gap-3 text-2xl font-black text-text">
                  <MessageSquare className="h-6 w-6 text-primary" /> Retours de la communauté
                </h2>

                {user ? (
                  <form
                    onSubmit={handleSubmitComment}
                    className="space-y-4 rounded-[2rem] border border-primary/25 bg-surface p-6 shadow-soft"
                  >
                    <textarea
                      className={cn(
                        'min-h-[100px] w-full rounded-2xl border border-line bg-inset p-4 font-medium text-text placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                        NEXUS_TRANSITION,
                      )}
                      placeholder="Partagez votre expérience (rendez-vous, refus, accueil…)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[10px] font-bold italic text-muted">
                        Votre avis sera publié après validation par un modérateur.
                      </p>
                      <button
                        type="submit"
                        disabled={submitting || !comment.trim()}
                        className={cn(
                          'flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-black text-white hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-50',
                          NEXUS_TRANSITION,
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                        )}
                      >
                        {submitting ? (
                          'Envoi…'
                        ) : (
                          <>
                            <Send className="h-4 w-4" /> Publier
                          </>
                        )}
                      </button>
                    </div>
                    {message && <p className="text-xs font-bold text-success">{message}</p>}
                  </form>
                ) : (
                  <div className="rounded-[2rem] border border-line bg-inset p-8 text-center">
                    <p className="font-bold text-muted">
                      Connectez-vous pour partager votre expérience.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {country.comments && country.comments.length > 0 ? (
                    country.comments.map((c: PublicCountryComment) => (
                      <div
                        key={c.id}
                        className="rounded-3xl border border-line bg-surface p-6 shadow-soft"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-xs font-black text-primary ring-1 ring-primary/35">
                              {c.user?.name?.[0] || 'U'}
                            </div>
                            <span className="text-sm font-black text-text">
                              {c.user?.name ?? '—'}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-medium leading-relaxed text-muted">{c.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <p className="font-bold italic text-muted">
                        Aucun retour pour le moment. Soyez le premier !
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <div className="sticky top-24 space-y-6 lg:top-28">
                <div
                  aria-hidden
                  className="flex h-32 items-center justify-center rounded-xl border border-[#0D1B3E]/10 bg-[#F4EFE2] text-[#0D1B3E]/40"
                >
                  <MapIcon className="h-7 w-7" aria-hidden />
                </div>

                <div className="rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                    Contexte ambassade
                  </p>
                  <h3 className="mt-1 font-serif text-lg font-black tracking-tight text-[#0D1B3E]">
                    Profil comportemental
                  </h3>
                  <p className="mt-3 font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/75">
                    {typeof full.embassy_behavior === 'string' && full.embassy_behavior.trim()
                      ? full.embassy_behavior
                      : '—'}
                  </p>

                  <dl className="mt-5 space-y-3 border-t border-[#0D1B3E]/10 pt-5">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="font-serif text-sm font-medium text-[#0D1B3E]">
                        Visa tourisme
                      </dt>
                      <dd>
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] ${
                            isStrictTourism
                              ? 'border-rose-200 bg-rose-50 text-rose-700'
                              : 'border-[#0D1B3E]/15 bg-[#FDFBF4] text-[#0D1B3E]/75'
                          }`}
                        >
                          {isStrictTourism ? 'Strict' : tourismDifficulty}
                        </span>
                      </dd>
                    </div>
                    {!isTourismPrimary ? (
                      <div className="flex items-center justify-between gap-3">
                        <dt className="font-serif text-sm font-medium text-[#0D1B3E]">
                          Permis travail / études
                        </dt>
                        <dd>
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] ${
                              isStructuredWork
                                ? 'border-[#0D1B3E]/15 bg-[#FDFBF4] text-[#0D1B3E]/75'
                                : 'border-[#0D1B3E]/15 bg-[#FDFBF4] text-[#0D1B3E]/75'
                            }`}
                          >
                            {isStructuredWork ? 'Structuré' : workAvailability}
                          </span>
                        </dd>
                      </div>
                    ) : null}
                  </dl>

                  <div className="mt-5 rounded-xl border border-[#0D1B3E]/10 bg-[#FDFBF4] p-4">
                    <p className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65">
                      <CheckCircle2 className="h-3 w-3" aria-hidden /> Darija Tip
                    </p>
                    <p className="font-serif text-sm font-medium italic leading-relaxed text-[#0D1B3E]">
                      &laquo;&nbsp;{moroccoProTipText(full as Record<string, unknown>)}&nbsp;&raquo;
                    </p>
                  </div>
                  <BlockFeedback
                    blockId="country-darija-tip"
                    countryId={countryPageId}
                    className="!mt-3 !border-t-0 !pt-3"
                  />
                </div>

                {isTourismPrimary ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowOffPerspectiveModules((v) => !v)}
                      className="mb-3 text-[10px] font-black uppercase tracking-widest text-[#0D1B3E]/60 underline-offset-2 hover:underline"
                      aria-expanded={showOffPerspectiveModules}
                    >
                      {showOffPerspectiveModules
                        ? 'Masquer autres parcours'
                        : 'Autres parcours (permis, délais)'}
                    </button>
                    {showOffPerspectiveModules ? (
                      <div className="space-y-6">
                        <div className="rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm">
                          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                            Permis travail / études
                          </p>
                          <p className="font-serif text-sm font-medium text-[#0D1B3E]/75">
                            {isStructuredWork ? 'Structuré' : workAvailability}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm">
                          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                            Délais et friction
                          </p>
                          <div className="space-y-4">
                            <ProcessingMetricBar
                              label="Vitesse de traitement"
                              value={100 - frictionScore}
                              rightLabel={
                                frictionScore >= 55
                                  ? 'Lent'
                                  : frictionScore >= 35
                                    ? 'Modéré'
                                    : 'Rapide'
                              }
                              inverted
                            />
                            <ProcessingMetricBar
                              label="Friction administrative"
                              value={frictionScore}
                              rightLabel={
                                frictionScore >= 55
                                  ? 'Élevée'
                                  : frictionScore >= 35
                                    ? 'Modérée'
                                    : 'Faible'
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm">
                    <p className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                      Délais et friction
                    </p>
                    <div className="space-y-4">
                      <ProcessingMetricBar
                        label="Vitesse de traitement"
                        value={100 - frictionScore}
                        rightLabel={
                          frictionScore >= 55 ? 'Lent' : frictionScore >= 35 ? 'Modéré' : 'Rapide'
                        }
                        inverted
                      />
                      <ProcessingMetricBar
                        label="Friction administrative"
                        value={frictionScore}
                        rightLabel={
                          frictionScore >= 55 ? 'Élevée' : frictionScore >= 35 ? 'Modérée' : 'Faible'
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-[#0D1B3E]/10 bg-white p-4 shadow-sm">
                  <GoogleAd slot="country_detail_sidebar" />
                </div>
              </div>
            </aside>
          </div>
          </>
          ) : null}
        </div>
      </div>

      <div
        className="hidden bg-white px-8 py-10 text-[14px] leading-relaxed text-gray-900 print:block"
        aria-hidden
      >
        <header className="mb-6 border-b border-gray-300 pb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            VisaFlow — résumé fiche pays
          </p>
          <h1 className="mt-2 text-2xl font-black text-gray-900">{country.name}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {String(country.region ?? '')}
            {isSchengenMember(String(country.name ?? '')) ? ' · Schengen' : ''} —{' '}
            {new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' })}
          </p>
        </header>

        {intelLatest ? (
          <p className="mb-4 text-[11px] text-gray-600">
            Données économie (dernière matérialisation) :{' '}
            {new Date(intelLatest).toLocaleDateString('fr-FR', { dateStyle: 'medium' })}
          </p>
        ) : null}

        {dataQualityAnomalies.length > 0 ? (
          <section className="mb-5">
            <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-gray-800">
              Signaux qualité données
            </h2>
            <ul className="list-inside list-disc space-y-1 text-sm text-gray-800">
              {dataQualityAnomalies.map((a) => (
                <li key={a.code}>{a.messageFr}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mb-5">
          <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-gray-800">
            Scores indicatifs
          </h2>
          <p className="mb-3 text-[10px] leading-snug text-gray-600">
            {SCORE_SCALE_LEGEND_FR.printTableSubtitle}
          </p>
          <table className="w-full max-w-lg text-left text-sm">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-1.5 pr-4 font-medium text-gray-700">Score final</td>
                <td className="py-1.5 font-bold">{finalScore}</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4 font-medium text-gray-700">Visa tourisme</td>
                <td className="py-1.5">{tourismScore}</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4 font-medium text-gray-700">Visa études</td>
                <td className="py-1.5">{studyScore}</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4 font-medium text-gray-700">Visa travail</td>
                <td className="py-1.5">{workScore}</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4 font-medium text-gray-700">Visa affaires</td>
                <td className="py-1.5">{businessScore}</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4 font-medium text-gray-700">Friction (lecture)</td>
                <td className="py-1.5">{frictionScore}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="mb-5">
          <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-gray-800">
            Indicateurs terrain (extraits)
          </h2>
          <p className="mb-2 text-[10px] leading-snug text-gray-600">
            {SCORE_SCALE_LEGEND_FR.terrainTilesCaption}
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-gray-800">
            <li>Score réalité : {fmtBrutalReality(full.brutal_reality_score)}</li>
            <li>Acceptation (indicateur) : {fmtAcceptanceRate(full.acceptance_rate_morocco)}</li>
            <li>Friction RDV : {fmtFrictionBlock(full.friction_score)}</li>
            <li>Confiance données (fiche) : {fmtConfidencePct(full.confidence_score)}</li>
            {observationConfidenceAggregate ? (
              <li>{formatObservationConfidencePrintFr(observationConfidenceAggregate)}</li>
            ) : null}
          </ul>
        </section>

        <section className="mb-5">
          <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-gray-800">
            Signaux (synthèse moteur)
          </h2>
          <p className="text-sm text-gray-800">
            {formatCountrySheetSignalsSummary(
              buildCountrySheetSignals(full as Record<string, unknown>),
            ) ?? '—'}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-gray-800">
            Réalité terrain (citation)
          </h2>
          <p className="text-sm italic text-gray-800">
            &quot;{moroccoRealityText(full as Record<string, unknown>)}&quot;
          </p>
        </section>

        <footer className="border-t border-gray-200 pt-4 text-[10px] leading-snug text-gray-600">
          <p>
            Document informatif généré depuis VisaFlow. Les scores, signaux et textes ne constituent
            pas un conseil juridique ni une garantie d&apos;obtention de visa ou de titre de séjour.
            Vérifiez systématiquement auprès des autorités consulaires et du droit applicable.
          </p>
        </footer>
      </div>
    </>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
        <span>{label}</span>
        <span className="text-[#0D1B3E]">{Number.isInteger(value) ? value : value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#0D1B3E]/10">
        <div className={`h-full ${barTone(value)}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function TerrainBar({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: 'emerald' | 'rose';
}) {
  const fill = accent === 'rose' ? 'bg-rose-600' : 'bg-emerald-600';
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
        <span>{label}</span>
        <span className="text-[#0D1B3E]">{value}%</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-[#0D1B3E]/10">
        <div className={`h-full ${fill}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#0D1B3E]/10 bg-[#FDFBF4] px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
        {label}
      </p>
      <p className="mt-1 font-serif text-lg font-black text-[#0D1B3E]">{value}</p>
    </div>
  );
}

function ProcessingMetricBar({
  label,
  value,
  rightLabel,
  inverted = false,
}: {
  label: string;
  value: number;
  rightLabel: string;
  inverted?: boolean;
}) {
  const ratio = Math.max(0, Math.min(100, value));
  const isWarn = inverted ? value <= 45 : value >= 55;
  const fill = isWarn ? 'bg-rose-600' : 'bg-emerald-600';
  const tone = isWarn ? 'text-rose-700' : 'text-emerald-700';
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
        <span>{label}</span>
        <span className={tone}>{rightLabel}</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-[#0D1B3E]/10">
        <div className={`h-full ${fill}`} style={{ width: `${ratio}%` }} />
      </div>
    </div>
  );
}
