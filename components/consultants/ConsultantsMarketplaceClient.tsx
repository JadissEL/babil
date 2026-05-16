'use client';

import { ArrowRight, CalendarClock, FileStack, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider';
import { showConsultantMarketplaceNav } from '@/lib/consultant-nav';
import {
  NEXUS_FOCUS_VISIBLE,
  NEXUS_FOCUS_VISIBLE_ON_INK_SOLID,
  NEXUS_TRANSITION,
} from '@/lib/nexus-chrome';
import { getObjectiveBySlug } from '@/lib/user-objectives/registry';
import { cn } from '@/lib/utils';

const INK = '#0D1B3E';
const INK_10 = 'rgba(13,27,62,0.10)';

type ExpertRow = {
  id: string;
  slug: string;
  displayName: string;
  title: string | null;
  bio: string;
  gender: string;
  specialties: string[];
  price30MinCents: number;
  price60MinCents: number;
  averageRating: number;
  reviewCount: number;
  upcomingSlots: number;
};

export default function ConsultantsMarketplaceClient() {
  const searchParams = useSearchParams();
  const interestFromUrl = searchParams.get('interest')?.trim() ?? '';
  const seededInterestFromUrl = useRef(false);

  const { preference } = useObjectivePreference();
  const primaryDef = useMemo(
    () => getObjectiveBySlug(preference.primarySlug),
    [preference.primarySlug],
  );
  const consultantsVisible = showConsultantMarketplaceNav(primaryDef);

  const [interest, setInterest] = useState('');
  const [maxPriceEur, setMaxPriceEur] = useState('');
  const [gender, setGender] = useState<'all' | 'male' | 'female'>('all');
  const [minStars, setMinStars] = useState('0');
  const [experts, setExperts] = useState<ExpertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiddenTourism, setHiddenTourism] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (preference.primarySlug) q.set('objective', preference.primarySlug);
      if (interest.trim()) q.set('interest', interest.trim());
      if (maxPriceEur.trim()) q.set('maxPriceEur', maxPriceEur.trim());
      if (gender !== 'all') q.set('gender', gender);
      if (minStars && minStars !== '0') q.set('minStars', minStars);
      const res = await fetch(`/api/consultants?${q.toString()}`, { cache: 'no-store' });
      const data = (await res.json()) as { experts?: ExpertRow[]; hiddenForTourism?: boolean };
      if (data.hiddenForTourism) {
        setHiddenTourism(true);
        setExperts([]);
      } else {
        setHiddenTourism(false);
        setExperts(data.experts ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [gender, interest, maxPriceEur, minStars, preference.primarySlug]);

  useEffect(() => {
    if (seededInterestFromUrl.current || !interestFromUrl) return;
    setInterest(interestFromUrl);
    seededInterestFromUrl.current = true;
  }, [interestFromUrl]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  if (!consultantsVisible || hiddenTourism) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-[#0D1B3E]/20 bg-white p-8 text-center">
        <p className="font-serif text-lg font-black text-[#0D1B3E]">Experts en visio</p>
        <p className="mt-2 text-sm text-[#0D1B3E]/70">
          Ce service est proposé pour les parcours études, travail, business et formations — pas pour l’objectif{' '}
          <strong>Tourisme</strong>. Changez votre objectif principal dans le dock en haut de page pour accéder au
          catalogue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/55">
    SERVICES · EXPERTS
        </p>
        <h1 className="font-serif text-3xl font-black tracking-tight text-[#0D1B3E]">
          Réserver un consultant mobilité
        </h1>
        <p className="max-w-3xl text-sm font-medium leading-relaxed text-[#0D1B3E]/70">
          Filtrez par domaine (études, travail, business…), tarif préférentiel, note et genre. Créneaux 30 ou 60
          minutes ; paiement sécurisé Stripe pour bloquer le créneau. L’expert reçoit un e-mail après confirmation du
          paiement.
        </p>
      </header>

      <section
        className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"
        style={{ borderColor: INK_10 }}
        aria-label="Filtres"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#0D1B3E]/55">
              Intérêt / thème
            </span>
            <input
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="ex. études, travail, Schengen"
              className="w-full rounded-xl border border-[#0D1B3E]/15 bg-[#FDFBF4] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0D1B3E]/25"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#0D1B3E]/55">
              Prix max (€ / séance la moins chère)
            </span>
            <input
              type="number"
              min={0}
              value={maxPriceEur}
              onChange={(e) => setMaxPriceEur(e.target.value)}
              placeholder="ex. 80"
              className="w-full rounded-xl border border-[#0D1B3E]/15 bg-[#FDFBF4] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0D1B3E]/25"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#0D1B3E]/55">
              Préférence consultant
            </span>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'all' | 'male' | 'female')}
              className="w-full rounded-xl border border-[#0D1B3E]/15 bg-[#FDFBF4] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0D1B3E]/25"
            >
              <option value="all">Indifférent</option>
              <option value="female">Femme</option>
              <option value="male">Homme</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#0D1B3E]/55">Note minimum</span>
            <select
              value={minStars}
              onChange={(e) => setMinStars(e.target.value)}
              className="w-full rounded-xl border border-[#0D1B3E]/15 bg-[#FDFBF4] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0D1B3E]/25"
            >
              <option value="0">Toutes</option>
              <option value="4">4+ étoiles</option>
              <option value="4.5">4,5+ étoiles</option>
              <option value="5">5 étoiles</option>
            </select>
          </label>
        </div>
        <button
          type="button"
          onClick={() => void fetchList()}
          className={cn(
            'mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0D1B3E] px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white',
            NEXUS_TRANSITION,
            NEXUS_FOCUS_VISIBLE_ON_INK_SOLID,
          )}
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          Appliquer les filtres
        </button>
      </section>

      {loading ? (
        <p className="text-sm font-medium text-[#0D1B3E]/60">Chargement du catalogue…</p>
      ) : experts.length === 0 ? (
        <p className="text-sm font-medium text-[#0D1B3E]/60">Aucun expert ne correspond à ces critères.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {experts.map((e) => (
            <li
              key={e.id}
              className="flex flex-col rounded-2xl border bg-white p-5 shadow-sm"
              style={{ borderColor: INK_10 }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-serif text-lg font-black text-[#0D1B3E]">{e.displayName}</p>
                  {e.title ? <p className="text-xs font-bold text-[#0D1B3E]/65">{e.title}</p> : null}
                </div>
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-black text-amber-900">
                  <Star className="h-3.5 w-3.5" aria-hidden />
                  {e.averageRating.toFixed(1)}
                  <span className="font-medium text-amber-800/80">({e.reviewCount})</span>
                </span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#0D1B3E]/75">{e.bio}</p>
              <ul className="mt-2 flex flex-wrap gap-1">
                {e.specialties.slice(0, 4).map((s) => (
                  <li
                    key={s}
                    className="rounded-md border border-[#0D1B3E]/10 bg-[#FDFBF4] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0D1B3E]/80"
                  >
                    {s}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold text-[#0D1B3E]/70">
                <span>{(e.price30MinCents / 100).toFixed(0)} € · 30 min</span>
                <span>{(e.price60MinCents / 100).toFixed(0)} € · 60 min</span>
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                  {e.upcomingSlots} créneaux
                </span>
              </div>
              <Link
                href={`/services/consultants/${e.slug}`}
                className={cn(
                  'mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-[#0D1B3E]/20 bg-[#FDFBF4] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-[#0D1B3E]',
                  NEXUS_TRANSITION,
                  NEXUS_FOCUS_VISIBLE,
                )}
              >
                Voir profil & agenda <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <section className="rounded-2xl border border-dashed border-[#0D1B3E]/20 bg-white/80 p-5">
        <p className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
          <FileStack className="h-4 w-4" aria-hidden />
          Besoin d’exécution plutôt qu’un créneau ?
        </p>
        <p className="mt-2 text-sm text-[#0D1B3E]/75">
          Pour la rédaction et le dépôt de candidatures (emploi ou université), utilisez plutôt{' '}
          <Link href="/services/delegated-applications" className="font-black text-[#0D1B3E] underline">
            Assist candidatures
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
