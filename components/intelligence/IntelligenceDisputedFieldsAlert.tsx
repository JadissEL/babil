'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { getIntelligenceFieldPathGlossaryEntry } from '@/lib/intelligence-fieldpath-glossary';

function labelForPath(path: string): string {
  return getIntelligenceFieldPathGlossaryEntry(path)?.labelFr ?? path;
}

/** Surfaces non-promotable disputed taxonomy paths on the country sheet. */
export function IntelligenceDisputedFieldsAlert({ fieldPaths }: { fieldPaths: string[] }) {
  if (fieldPaths.length === 0) return null;

  return (
    <div
      role="status"
      className="mb-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div>
        <p className="font-bold">Données en litige (non promues)</p>
        <p className="mt-1 text-xs opacity-90">
          Ces champs ont des sources contradictoires — les valeurs affichées peuvent être
          incomplètes jusqu’à revue admin.{' '}
          <Link href="/intelligence-fieldpaths" className="underline underline-offset-2">
            Glossaire fieldPath
          </Link>
        </p>
        <ul className="mt-2 space-y-1 text-[11px]">
          {fieldPaths.slice(0, 6).map((p) => (
            <li key={p}>
              <span className="font-medium">{labelForPath(p)}</span>
              <span className="ml-1.5 font-mono text-[10px] opacity-75">{p}</span>
            </li>
          ))}
          {fieldPaths.length > 6 ? (
            <li className="font-mono text-[10px] opacity-75">… +{fieldPaths.length - 6}</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
