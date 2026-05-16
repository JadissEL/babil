import { ArrowRight, CalendarClock, FileStack } from 'lucide-react';
import Link from 'next/link';
import {
  NEXUS_FOCUS_VISIBLE,
  NEXUS_FOCUS_VISIBLE_ON_INK_SOLID,
  NEXUS_TRANSITION,
} from '@/lib/nexus-chrome';
import { cn } from '@/lib/utils';

const INK = '#0D1B3E';
const INK_10 = 'rgba(13,27,62,0.10)';

/**
 * Bloc d’accueil : Assist candidatures + Experts (style aligné hero / promos PAGE 01).
 */
export function ConsultantsAndDelegatedHomeSection() {
  return (
    <section
      className="grid gap-4 md:grid-cols-2"
      aria-labelledby="home-services-experts-title"
    >
      <h2 id="home-services-experts-title" className="sr-only">
        Services accompagnement et experts
      </h2>
      <div
        className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8"
        style={{ borderColor: INK_10, color: INK }}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-[#0D1B3E]/10 bg-[#F5F0E3] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#0D1B3E]/65">
          <FileStack className="h-3.5 w-3.5" aria-hidden />
          Assist candidatures
        </div>
        <p className="mt-4 font-serif text-xl font-black tracking-tight">Délégation emploi & universités</p>
        <p className="mt-2 text-sm font-medium leading-relaxed text-[#0D1B3E]/70">
          CV, lettres et dépôts coordonnés — pour vous concentrer sur entretiens et examens. Réservé aux comptes
          connectés.
        </p>
        <Link
          href="/services/delegated-applications"
          className={cn(
            'mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0D1B3E] px-5 py-3 text-xs font-black uppercase tracking-widest text-white',
            NEXUS_TRANSITION,
            NEXUS_FOCUS_VISIBLE_ON_INK_SOLID,
          )}
        >
          Voir catalogues <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
      <div
        className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8"
        style={{ borderColor: INK_10, color: INK }}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-900">
          <CalendarClock className="h-3.5 w-3.5" aria-hidden />
          Experts · 30 / 60 min
        </div>
        <p className="mt-4 font-serif text-xl font-black tracking-tight">Consultants mobilité (hors tourisme)</p>
        <p className="mt-2 text-sm font-medium leading-relaxed text-[#0D1B3E]/70">
          Choisissez un thème (études, travail, business…), filtrez par prix et préférences, puis réservez un créneau
          sur l’agenda de l’expert avec paiement immédiat Stripe.
        </p>
        <Link
          href="/services/consultants"
          className={cn(
            'mt-5 inline-flex items-center gap-2 rounded-xl border border-[#0D1B3E]/20 bg-[#FDFBF4] px-5 py-3 text-xs font-black uppercase tracking-widest text-[#0D1B3E]',
            NEXUS_TRANSITION,
            NEXUS_FOCUS_VISIBLE,
          )}
        >
          Trouver un expert <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
