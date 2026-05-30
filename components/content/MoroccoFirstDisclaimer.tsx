import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { NEXUS_FOCUS_VISIBLE, NEXUS_TRANSITION } from '@/lib/nexus-chrome';
import { cn } from '@/lib/utils';

/**
 * In-repo editorial rules (Morocco-first, reader clarity):
 * - Inverted pyramid: answer « que faire si je pars du Maroc ? » before secondary context.
 * - Distinguish **orientation** (this site) from **acte juridique** (consulat / TLS / loi).
 * - Every numeric score includes the scale (ex. sur 100, sur 10) and must not be read as a guarantee of visa issuance.
 * - Prefer « à vérifier sur la source officielle » to silent placeholders or invented rates.
 * - Attribute Wikipedia/context blocks; flag `non validé` on automated excerpts.
 */

export function MoroccoFirstDisclaimer({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <p
        className={cn(
          'rounded-lg border border-[#0D1B3E]/10 bg-[#FDFBF4] px-3 py-2 font-serif text-[11px] font-medium leading-relaxed text-[#0D1B3E]/75',
          className,
        )}
      >
        <strong className="font-black text-[#0D1B3E]">Lecture Maroc :</strong> orientation pour
        passeports MAR / résidents au Maroc — pas un conseil juridique.{' '}
        <Link
          href="/avertissement"
          className={cn(
            'font-black text-[#0D1B3E] underline underline-offset-2',
            NEXUS_FOCUS_VISIBLE,
          )}
        >
          Détails
        </Link>
        .
      </p>
    );
  }

  return (
    <div
      role="note"
      className={cn(
        'flex gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/90 p-4 text-[#0D1B3E] shadow-sm sm:p-5',
        className,
      )}
    >
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" aria-hidden />
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-900/90">
          Pour les lecteurs au Maroc
        </p>
        <p className="mt-2 font-serif text-sm font-medium leading-relaxed text-amber-950/95">
          VisaFlow présente une <strong>lecture structurée</strong> pour préparer un projet depuis
          le Maroc (tourisme, études, travail, installation). Les délais, refus et pièces exactes
          dépendent toujours du <strong>guichet officiel</strong>, du motif et de la date. Les
          scores et barres sont des <strong>repères comparatifs</strong>, pas une promesse de
          décision.
        </p>
        <p className="mt-2 font-serif text-sm font-medium leading-relaxed text-amber-950/90">
          <Link
            href="/avertissement"
            className={cn(
              'inline-flex font-black text-[#0D1B3E] underline decoration-[#0D1B3E]/35 underline-offset-2',
              NEXUS_TRANSITION,
              NEXUS_FOCUS_VISIBLE,
            )}
          >
            Avertissement complet et fraîcheur des données
          </Link>
        </p>
      </div>
    </div>
  );
}
