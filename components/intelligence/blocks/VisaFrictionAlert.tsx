'use client';

import { AlertTriangle } from 'lucide-react';
import type { IntelligenceBlockProps } from '@/components/intelligence/IntelligenceBlockRenderer';

export function VisaFrictionAlert({
  path,
  value,
  meta,
}: Pick<IntelligenceBlockProps, 'path' | 'value' | 'meta'>) {
  if (value == null || value === '') return null;
  const text = String(value);
  const isHigh = path.includes('difficulty') && /hard|difficile|élevé|high|strict/i.test(text);

  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
        isHigh
          ? 'border-amber-300/80 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100'
          : 'border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200'
      }`}
    >
      {isHigh ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> : null}
      <div>
        <p className="font-medium">{meta?.label ?? 'Friction visa'}</p>
        <p>{text}</p>
      </div>
    </div>
  );
}
