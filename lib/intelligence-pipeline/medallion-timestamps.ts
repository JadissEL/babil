/**
 * Medallion layer timestamps on Country.full_data._intelligence (audit / lineage UX).
 * @see https://datalake.blog/blog/medallion-architecture-bronze-silver-gold
 */

import { parseCountryFullData } from '@/lib/country-full-data-json';
import prisma from '@/lib/prisma';

export type MedallionLayer = 'bronze' | 'silver' | 'gold';

export type MedallionTimestamps = {
  last_bronze_ingest_at?: string;
  last_silver_validated_at?: string;
  last_gold_materialized_at?: string;
  medallion_layer_last?: MedallionLayer;
};

function readIntel(full: Record<string, unknown>): Record<string, unknown> {
  return (full._intelligence ?? {}) as Record<string, unknown>;
}

export function readMedallionTimestamps(full: Record<string, unknown>): MedallionTimestamps {
  const intel = readIntel(full);
  const layer = intel.medallion_layer_last;
  return {
    last_bronze_ingest_at:
      typeof intel.last_bronze_ingest_at === 'string' ? intel.last_bronze_ingest_at : undefined,
    last_silver_validated_at:
      typeof intel.last_silver_validated_at === 'string'
        ? intel.last_silver_validated_at
        : undefined,
    last_gold_materialized_at:
      typeof intel.last_gold_materialized_at === 'string'
        ? intel.last_gold_materialized_at
        : undefined,
    medallion_layer_last:
      layer === 'bronze' || layer === 'silver' || layer === 'gold' ? layer : undefined,
  };
}

async function patchCountryIntelligence(
  countryId: number,
  patch: Record<string, unknown>,
): Promise<void> {
  const row = await prisma.country.findUnique({
    where: { id: countryId },
    select: { full_data: true },
  });
  if (!row) return;
  const full = parseCountryFullData(row.full_data);
  const intel = readIntel(full);
  Object.assign(intel, patch);
  full._intelligence = intel;
  await prisma.country.update({
    where: { id: countryId },
    data: { full_data: JSON.stringify(full) },
  });
}

export async function stampBronzeIngestAt(countryId: number, at = new Date()): Promise<void> {
  await patchCountryIntelligence(countryId, {
    last_bronze_ingest_at: at.toISOString(),
    medallion_layer_last: 'bronze',
  });
}

export async function stampSilverValidatedAt(countryId: number, at = new Date()): Promise<void> {
  await patchCountryIntelligence(countryId, {
    last_silver_validated_at: at.toISOString(),
    medallion_layer_last: 'silver',
  });
}

export function stampGoldMaterializedOnFull(full: Record<string, unknown>, at = new Date()): void {
  const intel = readIntel(full);
  intel.last_gold_materialized_at = at.toISOString();
  intel.medallion_layer_last = 'gold';
  full._intelligence = intel;
}
