'use client';

import { intelligenceCoverageFromFullData } from '@/lib/country-intelligence-coverage-display';
import { readMedallionTimestamps } from '@/lib/intelligence-pipeline/medallion-timestamps';
import { cn } from '@/lib/utils';

export function CountryIntelligenceCoverageBadge({
  full,
  className,
}: {
  full: Record<string, unknown>;
  className?: string;
}) {
  const cov = intelligenceCoverageFromFullData(full);
  const medallion = readMedallionTimestamps(full);
  if (cov.targetCount === 0) return null;

  const layerHint = medallion.medallion_layer_last
    ? ` · couche ${medallion.medallion_layer_last}`
    : '';

  const tone =
    cov.score >= 85
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : cov.score >= 55
        ? 'text-amber-800 bg-amber-50 border-amber-200'
        : 'text-slate-700 bg-slate-50 border-slate-200';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        tone,
        className,
      )}
      title={`${cov.materializedCount}/${cov.targetCount} indicateurs matérialisés · ${cov.labelFr}${layerHint}`}
    >
      Intel {cov.score}%{cov.disputedCount > 0 ? ` · ${cov.disputedCount} litige(s)` : ''}
    </span>
  );
}
