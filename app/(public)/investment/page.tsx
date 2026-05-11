'use client';

import { ArrowRight, Info, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import GoogleAd from '@/components/GoogleAd';
import { ObjectiveAwareExplorerLink } from '@/components/nav/ObjectiveAwareNavLinks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  normalizeCountriesApiListResponse,
  type CountryApiListRow,
} from '@/lib/country-full-data-materialize';

const shellClass =
  'min-h-screen bg-[#FDFBF4] bg-[linear-gradient(rgba(13,27,62,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(13,27,62,0.035)_1px,transparent_1px)] bg-[length:22px_22px]';

function normalize(value: unknown) {
  return String(value ?? '').trim();
}

function toLower(value: unknown) {
  return normalize(value).toLowerCase();
}

function countryRegion(c: CountryApiListRow): string {
  const row = c as Record<string, unknown>;
  const full = c.full_data as Record<string, unknown> | undefined;
  return normalize(row.region || full?.region || full?.macro_region || '');
}

function regionCapsLabel(region: string): string {
  const r = region.toLowerCase();
  if (!r) return 'INTERNATIONAL';
  if (r.includes('carib') || r.includes('antilles') || r.includes('caraïb')) return 'CARAÏBES';
  if (r.includes('europe') || r.includes('ue') || r.includes('eu')) return 'EUROPE';
  if (r.includes('asia') || r.includes('asie')) return 'ASIE';
  if (r.includes('africa') || r.includes('afrique')) return 'AFRIQUE';
  if (r.includes('america') || r.includes('amériq')) return 'AMÉRIQUES';
  return region.toUpperCase();
}

/** Rough USD-style amount for budget buckets (indicatif — libellés source). */
function roughAmountFromCostLabel(cost: string): number | null {
  if (!cost) return null;
  const s = cost.toLowerCase();
  const compact = cost.replace(/\s/g, '');
  const m = compact.match(/(\d[\d.,]*)/);
  if (!m) return null;
  let v = parseFloat(m[1].replace(',', '.'));
  if (!Number.isFinite(v)) return null;
  if (s.includes('million') || /\bm\b/.test(s)) v *= 1_000_000;
  else if (v < 2500 && (s.includes('000') || /\bk\b/.test(s))) v *= 1000;
  return v;
}

function programBadge(program: Record<string, unknown>): { label: string; variant: 'cbi' | 'exclusive' | 'golden' } {
  const t = toLower(program.type);
  const n = toLower(program.name);
  const cat = toLower(program.category);
  if (t.includes('golden') || n.includes('golden') || cat.includes('golden') || t.includes('résidence') || t.includes('residence')) {
    return { label: 'GOLDEN VISA', variant: 'golden' };
  }
  if (program.exclusive === true || t.includes('exclusive')) {
    return { label: 'CBI EXCLUSIF', variant: 'exclusive' };
  }
  return { label: 'CBI', variant: 'cbi' };
}

function formatBenefits(program: Record<string, unknown>): string {
  const b = program.benefits;
  if (typeof b === 'string' && b.trim()) return b;
  if (Array.isArray(b)) return b.map(String).filter(Boolean).join(' · ');
  const desc = normalize(program.description || program.summary);
  if (desc) return desc;
  return "Citoyenneté ou statut résident selon programme — conditions d'éligibilité, fonds traçables et délais à valider avec un conseiller agréé.";
}

type InvestmentProgramRow = {
  country: CountryApiListRow;
  program: Record<string, unknown>;
  cost: string;
  processing: string;
  statusLine: string;
  benefits: string;
};

