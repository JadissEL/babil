import { parseCountryFullData } from '@/lib/country-full-data-json';
import { appendFullDataChangelog } from '@/lib/full-data-changelog';
import {
  buildFieldConsensus,
  canPromoteField,
  type RawObservationRow,
} from '@/lib/intelligence-validation/consensus';
import { stampPromotionLineage } from '@/lib/intelligence-validation/promotion-lineage';
import prisma from '@/lib/prisma';
import {
  compareObservationPrecedence,
  setDeep,
  type ObservationForMerge,
} from './merge-observations';
import { stampGoldMaterializedOnFull } from './medallion-timestamps';
import { INTELLIGENCE_TAXONOMY_VERSION, MATERIALIZE_TARGETS } from './taxonomy-v1';

/**
 * Applique les observations intelligence (économie, population WB, etc.)
 * via merge precedence + optional promotion gate (`onlyPromotable`).
 */
export async function materializeEconomyObservationsForCountry(
  countryId: number,
  opts?: { onlyPromotable?: boolean },
): Promise<boolean> {
  const paths = Object.keys(MATERIALIZE_TARGETS);
  const obs = await prisma.countryObservation.findMany({
    where: { countryId, fieldPath: { in: paths } },
    include: { source: { select: { tier: true, slug: true } } },
    orderBy: { observedAt: 'desc' },
  });
  if (obs.length === 0) return false;

  const byPath = new Map<string, RawObservationRow[]>();
  for (const o of obs) {
    const row: RawObservationRow = {
      id: o.id,
      countryId: o.countryId,
      fieldPath: o.fieldPath,
      valueJson: o.valueJson,
      valueNumeric: o.valueNumeric,
      confidence: o.confidence,
      observedAt: o.observedAt,
      tier: o.source.tier,
      sourceSlug: o.source.slug,
      verificationStatus: o.verificationStatus,
    };
    const list = byPath.get(o.fieldPath) ?? [];
    list.push(row);
    byPath.set(o.fieldPath, list);
  }

  const winners = new Map<string, { valueJson: string; row: RawObservationRow }>();

  for (const [fieldPath, group] of Array.from(byPath.entries())) {
    if (opts?.onlyPromotable) {
      const consensus = buildFieldConsensus(countryId, fieldPath, group);
      if (!canPromoteField(consensus)) continue;
    } else if (group.some((g) => g.verificationStatus === 'disputed')) {
      continue;
    }

    const forMerge: ObservationForMerge[] = group.map((r) => ({
      fieldPath: r.fieldPath,
      valueJson: r.valueJson,
      confidence: r.confidence,
      observedAt: r.observedAt,
      tier: r.tier,
    }));
    const sorted = [...forMerge].sort(compareObservationPrecedence);
    const winnerMerge = sorted[0];
    const winnerRow = group.find((g) => g.valueJson === winnerMerge.valueJson) ?? group[0];
    winners.set(fieldPath, { valueJson: winnerMerge.valueJson, row: winnerRow });
  }

  if (winners.size === 0) return false;

  const row = await prisma.country.findUnique({ where: { id: countryId } });
  if (!row) return false;

  const full = parseCountryFullData(row.full_data);
  let changed = false;
  winners.forEach(({ valueJson, row: winner }, fieldPath) => {
    const target = MATERIALIZE_TARGETS[fieldPath];
    if (!target || target.kind !== 'number') return;
    let num = winner.valueNumeric;
    if (num == null || !Number.isFinite(num)) {
      try {
        const j = JSON.parse(valueJson) as { value?: number };
        if (typeof j.value === 'number' && Number.isFinite(j.value)) num = j.value;
      } catch {
        return;
      }
    }
    if (num == null || !Number.isFinite(num)) return;
    setDeep(full, target.fullDataPath, num);
    changed = true;
  });
  if (!changed) return false;

  setDeep(full, '_intelligence.economy_materialized_at', new Date().toISOString());
  setDeep(full, '_intelligence.taxonomy', INTELLIGENCE_TAXONOMY_VERSION);
  stampGoldMaterializedOnFull(full);

  stampPromotionLineage(
    full,
    Array.from(winners.entries()).map(([fieldPath, { row }]) => ({
      fieldPath,
      observationId: row.id,
      sourceSlug: row.sourceSlug ?? null,
      confidence: row.confidence,
      verificationStatus: row.verificationStatus ?? 'pending',
      observedAt: row.observedAt,
    })),
  );

  const appliedPaths = Array.from(winners.keys()).join(',');
  const withChangelog = appendFullDataChangelog(full, {
    actor: 'pipeline',
    action: 'intelligence.materialize_economy',
    detail: appliedPaths || 'none',
  });

  await prisma.country.update({
    where: { id: countryId },
    data: { full_data: JSON.stringify(withChangelog) },
  });
  return true;
}

export async function materializeEconomyObservationsForAllCountries(opts?: {
  onlyPromotable?: boolean;
}): Promise<{ updated: number }> {
  const rows = await prisma.country.findMany({ select: { id: true } });
  let updated = 0;
  for (const r of rows) {
    if (await materializeEconomyObservationsForCountry(r.id, opts)) updated += 1;
  }
  return { updated };
}
