import { describe, expect, it } from 'vitest';
import {
  buildCountryIntelligenceSemanticItems,
  disputedFieldPathsFromFull,
  lineageMetaForFullDataPath,
} from './intelligence-lineage-display';
import { stampPromotionLineage } from './intelligence-validation/promotion-lineage';
import { FIELD_ECONOMY_GDP_USD_CURRENT } from './intelligence-pipeline/taxonomy-v1';

describe('intelligence-lineage-display', () => {
  it('reads lineage meta for economy.gdp_usd', () => {
    const full: Record<string, unknown> = { economy: { gdp_usd: 1e12 } };
    stampPromotionLineage(full, [
      {
        fieldPath: FIELD_ECONOMY_GDP_USD_CURRENT,
        observationId: 'obs1',
        sourceSlug: 'world_bank_open_data',
        confidence: 0.91,
        verificationStatus: 'verified',
        observedAt: new Date('2026-01-15'),
      },
    ]);
    const meta = lineageMetaForFullDataPath(full, 'economy.gdp_usd');
    expect(meta?.sourceSlug).toBe('world_bank_open_data');
    expect(meta?.confidence).toBe(0.91);
  });

  it('builds semantic strip with provenance labels', () => {
    const full: Record<string, unknown> = {
      economy: { gdp_usd: 500 },
      _intelligence: { economy_materialized_at: new Date().toISOString() },
    };
    stampPromotionLineage(full, [
      {
        fieldPath: FIELD_ECONOMY_GDP_USD_CURRENT,
        observationId: 'x',
        sourceSlug: 'world_bank_open_data',
        confidence: 0.8,
        verificationStatus: 'verified',
        observedAt: new Date(),
      },
    ]);
    const items = buildCountryIntelligenceSemanticItems(full);
    const gdp = items.find((i) => i.path === 'economy.gdp_usd');
    expect(gdp?.meta?.provenanceLabel).toContain('world_bank');
  });

  it('lists disputed paths from full_data', () => {
    const full = { _intelligence: { disputed_field_paths: ['economy.gdp_usd_current'] } };
    expect(disputedFieldPathsFromFull(full)).toEqual(['economy.gdp_usd_current']);
  });
});
