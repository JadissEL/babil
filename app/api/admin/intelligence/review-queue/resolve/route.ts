import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin-auth';
import { publicApiErrorMessage } from '@/lib/api-public-error';
import { validateAndTagObservationsForCountry } from '@/lib/intelligence-validation';
import { syncDisputedFieldPathsToCountry } from '@/lib/intelligence-validation/sync-country-disputes';
import prisma from '@/lib/prisma';
import type { ObservationVerificationStatus } from '@prisma/client';

type ResolveBody = {
  observationId: string;
  action: 'verify' | 'dispute' | 'pending';
};

/** HITL: human resolves a single observation verification state. */
export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = (await req.json()) as ResolveBody;
    if (!body.observationId || !body.action) {
      return NextResponse.json({ error: 'observationId and action required' }, { status: 400 });
    }

    const statusMap: Record<ResolveBody['action'], ObservationVerificationStatus> = {
      verify: 'verified',
      dispute: 'disputed',
      pending: 'pending',
    };

    const updated = await prisma.countryObservation.update({
      where: { id: body.observationId },
      data: {
        verificationStatus: statusMap[body.action],
        sourcesConfirmed: body.action === 'verify' ? 2 : 1,
      },
      select: { id: true, countryId: true, fieldPath: true, verificationStatus: true },
    });

    const disputed = await prisma.countryObservation.findMany({
      where: { countryId: updated.countryId, verificationStatus: 'disputed' },
      select: { fieldPath: true },
    });
    await syncDisputedFieldPathsToCountry(
      updated.countryId,
      disputed.map((d) => d.fieldPath),
    );

    const revalidated = await validateAndTagObservationsForCountry(updated.countryId);

    return NextResponse.json({
      ok: true,
      observation: updated,
      revalidated: {
        disputedPaths: revalidated.disputedPaths,
        fields: revalidated.consensus.length,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: publicApiErrorMessage(e, 'Could not resolve observation') },
      { status: 500 },
    );
  }
}
