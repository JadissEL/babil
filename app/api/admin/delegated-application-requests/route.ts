import { NextResponse } from 'next/server';

import { publicApiErrorMessage } from '@/lib/api-public-error';
import { getAdminUser } from '@/lib/admin-auth';
import {
  maskEmailForAdminList,
  previewDelegatedPayload,
} from '@/lib/delegated-application-payload-utils';
import prisma from '@/lib/prisma';
import { findDelegatedPackage, type DelegatedCategory } from '@/lib/delegated-application-catalog';
import { isDbUnavailable } from '@/lib/db-resilience';

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const rows = await prisma.delegatedApplicationRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 250,
      include: {
        user: { select: { email: true, name: true } },
      },
    });

    const items = rows.map((r) => {
      const pv = previewDelegatedPayload(r.payload);
      const cat =
        r.category === 'job' || r.category === 'university'
          ? (r.category as DelegatedCategory)
          : null;
      const pkg = cat ? findDelegatedPackage(cat, r.packageId) : null;
      return {
        id: r.id,
        category: r.category,
        packageId: r.packageId,
        packageName: pv.packageName ?? pkg?.name ?? r.packageId,
        priceMad: pv.priceMad ?? pkg?.priceMad,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        userEmail: r.user.email,
        userName: r.user.name,
        contactEmailMasked: pv.contactEmail ? maskEmailForAdminList(pv.contactEmail) : null,
        hasFormContactEmail: Boolean(pv.contactEmail),
      };
    });

    return NextResponse.json({ items });
  } catch (error: unknown) {
    if (isDbUnavailable(error))
      return NextResponse.json({ error: 'Database temporarily unavailable' }, { status: 503 });
    const message = publicApiErrorMessage(error, 'List failed');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
