'use client';

import { IntelligenceBlockRenderer } from '@/components/intelligence/IntelligenceBlockRenderer';
import type { SemanticStripItem } from '@/lib/intelligence-lineage-display';
import { resolveUiPatternForPath } from '@/lib/intelligence-ui-registry';

export type { SemanticStripItem } from '@/lib/intelligence-lineage-display';

export function CountryIntelligenceSemanticStrip({ items }: { items: SemanticStripItem[] }) {
  const visible = items.filter((it) => it.value != null && it.value !== '');
  if (visible.length === 0) return null;

  return (
    <section
      aria-label="Indicateurs vérifiés"
      className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      {visible.map((it) => (
        <IntelligenceBlockRenderer
          key={it.path}
          path={it.path}
          value={it.value}
          meta={it.meta}
          pattern={resolveUiPatternForPath(it.path)}
        />
      ))}
    </section>
  );
}
