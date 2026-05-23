'use client';

import { BadgeCheck } from 'lucide-react';
import type { IntelligenceBlockProps } from '@/components/intelligence/IntelligenceBlockRenderer';

export function ProvenanceChip({ value, meta }: Pick<IntelligenceBlockProps, 'value' | 'meta'>) {
  const label =
    meta?.provenanceLabel ?? meta?.label ?? (typeof value === 'string' ? value : 'Source');
  const stale = meta?.verificationStatus === 'estimated' || meta?.verificationStatus === 'pending';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        stale
          ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50'
          : 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100'
      }`}
      title={meta?.sourceSlug ? `Source : ${meta.sourceSlug}` : undefined}
    >
      <BadgeCheck className="h-3 w-3" aria-hidden />
      {label}
    </span>
  );
}
