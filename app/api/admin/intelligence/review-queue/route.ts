import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin-auth';
import { publicApiErrorMessage } from '@/lib/api-public-error';
import { claimFromObservationRow } from '@/lib/intelligence-claims';
import { reviewContradictionsForAdmin } from '@/lib/intelligence-validation/contradiction-llm';
import { buildFieldConsensus } from '@/lib/intelligence-validation/consensus';
import prisma from '@/lib/prisma';

/** HITL review queue: disputed + medium-confidence single-source fields. */
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const disputed = await prisma.countryObservation.findMany({
      where: { verificationStatus: 'disputed' },
      orderBy: { observedAt: 'desc' },
      take: 40,
      include: {
        source: { select: { slug: true, name: true, tier: true } },
        country: { select: { id: true, name: true, region: true } },
      },
    });

    const estimated = await prisma.countryObservation.findMany({
      where: {
        verificationStatus: 'estimated',
        sourcesConfirmed: { lte: 1 },
        confidence: { gte: 0.5, lt: 0.72 },
      },
      orderBy: { observedAt: 'desc' },
      take: 30,
      include: {
        source: { select: { slug: true, name: true, tier: true } },
        country: { select: { id: true, name: true, region: true } },
      },
    });

    const mediumReview = estimated
      .map((o) => {
        const consensus = buildFieldConsensus(o.countryId, o.fieldPath, [
          {
            id: o.id,
            countryId: o.countryId,
            fieldPath: o.fieldPath,
            valueJson: o.valueJson,
            valueNumeric: o.valueNumeric,
            confidence: o.confidence,
            observedAt: o.observedAt,
            tier: o.source.tier,
            sourceSlug: o.source.slug,
          },
        ]);
        return reviewContradictionsForAdmin([consensus])[0];
      })
      .filter(Boolean);

    const needsReview = [
      ...disputed.map((o) => ({
        id: o.id,
        reviewReason: 'disputed' as const,
        claim: claimFromObservationRow(o),
        countryName: o.country.name,
        region: o.country.region,
      })),
      ...estimated.map((o) => ({
        id: o.id,
        reviewReason: 'medium_confidence' as const,
        claim: claimFromObservationRow(o),
        countryName: o.country.name,
        region: o.country.region,
      })),
    ];

    return NextResponse.json({
      disputed: needsReview.filter((r) => r.reviewReason === 'disputed'),
      needsReview,
      mediumConfidenceReview: mediumReview,
      counts: {
        disputed: await prisma.countryObservation.count({
          where: { verificationStatus: 'disputed' },
        }),
        pending: await prisma.countryObservation.count({
          where: { verificationStatus: 'pending' },
        }),
        needsReview: needsReview.length,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: publicApiErrorMessage(e, 'Review queue unavailable') },
      { status: 503 },
    );
  }
}
