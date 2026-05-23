'use client';

import type { IntelligenceUiPattern } from '@/lib/intelligence-ui-registry';
import { EconomyStatPanel } from '@/components/intelligence/blocks/EconomyStatPanel';
import { ProvenanceChip } from '@/components/intelligence/blocks/ProvenanceChip';
import { VerifiedUpdatesFeed } from '@/components/intelligence/blocks/VerifiedUpdatesFeed';
import { VisaFrictionAlert } from '@/components/intelligence/blocks/VisaFrictionAlert';

export type IntelligenceBlockProps = {
  path: string;
  value: unknown;
  meta?: {
    confidence?: number;
    verificationStatus?: string;
    sources?: string[];
    label?: string;
    sourceSlug?: string;
    provenanceLabel?: string;
    observedAt?: string;
    materializedAt?: string;
  };
  pattern?: IntelligenceUiPattern | null;
};

export function IntelligenceBlockRenderer({ path, value, meta, pattern }: IntelligenceBlockProps) {
  const p = pattern ?? null;
  if (p === 'economy_stat_panel' && typeof value === 'number') {
    return <EconomyStatPanel path={path} value={value} meta={meta} />;
  }
  if (p === 'visa_friction_alert') {
    return <VisaFrictionAlert path={path} value={value} meta={meta} />;
  }
  if (p === 'provenance_chip') {
    return <ProvenanceChip value={value} meta={meta} />;
  }
  if (p === 'verified_updates_feed') {
    return <VerifiedUpdatesFeed value={value} meta={meta} />;
  }
  return null;
}