export default function InvestmentPage() {
  const [countries, setCountries] = useState<CountryApiListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [budgetFilter, setBudgetFilter] = useState<'all' | 'lt250' | '250500' | 'gt500'>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => setCountries(normalizeCountriesApiListResponse(data)))
      .catch(() => setCountries([]))
      .finally(() => setLoading(false));
  }, []);

  const programs = useMemo((): InvestmentProgramRow[] => {
    const out: InvestmentProgramRow[] = [];
    for (const c of countries) {
      const full = c.full_data;
      const p = full.cbi_program;
      if (!p || typeof p !== 'object' || Array.isArray(p)) continue;
      const program = p as Record<string, unknown>;
      const cost = normalize(program.cost || program.investment_min || program.minimum_investment);
      const processing = normalize(program.processing_time || program.timeline);
      const statusLine = normalize(program.status || program.residence_type || program.program_type);
      out.push({
        country: c,
        program,
        cost,
        processing,
        statusLine,
        benefits: formatBenefits(program),
      });
    }
    return out;
  }, [countries]);

  const regionOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of programs) {
      const r = countryRegion(p.country);
      if (r) set.add(r);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [programs]);

  const filtered = useMemo(() => {
    return programs.filter((p) => {
      const name = toLower(p.country.name);
      const q = toLower(search);
      if (q && !name.includes(q)) return false;

      if (regionFilter !== 'all') {
        const r = countryRegion(p.country);
        if (r !== regionFilter) return false;
      }

      if (budgetFilter !== 'all') {
        const amt = roughAmountFromCostLabel(p.cost);
        if (amt == null) return true;
        if (budgetFilter === 'lt250' && amt >= 250_000) return false;
        if (budgetFilter === '250500' && (amt < 250_000 || amt > 500_000)) return false;
        if (budgetFilter === 'gt500' && amt <= 500_000) return false;
      }
      return true;
    });
  }, [programs, search, budgetFilter, regionFilter]);

  return (
    <div className={shellClass}>
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
        <header className="mb-10 text-center sm:mb-12">
          <h1 className="text-3xl font-black tracking-tight text-[#0D1B3E] sm:text-4xl md:text-5xl">
            Investissement & nationalité
          </h1>
          <p className="mx-auto mt-5 max-w-2xl font-serif text-base font-medium leading-relaxed text-[#0D1B3E]/82 sm:text-lg">
            Programmes de citoyenneté et de résidence par investissement pour profils à haute valeur nette — données
            indicatives à croiser avec un conseil juridique et fiscal.
          </p>
        </header>

        <div className="mb-8 rounded-2xl border border-[#0D1B3E]/10 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="relative min-w-0 flex-1">
              <label htmlFor="vault-search" className="sr-only">
                Rechercher un programme
              </label>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#0D1B3E]/35" aria-hidden />
              <input
                id="vault-search"
                type="search"
                placeholder="Rechercher un programme…"
                className="w-full rounded-xl border border-[#0D1B3E]/12 bg-[#FDFBF4]/50 py-3.5 pl-12 pr-4 text-sm font-medium text-[#0D1B3E] outline-none ring-offset-2 placeholder:text-[#0D1B3E]/40 focus:ring-2 focus:ring-[#0D1B3E]/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[340px] lg:grid-cols-2">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0D1B3E]/45">Budget min.</span>
                <Select
                  value={budgetFilter}
                  onValueChange={(v) => setBudgetFilter(v as 'all' | 'lt250' | '250500' | 'gt500')}
                >
                  <SelectTrigger className="h-11 border-[#0D1B3E]/12 bg-[#FDFBF4]/50 text-[#0D1B3E]">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="lt250">&lt; 250k USD (ordre de grandeur)</SelectItem>
                    <SelectItem value="250500">250k – 500k USD</SelectItem>
                    <SelectItem value="gt500">&gt; 500k USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0D1B3E]/45">Région</span>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="h-11 border-[#0D1B3E]/12 bg-[#FDFBF4]/50 text-[#0D1B3E]">
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {regionOptions.map((r) => (
                      <SelectItem key={r} value={r}>
                        {regionCapsLabel(r)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div
          className="mb-10 flex gap-4 rounded-2xl border border-[#0D1B3E]/10 bg-white/90 p-5 shadow-sm sm:p-6"
          role="note"
        >
          <Info className="mt-0.5 h-6 w-6 shrink-0 text-[#0D1B3E]/55" aria-hidden />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">Prudence réglementaire</p>
            <p className="mt-2 font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/78 sm:text-[15px]">
              Les programmes par investissement sont soumis à des critères d&apos;éligibilité stricts, des audits de
              source de fonds et à une évolution législative constante. VisaFlow ne fournit pas de conseil en
              investissement ni en immigration juridique : ces fiches synthétisent des signaux issus du dataset à
              titre informatif uniquement.
            </p>
          </div>
        </div>

        <GoogleAd slot="investment_top" />

        {loading ? (
          <div className="flex justify-center py-20">
            <div
              className="h-12 w-12 animate-spin rounded-full border-2 border-[#0D1B3E]/15 border-t-[#0D1B3E]"
              aria-hidden
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-[#0D1B3E]/10 bg-white px-6 py-12 text-center shadow-sm sm:rounded-3xl sm:px-10">
            <Sparkles className="mx-auto mb-6 h-14 w-14 text-[#0D1B3E]/25" aria-hidden />
            <h2 className="mb-3 text-2xl font-black text-[#0D1B3E]">Aucun programme ne correspond</h2>
            <p className="font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/75">
              {programs.length === 0
                ? "La base actuelle n'inclut pas encore de programmes CBI complets. Explorez les pays et suivez l'évolution du dataset."
                : 'Affinez la recherche, le budget ou la région — ou consultez l’explorateur pour un parcours plus large.'}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ObjectiveAwareExplorerLink className="inline-flex items-center justify-center rounded-xl bg-[#0D1B3E] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-[#0D1B3E]/90">
                Explorer les pays <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </ObjectiveAwareExplorerLink>
              <Link
                href="/overview"
                className="inline-flex items-center justify-center rounded-xl border-2 border-[#0D1B3E]/15 bg-white px-6 py-3.5 text-xs font-black uppercase tracking-wider text-[#0D1B3E] transition-colors hover:border-[#0D1B3E]/30"
              >
                Tableau de bord
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid auto-rows-fr grid-cols-1 gap-8 md:grid-cols-2">
            {filtered.map((p) => {
              const badge = programBadge(p.program);
              const region = countryRegion(p.country);
              const delayOrStatus = p.processing || p.statusLine || '—';

              return (
                <article
                  key={String(p.country.id)}
                  className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#0D1B3E]/10 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-[#0D1B3E]/08 px-6 pb-4 pt-6 sm:px-8 sm:pt-8">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/50">
                      {regionCapsLabel(region)}
                    </span>
                    <span
                      className={
                        badge.variant === 'exclusive'
                          ? 'shrink-0 rounded-md bg-[#0D1B3E] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white'
                          : badge.variant === 'golden'
                            ? 'shrink-0 rounded-md border-2 border-[#0D1B3E] bg-transparent px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#0D1B3E]'
                            : 'shrink-0 rounded-md border border-[#0D1B3E]/15 bg-[#f4f2ee] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#0D1B3E]/75'
                      }
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div className="px-6 sm:px-8">
                    <h3 className="text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">{p.country.name}</h3>
                  </div>

                  <div className="mt-6 grid flex-1 grid-cols-2 gap-3 px-6 sm:px-8">
                    <div className="rounded-xl border border-[#0D1B3E]/08 bg-[#faf8f5] p-4">
                      <div className="text-[9px] font-black uppercase tracking-[0.14em] text-[#0D1B3E]/45">
                        Investissement min.
                      </div>
                      <div className="mt-2 font-mono text-sm font-black text-[#0D1B3E]">{p.cost || '—'}</div>
                    </div>
                    <div className="rounded-xl border border-[#0D1B3E]/08 bg-[#faf8f5] p-4">
                      <div className="text-[9px] font-black uppercase tracking-[0.14em] text-[#0D1B3E]/45">
                        {p.processing ? 'Délai de traitement' : 'Statut'}
                      </div>
                      <div className="mt-2 text-sm font-bold leading-snug text-[#0D1B3E]">{delayOrStatus}</div>
                    </div>
                  </div>

                  <div className="mt-5 px-6 sm:px-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0D1B3E]/45">Avantages clés</p>
                    <p className="mt-2 font-serif text-sm leading-relaxed text-[#0D1B3E]/78">{p.benefits}</p>
                  </div>

                  <div className="mt-auto border-t border-[#0D1B3E]/08 px-6 py-5 sm:px-8">
                    <Link
                      href={`/countries/${p.country.id}`}
                      className="inline-flex items-center gap-2 text-sm font-black text-[#0D1B3E] underline decoration-[#0D1B3E]/25 underline-offset-4 transition-colors hover:decoration-[#0D1B3E]"
                    >
                      Voir détails pays
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <section className="mt-16 rounded-3xl border border-[#0D1B3E]/10 bg-white px-6 py-10 text-center shadow-sm sm:px-12 sm:py-14">
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#0D1B3E]/50">Conciergerie privée</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">
            Besoin d&apos;un accompagnement sur mesure ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/78 sm:text-[15px]">
            Délégation de préparation de dossier, coordination avec des partenaires et suivi des étapes administratives —
            sans remplacer un avocat ou un conseiller en investissement agréé.
          </p>
          <Link
            href="/services/delegated-applications"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#0D1B3E] px-8 py-3.5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-md transition-colors hover:bg-[#0D1B3E]/90"
          >
            Solliciter une consultation
          </Link>
        </section>

        <div className="mt-14">
          <GoogleAd slot="investment_bottom" />
        </div>
      </div>
    </div>
  );
}
