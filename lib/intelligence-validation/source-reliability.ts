/**
 * Dynamic source reliability from agreement outcomes (FitGap-style source scoring).
 */

import type { IntelligenceSourceTier } from '@prisma/client';
import prisma from '@/lib/prisma';
import { tierRank } from '@/lib/intelligence-pipeline/merge-observations';

const CACHE_MS = 10 * 60_000;
let cache: { at: number; scores: Map<string, number> } | null = null;

function baseScoreForTier(tier: IntelligenceSourceTier): number {
  switch (tier) {
    case 'TIER_A_OFFICIAL':
      return 1;
    case 'TIER_B_MULTILATERAL':
      return 0.82;
    case 'TIER_C_CURATED':
      return 0.55;
    default:
      return 0.4;
  }
}

/**
 * Score 0.4–1.0: tier prior + share of non-disputed observations per slug.
 */
export async function loadSourceReliabilityScores(): Promise<Map<string, number>> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.scores;

  const sources = await prisma.intelligenceSource.findMany({
    select: { id: true, slug: true, tier: true },
  });
  const bySource = await prisma.countryObservation.groupBy({
    by: ['sourceId', 'verificationStatus'],
    _count: { _all: true },
  });

  const totals = new Map<string, { ok: number; bad: number }>();
  for (const row of bySource) {
    const cur = totals.get(row.sourceId) ?? { ok: 0, bad: 0 };
    const n = row._count._all;
    if (row.verificationStatus === 'disputed') cur.bad += n;
    else if (row.verificationStatus === 'verified' || row.verificationStatus === 'estimated') {
      cur.ok += n;
    }
    totals.set(row.sourceId, cur);
  }

  const scores = new Map<string, number>();
  for (const s of sources) {
    const t = totals.get(s.id);
    let agreement = 0.7;
    if (t && t.ok + t.bad > 0) {
      agreement = t.ok / (t.ok + t.bad);
    }
    const tierPrior = 1 - tierRank(s.tier) * 0.12;
    scores.set(s.slug, Math.min(1, Math.max(0.4, tierPrior * 0.5 + agreement * 0.5)));
  }

  cache = { at: Date.now(), scores };
  return scores;
}

export function reliabilityBoost(
  confidence: number,
  sourceSlug: string,
  scores: Map<string, number>,
): number {
  const mult = scores.get(sourceSlug) ?? 0.7;
  return Math.min(1, confidence * mult);
}

export function resetSourceReliabilityCacheForTests(): void {
  cache = null;
}
