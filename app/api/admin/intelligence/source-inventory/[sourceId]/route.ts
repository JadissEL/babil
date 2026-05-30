import { NextResponse } from 'next/server';

import { getAdminUser } from '@/lib/admin-auth';
import { publicApiErrorMessage } from '@/lib/api-public-error';
import prisma from '@/lib/prisma';

type RouteContext = { params: Promise<{ sourceId: string }> };

/** GET admin source inventory (Phase 1 discovery). */
export async function GET(_req: Request, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { sourceId } = await context.params;

  try {
    const source = await prisma.intelligenceSource.findUnique({
      where: { id: sourceId },
      include: {
        siteInventory: true,
        pageIndex: { take: 100, orderBy: { lastSeenAt: 'desc' } },
      },
    });
    if (!source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    let informationTypes: string[] = [];
    try {
      informationTypes = JSON.parse(source.informationTypesJson ?? '[]') as string[];
    } catch {
      informationTypes = [];
    }

    let capabilities: Record<string, unknown> | null = null;
    try {
      capabilities = source.capabilitiesJson
        ? (JSON.parse(source.capabilitiesJson) as Record<string, unknown>)
        : null;
    } catch {
      capabilities = null;
    }

    return NextResponse.json({
      source: {
        id: source.id,
        slug: source.slug,
        name: source.name,
        tier: source.tier,
        baseUrl: source.baseUrl,
        discoveryStatus: source.discoveryStatus,
        requiresDiscoveryGate: source.requiresDiscoveryGate,
        trustScore: source.trustScore,
        authorityScore: source.authorityScore,
        reliabilityLevel: source.reliabilityLevel,
        informationTypes,
        capabilities,
      },
      inventory: source.siteInventory,
      pages: source.pageIndex,
      pageIndexTotal: await prisma.sourcePageIndex.count({ where: { sourceId } }),
    });
  } catch (e) {
    return NextResponse.json(
      { error: publicApiErrorMessage(e, 'Source inventory failed') },
      { status: 500 },
    );
  }
}
