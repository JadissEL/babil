'use client';

import { ExternalLink, Info } from 'lucide-react';
import Link from 'next/link';
import type { MoroccoResearchPack } from '@/lib/morocco-research-pack';
import {
  MOROCCO_SECTION_LABELS_FR,
  isSourcedValue,
  sourceRefsFromValue,
  verificationLabelFr,
} from '@/lib/morocco-research-ui';
import { NEXUS_FOCUS_VISIBLE, NEXUS_TRANSITION } from '@/lib/nexus-chrome';
import { cn } from '@/lib/utils';

const SECTION_ORDER: (keyof MoroccoResearchPack)[] = [
  'immigration_legal',
  'work_business',
  'education',
  'costs_life_mad',
  'society_demographics',
  'mobility_transport',
  'climate_geography',
  'special_programs',
  'driving_license_detail',
];

function isSectionKey(k: string): k is keyof MoroccoResearchPack {
  return SECTION_ORDER.includes(k as keyof MoroccoResearchPack);
}

export function MoroccoResearchPackSection({
  countryName,
  pack,
}: {
  countryName: string;
  pack: MoroccoResearchPack | null | undefined;
}) {
  if (!pack || typeof pack !== 'object') return null;

  return (
    <section
      aria-labelledby="morocco-pack-heading"
      className="relative overflow-hidden rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
            Depuis le Maroc
          </p>
          <h2
            id="morocco-pack-heading"
            className="mt-1 font-serif text-xl font-black tracking-tight text-[#0D1B3E] sm:text-2xl"
          >
            Ce qui compte pour un passeport marocain — {countryName}
          </h2>
          <p className="mt-2 font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/70">
            Chaque bloc résume les questions les plus fréquentes avant un voyage, des études ou une
            installation. Les extraits marqués « non validé » proviennent d’explorations
            automatiques : vérifiez toujours la source.
          </p>
        </div>
        <Link
          href="/avertissement"
          className={cn(
            'inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-[#0D1B3E]/15 bg-[#FDFBF4] px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/80 hover:bg-[#F4EFE2]',
            NEXUS_TRANSITION,
            NEXUS_FOCUS_VISIBLE,
          )}
        >
          <Info className="h-3.5 w-3.5" aria-hidden />
          Avertissement légal
        </Link>
      </div>

      <div className="space-y-6">
        {SECTION_ORDER.map((key) => {
          const block = pack[key];
          if (!block || typeof block !== 'object') return null;
          const section = block as Record<string, unknown>;
          const summary = typeof section.summary === 'string' ? section.summary.trim() : '';
          const sourced = section.sourced_entries;
          const entries =
            sourced && typeof sourced === 'object' && !Array.isArray(sourced)
              ? Object.entries(sourced as Record<string, unknown>)
              : [];

          if (!summary && entries.length === 0) return null;

          const title = MOROCCO_SECTION_LABELS_FR[key] ?? String(key);

          return (
            <div
              key={String(key)}
              className="rounded-xl border border-[#0D1B3E]/8 bg-[#FDFBF4]/50 p-4 sm:p-5"
            >
              <h3 className="font-serif text-base font-black text-[#0D1B3E]">{title}</h3>
              {summary ? (
                <p className="mt-2 font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/80">
                  {summary}
                </p>
              ) : null}

              {entries.length > 0 ? (
                <ul className="mt-3 space-y-3 border-t border-[#0D1B3E]/10 pt-3">
                  {entries.map(([entryKey, raw]) => {
                    if (!isSourcedValue(raw)) return null;
                    const refs = sourceRefsFromValue(raw);
                    const valueStr =
                      typeof raw.value === 'string'
                        ? raw.value
                        : JSON.stringify(raw.value, null, 0).slice(0, 2000);
                    return (
                      <li key={entryKey} className="text-sm leading-relaxed text-[#0D1B3E]/85">
                        <span className="mr-2 inline-flex rounded-md border border-[#0D1B3E]/12 bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#0D1B3E]/70">
                          {verificationLabelFr(raw.verification)}
                        </span>
                        <span className="font-medium">{valueStr}</span>
                        {refs.length > 0 ? (
                          <span className="mt-1 flex flex-wrap gap-2">
                            {refs.map((ref, i) => (
                              <a
                                key={`${ref.url}-${i}`}
                                href={ref.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  'inline-flex items-center gap-1 text-[11px] font-bold text-[#0D1B3E] underline decoration-[#0D1B3E]/30 underline-offset-2',
                                  NEXUS_FOCUS_VISIBLE,
                                )}
                              >
                                <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
                                {ref.label || 'Source'}
                                {ref.retrievedAt
                                  ? ` · ${new Date(ref.retrievedAt).toLocaleDateString('fr-FR')}`
                                  : ''}
                              </a>
                            ))}
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
