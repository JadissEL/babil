'use client';

import {
  ArrowRight,
  Briefcase,
  Building2,
  Coins,
  Search,
  ShieldCheck,
  Store,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import GoogleAd from '@/components/GoogleAd';
import { PerspectiveHubPageGate } from '@/components/objectives/PerspectiveHubGate';
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider';
import {
  normalizeCountriesApiListResponse,
  type CountryApiListRow,
} from '@/lib/country-full-data-materialize';
import { businessHubExplorerHref } from '@/lib/cta-hrefs';
import { enrichCountryApiRecord } from '@/lib/enrich-country-api';

const shellClass =
  'min-h-screen bg-[#FDFBF4] bg-[linear-gradient(rgba(13,27,62,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(13,27,62,0.035)_1px,transparent_1px)] bg-[length:22px_22px]';

const PARCOURS = [
  {
    step: '01',
    title: 'Évaluation',
    body: "Analyse comparative des indices d'affaires, climat fiscal et stabilité réglementaire.",
  },
  {
    step: '02',
    title: 'Structure',
    body: 'Définition du véhicule légal optimal, protection des actifs et structuration du capital.',
  },
  {
    step: '03',
    title: 'Capital & mobilité',
    body: "Déploiement du capital, visa affaires ou investisseur et mise en conformité des flux transfrontaliers.",
  },
] as const;

export default function BusinessPage() {
  const { preference } = useObjectivePreference();
  const hubExplorerHref = useMemo(
    () => businessHubExplorerHref(preference.primarySlug),
    [preference.primarySlug],
  );
  const [countries, setCountries] = useState<CountryApiListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => setCountries(normalizeCountriesApiListResponse(data)))
      .catch(() => setCountries([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => countries.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [countries, search],
  );

  return (
    <PerspectiveHubPageGate hubPath="/business">
    <div className={shellClass}>
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        <section className="relative mb-14 overflow-hidden rounded-3xl border border-[#0D1B3E]/8 bg-[#FDFBF4] shadow-sm sm:mb-16 sm:rounded-[2rem]">
          <div className="absolute inset-0">
            <Image
              src="/images/forge-business-hero.png"
              alt=""
              fill
              className="object-cover object-center opacity-[0.22]"
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF4]/88 via-[#FDFBF4]/80 to-[#FDFBF4]" />
          </div>
          <div className="relative z-[1] px-6 py-14 text-center sm:px-10 sm:py-16 md:py-20">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/70">
              VisaFlow Intelligence Hub
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[#0D1B3E] sm:text-4xl md:text-5xl">
              Business & investissement
            </h1>
            <p className="mx-auto mt-5 max-w-2xl font-serif text-base font-medium leading-relaxed text-[#0D1B3E]/82 sm:text-lg">
              Stratégies de structuration, analyse de juridictions et opportunités de mobilité économique pour
              entrepreneurs et investisseurs exigeants.
            </p>
            <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-2xl border border-[#0D1B3E]/12 bg-white/90 p-2 shadow-sm sm:flex-row sm:items-stretch sm:rounded-full sm:p-2">
              <div className="relative flex min-h-[52px] flex-1 items-center">
                <Search className="pointer-events-none absolute left-4 h-5 w-5 text-[#0D1B3E]/40" aria-hidden />
                <input
                  type="search"
                  placeholder="Rechercher une juridiction ou un pays…"
                  className="h-full w-full rounded-xl border-0 bg-transparent py-3 pl-12 pr-4 text-sm font-medium text-[#0D1B3E] outline-none placeholder:text-[#0D1B3E]/45 sm:rounded-full sm:py-0"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Filtrer les juridictions"
                />
              </div>
              <Link
                href={hubExplorerHref}
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#0D1B3E] px-8 py-3.5 text-center text-[11px] font-black uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#0D1B3E]/90 sm:rounded-full"
              >
                Explorer
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-14 sm:mb-16">
          <h2 className="text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">Le Parcours Entrepreneur</h2>
          <p className="mt-2 max-w-2xl font-serif text-sm font-medium text-[#0D1B3E]/75 sm:text-[15px]">
            Méthodologie structurée d&apos;expansion internationale.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {PARCOURS.map((p) => (
              <div
                key={p.step}
                className="flex flex-col rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm sm:p-7"
              >
                <span className="font-mono text-xs font-bold text-[#0D1B3E]/35">{p.step}</span>
                <h3 className="mt-2 text-lg font-black text-[#0D1B3E]">{p.title}</h3>
                <p className="mt-3 font-serif text-sm leading-relaxed text-[#0D1B3E]/78">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <Link
            href={hubExplorerHref}
            className="group flex flex-col gap-6 rounded-3xl bg-[#0D1B3E] px-6 py-8 text-white shadow-lg transition-opacity hover:opacity-[0.97] sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-10"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-200/90">Outil exclusif</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Business Hub Explorer</h2>
              <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-white/85">
                Accédez à notre base consolidée comparant les environnements d&apos;affaires, les régimes d&apos;imposition
                et les cadres réglementaires — filtrée selon votre objectif lorsque le parcours est déjà orienté
                business.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-colors group-hover:bg-white/20 sm:self-center">
              Ouvrir l&apos;explorateur
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        </section>

        <GoogleAd slot="business_top" />

        <section className="mt-12">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">Juridictions privilégiées</h2>
              <p className="mt-2 max-w-xl font-serif text-sm font-medium text-[#0D1B3E]/75 sm:text-[15px]">
                Analyses détaillées par territoire de mobilité économique.
              </p>
            </div>
            <Link
              href={hubExplorerHref}
              className="shrink-0 text-[11px] font-black uppercase tracking-[0.2em] text-[#0D1B3E] underline decoration-[#0D1B3E]/25 underline-offset-4 hover:decoration-[#0D1B3E]"
            >
              Voir tout →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div
                className="h-12 w-12 animate-spin rounded-full border-2 border-[#0D1B3E]/15 border-t-[#0D1B3E]"
                aria-hidden
              />
            </div>
          ) : filtered.length === 0 ? (
            <p className="rounded-2xl border border-[#0D1B3E]/10 bg-white px-6 py-10 text-center font-medium text-[#0D1B3E]/70">
              Aucune juridiction ne correspond à votre recherche.
            </p>
          ) : (
            <div className="grid auto-rows-fr grid-cols-1 gap-8 lg:grid-cols-2">
              {filtered.map((c) => {
                const enriched = enrichCountryApiRecord(c);
                const full = c.full_data as Record<string, unknown>;
                const visaSystem = full.visa_system as Record<string, unknown> | undefined;
                const biz = (visaSystem?.business as Record<string, unknown> | undefined) ?? {};
                const street = (full.street_food as Record<string, unknown> | undefined) ?? {};
                const cbi = full.cbi_program as Record<string, unknown> | undefined;

                return (
                  <article
                    key={String(c.id)}
                    className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#0D1B3E]/10 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-4 border-b border-[#0D1B3E]/08 p-6 sm:p-8">
                      <div className="min-w-0">
                        <span className="inline-block rounded-md border border-[#dcd3c4] bg-[#ece6dc] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#0D1B3E]/75">
                          Mobilité économique
                        </span>
                        <h3 className="mt-4 break-words text-3xl font-black tracking-tight text-[#0D1B3E]">{c.name}</h3>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[#0D1B3E]/45">
                          Business index
                        </div>
                        <div className="mt-1 font-mono text-2xl font-black tabular-nums text-[#0D1B3E]">
                          {Number.isInteger(enriched._visa.business)
                            ? enriched._visa.business
                            : enriched._visa.business.toFixed(1)}
                          <span className="text-base font-black text-[#0D1B3E]/50"> / 100</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid flex-1 grid-cols-1 gap-8 p-6 sm:p-8 md:grid-cols-2">
                      <div className="space-y-5">
                        <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#0D1B3E]/50">
                          <Building2 className="h-4 w-4 text-[#0D1B3E]" aria-hidden />
                          Création d&apos;entreprise
                        </h4>
                        <dl className="space-y-3 text-sm">
                          <div>
                            <dt className="text-[10px] font-black uppercase tracking-wider text-[#0D1B3E]/45">
                              Droits d&apos;établissement
                            </dt>
                            <dd className="mt-1 font-bold text-[#0D1B3E]">{String(biz.rights ?? '—')}</dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-black uppercase tracking-wider text-[#0D1B3E]/45">
                              Mise en place
                            </dt>
                            <dd className="mt-1 font-bold text-[#0D1B3E]">{String(biz.setup ?? '—')}</dd>
                          </div>
                        </dl>
                      </div>

                      <div className="space-y-5">
                        <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#0D1B3E]/50">
                          <Store className="h-4 w-4 text-[#0D1B3E]" aria-hidden />
                          Micro-activité & food
                        </h4>
                        <div className="rounded-xl border border-[#0D1B3E]/08 bg-[#faf8f5] p-4">
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#0D1B3E]/55">
                              Opportunité
                            </span>
                            <span className="text-xs font-black text-[#0D1B3E]">{String(street.opportunity ?? 'N/D')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-[#0D1B3E]/65">
                            <Coins className="h-3.5 w-3.5 shrink-0" aria-hidden />
                            Invest. min. : {String(street.investment_min ?? 'Variable')}
                          </div>
                        </div>
                        <p className="break-words font-serif text-xs italic leading-relaxed text-[#0D1B3E]/72">
                          {String(street.barriers ?? 'Conditions locales variables selon le statut et la ville.')}
                        </p>
                      </div>
                    </div>

                    {cbi ? (
                      <div className="border-t border-[#0D1B3E]/08 px-6 pb-6 pt-2 sm:px-8">
                        <div className="rounded-xl border border-[#dcd3c4] bg-[#f5f0e8] p-5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#0D1B3E]">
                              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
                              Nationalité par investissement (CBI)
                            </h4>
                            <span className="rounded-md bg-[#0D1B3E] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                              Actif
                            </span>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-[10px] font-black uppercase tracking-wider text-[#0D1B3E]/50">
                                Investissement min.
                              </div>
                              <div className="mt-1 font-black text-[#0D1B3E]">{String(cbi.cost_min ?? '—')}</div>
                            </div>
                            <div>
                              <div className="text-[10px] font-black uppercase tracking-wider text-[#0D1B3E]/50">
                                Délai
                              </div>
                              <div className="mt-1 font-black text-[#0D1B3E]">{String(cbi.time ?? '—')}</div>
                            </div>
                          </div>
                          <p className="mt-3 text-xs font-medium leading-relaxed text-[#0D1B3E]/75">{String(cbi.type ?? '')}</p>
                          <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#0D1B3E]">
                            <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                            Résidence / statut — vérifier la fiche pays
                          </div>
                          <ArrowUpRight className="mt-2 h-4 w-4 text-[#0D1B3E]/50" aria-hidden />
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-auto border-t border-[#0D1B3E]/08 p-6 sm:px-8 sm:pb-8">
                      <Link
                        href={`/countries/${c.id}`}
                        className="flex w-full items-center justify-center rounded-xl border border-[#0D1B3E]/12 bg-[#f0eeeb] py-3.5 text-center text-[11px] font-black uppercase tracking-[0.2em] text-[#0D1B3E] transition-colors hover:border-[#0D1B3E]/25 hover:bg-[#e8e4df]"
                      >
                        Voir la fiche juridiction
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <p className="mt-12 flex items-center justify-center gap-2 text-center text-xs font-medium text-[#0D1B3E]/45">
          <Briefcase className="h-4 w-4 shrink-0" aria-hidden />
          Données issues du jeu VisaFlow — vérifier les sources officielles avant toute décision.
        </p>
      </div>
    </div>
    </PerspectiveHubPageGate>
  );
}
