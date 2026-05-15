'use client';

import {
  ArrowRight,
  BookOpen,
  Coins,
  FileText,
  GraduationCap,
  Languages,
  Microscope,
  Search,
  Timer,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import GoogleAd from '@/components/GoogleAd';
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider';
import {
  normalizeCountriesApiListResponse,
  type CountryApiListRow,
} from '@/lib/country-full-data-materialize';
import { hasCountryPhdStoredData } from '@/lib/country-phd-studies';
import { educationHubExplorerHref } from '@/lib/cta-hrefs';
import { isPhdPerspectiveRelevant } from '@/lib/user-objectives/perspective-nav';
import { getObjectiveBySlug } from '@/lib/user-objectives/registry';
import { cn } from '@/lib/utils';

const shellClass =
  'min-h-screen bg-[#FDFBF4] bg-[linear-gradient(rgba(13,27,62,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(13,27,62,0.035)_1px,transparent_1px)] bg-[length:22px_22px]';

type EducationCategory = 'languages' | 'technical' | 'short';

const EDUCATION_MOBILITY_TAB_KEY: Record<EducationCategory, string> = {
  languages: 'language_study',
  technical: 'technical_training',
  short: 'short_courses',
};

function eduText(v: unknown, fallback: string) {
  if (v == null) return fallback;
  const s = typeof v === 'string' || typeof v === 'number' ? String(v) : '';
  return s.trim() ? s : fallback;
}

function accessPillLabel(access: string): string {
  const a = access.toLowerCase();
  if (a.includes('facile')) return 'Accès facile';
  if (a.includes('difficile')) return 'Accès sélectif';
  return 'Accès moyen';
}

function accessPillClass(access: string): string {
  const a = access.toLowerCase();
  if (a.includes('facile')) return 'border-emerald-200/80 bg-emerald-50/95 text-emerald-950';
  if (a.includes('difficile')) return 'border-amber-200/80 bg-amber-50/95 text-amber-950';
  return 'border-sky-200/80 bg-sky-50/95 text-sky-950';
}

export default function EducationPage() {
  const { preference } = useObjectivePreference();
  const primaryDef = useMemo(() => getObjectiveBySlug(preference.primarySlug), [preference.primarySlug]);
  const showPhdPerspective = isPhdPerspectiveRelevant(primaryDef);
  const hubExplorerHref = useMemo(
    () => educationHubExplorerHref(preference.primarySlug),
    [preference.primarySlug],
  );
  const [countries, setCountries] = useState<CountryApiListRow[]>([]);
  const [activeTab, setActiveTab] = useState<EducationCategory>('languages');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => setCountries(normalizeCountriesApiListResponse(data)))
      .catch(() => setCountries([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredCountries = useMemo(
    () => countries.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [countries, search],
  );

  const tabs = [
    { id: 'languages' as const, label: 'Destinations académiques' },
    { id: 'technical' as const, label: 'Parcours techniques' },
    { id: 'short' as const, label: 'Programmes courts' },
  ];

  const getEducationData = (country: CountryApiListRow, type: EducationCategory) => {
    const full = country.full_data;
    const edu = full.education_mobility as Record<string, unknown> | undefined;
    const block = edu?.[EDUCATION_MOBILITY_TAB_KEY[type]];

    if (!block || typeof block !== 'object') {
      return {
        access: 'Moyen',
        bac_required: "Dépend de l'école",
        cost: 'Variable',
        visa: "Permis d'études / visiteur",
        insight: 'Données en cours de collecte pour ce pays.',
        summary: '',
      };
    }
    const b = block as Record<string, unknown>;
    const insight = eduText(b.insight, 'Données en cours de collecte pour ce pays.');
    const summary =
      typeof b.summary === 'string' && b.summary.trim()
        ? b.summary.trim()
        : insight.length > 140
          ? `${insight.slice(0, 137)}…`
          : insight || "Parcours éducatif à préciser sur la fiche pays et avec l'établissement cible.";
    return { ...b, insight, summary } as Record<string, unknown>;
  };

  return (
    <div className={shellClass}>
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        <section
          className={cn(
            'mb-14 grid gap-10 lg:mb-16 lg:items-stretch lg:gap-12',
            showPhdPerspective ? 'lg:grid-cols-2' : 'lg:grid-cols-1',
          )}
        >
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/65">Campus</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0D1B3E] sm:text-4xl md:text-[2.75rem]">
              Hub éducation & formation
            </h1>
            <p className="mt-5 max-w-xl font-serif text-base font-medium leading-relaxed text-[#0D1B3E]/82 sm:text-lg">
              Analysez les prérequis académiques, ordres de grandeur budgétaires et options de visa études pour construire
              un parcours crédible avant toute candidature.
            </p>
            <div className="relative mt-10 border-b border-[#0D1B3E]/18 pb-2">
              <Search
                className="pointer-events-none absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-[#0D1B3E]/35"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Rechercher une destination, un diplôme…"
                className="w-full border-0 border-none bg-transparent py-2 pl-9 pr-2 text-sm font-medium text-[#0D1B3E] outline-none ring-0 placeholder:text-[#0D1B3E]/40 focus:ring-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Filtrer les destinations"
              />
            </div>
          </div>

          {showPhdPerspective ? (
          <Link
            href={hubExplorerHref}
            className="group flex min-h-[280px] flex-col justify-between rounded-3xl bg-[#0D1B3E] p-8 text-white shadow-xl transition-transform hover:-translate-y-0.5 sm:p-10"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="rounded-md border border-white/25 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/90">
                Recherche avancée
              </span>
              <GraduationCap className="h-10 w-10 shrink-0 text-white/90" aria-hidden />
            </div>
            <div className="mt-8">
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Doctorat / PhD</h2>
              <p className="mt-4 text-sm font-medium leading-relaxed text-white/85">
                Financement, encadrement recherche et visa long séjour : priorisez les destinations où le dataset
                doctoral est documenté, puis affinez sur la fiche pays.
              </p>
            </div>
            <span className="mt-8 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-white">
              Explorer le programme
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
          ) : null}
        </section>

        <section className="mb-14 grid gap-5 sm:grid-cols-3 sm:gap-6">
          <Link
            href="/education/language-study"
            className="flex h-full flex-col rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-7"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#0D1B3E]/12 text-[#0D1B3E]">
              <Languages className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="mt-5 font-serif text-xl font-bold text-[#0D1B3E]">Apprendre une langue</h3>
            <p className="mt-3 font-serif text-sm leading-relaxed text-[#0D1B3E]/75">
              Immersion, certifications IELTS / TOEFL et séjours courts ou année académique structurée.
            </p>
          </Link>
          <Link
            href="/education/technical-training"
            className="flex h-full flex-col rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-7"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#0D1B3E]/12 text-[#0D1B3E]">
              <Wrench className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="mt-5 font-serif text-xl font-bold text-[#0D1B3E]">Formation technique</h3>
            <p className="mt-3 font-serif text-sm leading-relaxed text-[#0D1B3E]/75">
              Diplômes professionnels, centres accrédités et perspectives d&apos;emploi sur le territoire d&apos;accueil.
            </p>
          </Link>
          <Link
            href="/education/short-courses"
            className="flex h-full flex-col rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-7"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#0D1B3E]/12 text-[#0D1B3E]">
              <Timer className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="mt-5 font-serif text-xl font-bold text-[#0D1B3E]">Formations courtes</h3>
            <p className="mt-3 font-serif text-sm leading-relaxed text-[#0D1B3E]/75">
              Certificats, bootcamps, stages et mobilités d&apos;échange encadrées sur des durées limitées.
            </p>
          </Link>
        </section>

        <div
          className="mb-8 rounded-3xl border border-[#0D1B3E]/08 bg-[#faf8f3] p-6 sm:p-8"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 26px,
              rgba(13, 27, 62, 0.045) 27px
            )`,
          }}
        >
          <div className="mb-8 flex flex-wrap gap-6 border-b border-[#0D1B3E]/12 sm:gap-10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  '-mb-px pb-3.5 text-left text-[10px] font-black uppercase tracking-[0.2em] transition-colors sm:text-[11px]',
                  activeTab === tab.id
                    ? 'border-b-2 border-[#0D1B3E] text-[#0D1B3E]'
                    : 'border-b-2 border-transparent text-[#0D1B3E]/45 hover:text-[#0D1B3E]/70',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <GoogleAd slot="education_top" />

          {loading ? (
            <div className="flex justify-center py-16">
              <div
                className="h-12 w-12 animate-spin rounded-full border-2 border-[#0D1B3E]/15 border-t-[#0D1B3E]"
                aria-hidden
              />
            </div>
          ) : filteredCountries.length === 0 ? (
            <p className="py-12 text-center font-medium text-[#0D1B3E]/65">
              Aucune destination ne correspond à votre recherche.
            </p>
          ) : (
            <div className="grid auto-rows-fr grid-cols-1 gap-8 pt-2 md:grid-cols-2 lg:grid-cols-3">
              {filteredCountries.map((c) => {
                const data = getEducationData(c, activeTab);
                const accessRaw = eduText(data.access, 'Moyen');
                const accessLabel = accessPillLabel(accessRaw);
                const hasPhd = hasCountryPhdStoredData((c.full_data ?? {}) as Record<string, unknown>);
                const summary = eduText(data.summary, '');
                const insight = eduText(data.insight, '');

                return (
                  <article
                    key={String(c.id)}
                    className="group flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#0D1B3E]/10 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative h-36 bg-[#e4e2de]">
                      <span
                        className={cn(
                          'absolute left-4 top-4 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider',
                          accessPillClass(accessRaw),
                        )}
                      >
                        <span aria-hidden>• </span>
                        {accessLabel}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-6 sm:p-7">
                      <h3 className="text-xl font-black tracking-tight text-[#0D1B3E] sm:text-2xl">{c.name}</h3>
                      <p className="mt-2 font-serif text-sm leading-relaxed text-[#0D1B3E]/75">{summary}</p>

                      <dl className="mt-6 grid grid-cols-2 gap-3 text-left">
                        <div className="rounded-xl border border-[#0D1B3E]/08 bg-[#FDFBF4] p-3">
                          <dt className="text-[9px] font-black uppercase tracking-[0.14em] text-[#0D1B3E]/45">
                            Prérequis
                          </dt>
                          <dd className="mt-1.5 flex items-start gap-2 text-xs font-bold leading-snug text-[#0D1B3E]">
                            <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0D1B3E]/40" aria-hidden />
                            <span className="min-w-0">{eduText(data.bac_required, "Dépend de l'école")}</span>
                          </dd>
                        </div>
                        <div className="rounded-xl border border-[#0D1B3E]/08 bg-[#FDFBF4] p-3">
                          <dt className="text-[9px] font-black uppercase tracking-[0.14em] text-[#0D1B3E]/45">
                            Coût estimé
                          </dt>
                          <dd className="mt-1.5 flex items-start gap-2 text-xs font-bold leading-snug text-[#0D1B3E]">
                            <Coins className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0D1B3E]/40" aria-hidden />
                            <span className="min-w-0">{eduText(data.cost, 'Variable')}</span>
                          </dd>
                        </div>
                        <div className="col-span-2 rounded-xl border border-[#0D1B3E]/08 bg-[#FDFBF4] p-3">
                          <dt className="text-[9px] font-black uppercase tracking-[0.14em] text-[#0D1B3E]/45">
                            Visa principal
                          </dt>
                          <dd className="mt-1.5 flex items-start gap-2 text-xs font-bold leading-snug text-[#0D1B3E]">
                            <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0D1B3E]/40" aria-hidden />
                            <span className="min-w-0">{eduText(data.visa, "Permis d'études")}</span>
                          </dd>
                        </div>
                      </dl>

                      {insight ? (
                        <p className="mt-5 max-h-28 overflow-y-auto font-serif text-sm italic leading-relaxed text-[#0D1B3E]/72">
                          {insight}
                        </p>
                      ) : null}

                      <div className="mt-auto flex flex-col gap-2 pt-6">
                        <Link
                          href={`/countries/${c.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0D1B3E]/12 bg-[#f0eeeb] py-3 text-center text-[11px] font-black uppercase tracking-[0.18em] text-[#0D1B3E] transition-colors hover:border-[#0D1B3E]/25 hover:bg-[#e8e4df]"
                        >
                          Voir la fiche pays
                          <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                        {hasPhd && showPhdPerspective ? (
                          <Link
                            href={`/countries/${c.id}/doctorat`}
                            className="inline-flex items-center justify-center gap-2 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#0D1B3E] underline decoration-[#0D1B3E]/25 underline-offset-4 hover:decoration-[#0D1B3E]"
                          >
                            <GraduationCap className="h-4 w-4 shrink-0" aria-hidden />
                            Parcours doctoral
                            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <p className="mt-10 flex flex-wrap items-center justify-center gap-2 text-center text-xs font-medium text-[#0D1B3E]/45">
          <Microscope className="h-4 w-4 shrink-0" aria-hidden />
          Données indicatives — croiser avec les exigences officielles des établissements et consulats.
        </p>
      </div>
    </div>
  );
}
