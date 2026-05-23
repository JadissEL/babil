import { describe, expect, it } from 'vitest';
import { lineageLabel, readFieldLineage, stampPromotionLineage } from './promotion-lineage';

describe('promotion-lineage', () => {
  it('stamps field_lineage on full_data._intelligence', () => {
    const full: Record<string, unknown> = {};
    stampPromotionLineage(full, [
      {
        fieldPath: 'economy.gdp_usd_current',
        observationId: 'obs_1',
        sourceSlug: 'world_bank_open_data',
        confidence: 0.9,
        verificationStatus: 'verified',
        observedAt: new Date('2026-01-01'),
      },
    ]);
    const entry = readFieldLineage(full, 'economy.gdp_usd_current');
    expect(entry?.observationId).toBe('obs_1');
    expect(lineageLabel(entry)).toContain('world_bank');
  });
});
