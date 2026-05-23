'use client';

import { formatIntelDateShortFr } from '@/lib/intel-freshness';
import type { IntelligenceBlockProps } from '@/components/intelligence/IntelligenceBlockRenderer';

export function VerifiedUpdatesFeed({
  value,
  meta,
}: Pick<IntelligenceBlockProps, 'value' | 'meta'>) {
  const iso = typeof value === 'string' ? value : null;
  if (!iso) return null;
  return (
    <div className="rounded-lg border border-slate-200/80 bg-slate-50/90 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
      <p className="font-medium text-slate-900 dark:text-slate-100">
        {meta?.label ?? 'Mise à jour vérifiée'}
      </p>
      <p>Économie matérialisée · {formatIntelDateShortFr(iso)}</p>
      {meta?.verificationStatus === 'verified' ? (
        <p className="mt-1 text-emerald-700 dark:text-emerald-400">Consensus multi-sources</p>
      ) : null}
    </div>
  );
}
