'use client';

import { useAuth, SignInButton } from '@clerk/nextjs';
import { ArrowLeft, CalendarClock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider';
import { showConsultantMarketplaceNav } from '@/lib/consultant-nav';
import {
  NEXUS_FOCUS_VISIBLE,
  NEXUS_FOCUS_VISIBLE_ON_INK_SOLID,
  NEXUS_TRANSITION,
} from '@/lib/nexus-chrome';
import { getObjectiveBySlug } from '@/lib/user-objectives/registry';
import { cn } from '@/lib/utils';

type ExpertPayload = {
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
  slots: { id: string; startUtc: string; endUtc: string }[];
};

export function ConsultantProfileBookingClient({ slug }: { slug: string }) {
  const { isSignedIn } = useAuth();
  const searchParams = useSearchParams();
  const cancelled = searchParams.get('cancelled') === '1';
  const { preference } = useObjectivePreference();
  const primaryDef = useMemo(
    () => getObjectiveBySlug(preference.primarySlug),
    [preference.primarySlug],
  );
  const okNav = showConsultantMarketplaceNav(primaryDef);

  const [expert, setExpert] = useState<ExpertPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [duration, setDuration] = useState<30 | 60>(30);
  const [payBusy, setPayBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/consultants/${encodeURIComponent(slug)}`, { cache: 'no-store' });
      if (!res.ok) {
        setError('Expert introuvable');
        setExpert(null);
        return;
      }
      const data = (await res.json()) as { expert: ExpertPayload };
      setExpert(data.expert);
    } catch {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const onPay = async () => {
    if (!expert || !selectedSlot) return;
    setPayBusy(true);
    try {
      const res = await fetch('/api/consultants/bookings/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertSlug: expert.slug,
          slotId: selectedSlot,
          durationMinutes: duration,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        alert(data.error ?? 'Paiement indisponible');
        return;
      }
      if (data.url) window.location.href = data.url;
    } finally {
      setPayBusy(false);
    }
  };

  if (!okNav) {
    return (
      <div className="rounded-2xl border border-dashed border-[#0D1B3E]/20 bg-white p-8 text-center">
        <p className="font-serif text-lg font-black text-[#0D1B3E]">Réservations experts</p>
        <p className="mt-2 text-sm text-[#0D1B3E]/70">
          Changez votre objectif principal (hors Tourisme) pour accéder à cette page.
        </p>
        <Link
          href="/services/consultants"
          className="mt-4 inline-block text-sm font-black text-[#0D1B3E] underline"
        >
          Retour au catalogue
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#0D1B3E]/65">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Chargement du profil…
      </div>
    );
  }

  if (error || !expert) {
    return <p className="text-sm font-medium text-rose-700">{error ?? 'Introuvable'}</p>;
  }

  const priceCents = duration === 30 ? expert.price30MinCents : expert.price60MinCents;

  return (
    <div className="space-y-8">
      <Link
        href="/services/consultants"
        className={cn(
          'inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#0D1B3E]/60 hover:text-[#0D1B3E]',
          NEXUS_TRANSITION,
          NEXUS_FOCUS_VISIBLE,
        )}
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Tous les experts
      </Link>

      {cancelled ? (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Paiement annulé — le créneau n’a pas été réservé. Vous pouvez en choisir un autre.
        </p>
      ) : null}

      <header className="space-y-2">
        <h1 className="font-serif text-3xl font-black text-[#0D1B3E]">{expert.displayName}</h1>
        {expert.title ? <p className="text-sm font-bold text-[#0D1B3E]/70">{expert.title}</p> : null}
        <p className="max-w-3xl text-sm leading-relaxed text-[#0D1B3E]/75">{expert.bio}</p>
        <p className="text-xs font-medium text-[#0D1B3E]/55">
          Note moyenne {expert.averageRating.toFixed(1)} / 5 — {expert.reviewCount} avis
        </p>
      </header>

      <section className="rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/55">
          <CalendarClock className="h-4 w-4" aria-hidden />
          Agenda disponible (UTC affichée · réglez votre fuseau côté expert)
        </h2>
        <p className="mt-2 text-xs text-[#0D1B3E]/60">
          Sélectionnez un créneau d’une heure, puis la durée de séance (30 ou 60 min). Le montant adapté s’affiche.
          Paiement Stripe pour bloquer définitivement le créneau.
        </p>

        {expert.slots.length === 0 ? (
          <p className="mt-4 text-sm text-[#0D1B3E]/65">Aucun créneau libre pour le moment.</p>
        ) : (
          <ul className="mt-4 grid max-h-[280px] gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
            {expert.slots.map((s) => {
              const start = new Date(s.startUtc);
              const active = selectedSlot === s.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedSlot(s.id)}
                    className={cn(
                      'w-full rounded-xl border px-3 py-2 text-left text-sm font-bold transition-colors',
                      active
                        ? 'border-[#0D1B3E] bg-[#0D1B3E] text-white'
                        : 'border-[#0D1B3E]/15 bg-[#FDFBF4] text-[#0D1B3E] hover:border-[#0D1B3E]/35',
                      NEXUS_FOCUS_VISIBLE,
                    )}
                  >
                    {start.toLocaleString('fr-FR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short',
                    })}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-6">
          <fieldset>
            <legend className="text-[10px] font-black uppercase tracking-wider text-[#0D1B3E]/55">
              Durée
            </legend>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setDuration(30)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs font-black',
                  duration === 30
                    ? 'border-[#0D1B3E] bg-[#0D1B3E] text-white'
                    : 'border-[#0D1B3E]/15 bg-white',
                )}
              >
                30 min — {(expert.price30MinCents / 100).toFixed(0)} €
              </button>
              <button
                type="button"
                onClick={() => setDuration(60)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs font-black',
                  duration === 60
                    ? 'border-[#0D1B3E] bg-[#0D1B3E] text-white'
                    : 'border-[#0D1B3E]/15 bg-white',
                )}
              >
                60 min — {(expert.price60MinCents / 100).toFixed(0)} €
              </button>
            </div>
          </fieldset>
        </div>

        <div className="mt-6 rounded-xl border border-[#0D1B3E]/10 bg-[#FDFBF4] px-4 py-3">
          <p className="text-sm font-black text-[#0D1B3E]">Total à payer : {(priceCents / 100).toFixed(2)} €</p>
          <p className="mt-1 text-[11px] text-[#0D1B3E]/60">
            Après paiement, l’expert reçoit un e-mail avec l’horaire et votre coordonnée Clerk si disponible.
          </p>
        </div>

        {!isSignedIn ? (
          <div className="mt-4">
            <SignInButton mode="modal">
              <button
                type="button"
                className={cn(
                  'rounded-xl bg-[#0D1B3E] px-5 py-3 text-xs font-black uppercase tracking-widest text-white',
                  NEXUS_FOCUS_VISIBLE_ON_INK_SOLID,
                  NEXUS_TRANSITION,
                )}
              >
                Se connecter pour payer
              </button>
            </SignInButton>
          </div>
        ) : (
          <button
            type="button"
            disabled={!selectedSlot || payBusy}
            onClick={() => void onPay()}
            className={cn(
              'mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-xs font-black uppercase tracking-widest text-white disabled:opacity-50',
              NEXUS_FOCUS_VISIBLE_ON_INK_SOLID,
              NEXUS_TRANSITION,
            )}
          >
            {payBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            Payer et sécuriser le créneau
          </button>
        )}
      </section>
    </div>
  );
}
