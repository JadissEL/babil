import { NextResponse } from 'next/server';

import { getAdminUser } from '@/lib/admin-auth';
import { publicApiErrorMessage } from '@/lib/api-public-error';
import prisma from '@/lib/prisma';

/** Liste des sources avec gate discovery (admin). */
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const sources = await prisma.intelligenceSource.findMany({
      where: { requiresDiscoveryGate: true },
      orderBy: [{ discoveryStatus: 'asc' }, { name: 'asc' }],
      take: 200,
      select: {
        id: true,
        slug: true,
        name: true,
        baseUrl: true,
        discoveryStatus: true,
        trustScore: true,
        siteInventory: { select: { status: true, pageCount: true, lastMappedAt: true } },
      },
    });
    return NextResponse.json({ sources, total: sources.length });
  } catch (e) {
    return NextResponse.json(
      { error: publicApiErrorMessage(e, 'Failed to list gated sources') },
      { status: 500 },
    );
  }
}
