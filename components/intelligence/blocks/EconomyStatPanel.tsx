'use client';

import type { IntelligenceBlockProps } from '@/components/intelligence/IntelligenceBlockRenderer';

function labelForPath(path: string): string {
  if (path.includes('gdp_per_capita')) return 'PIB / hab.';
  if (path.includes('population')) return 'Population';
  if (path.includes('gdp')) return 'PIB (USD)';
  return path.split('.').pop() ?? path;
}

export function EconomyStatPanel({
  path,
  value,
  meta,
}: Pick<IntelligenceBlockProps, 'path' | 'value' | 'meta'>) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const formatted =
    value >= 1_000_000_000
      ? `${(value / 1_000_000_000).toFixed(1)} Md`
      : value >= 1_000_000
        ? `${(value / 1_000_000).toFixed(1)} M`
        : value.toLocaleString('fr-FR');

  return (
    <div className="rounded-lg border border-slate-200/80 bg-white/90 px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {meta?.label ?? labelForPath(path)}
      </p>
      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatted}</p>
      {meta?.provenanceLabel || meta?.verificationStatus ? (
        <p
          className="mt-0.5 text-[10px] text-slate-500"
          title={meta.observedAt ? `Observé ${meta.observedAt}` : undefined}
        >
          {meta.provenanceLabel ??
            [
              meta.verificationStatus,
              meta.confidence != null ? `conf. ${Math.round(meta.confidence * 100)}%` : '',
            ]
              .filter(Boolean)
              .join(' · ')}
        </p>
      ) : null}
    </div>
  );
}
