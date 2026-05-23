import { describe, expect, it } from 'vitest';
import { readMedallionTimestamps, stampGoldMaterializedOnFull } from './medallion-timestamps';

describe('medallion-timestamps', () => {
  it('reads layer timestamps from full_data', () => {
    const full = {
      _intelligence: {
        last_bronze_ingest_at: '2026-01-01T00:00:00.000Z',
        last_silver_validated_at: '2026-01-02T00:00:00.000Z',
      },
    };
    expect(readMedallionTimestamps(full).last_bronze_ingest_at).toContain('2026-01-01');
  });

  it('stamps gold on full record', () => {
    const full: Record<string, unknown> = {};
    stampGoldMaterializedOnFull(full, new Date('2026-03-01T12:00:00.000Z'));
    expect(readMedallionTimestamps(full).last_gold_materialized_at).toContain('2026-03-01');
    expect((full._intelligence as Record<string, unknown>).medallion_layer_last).toBe('gold');
  });
});
