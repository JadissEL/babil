import prisma from '@/lib/prisma';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const safeSlug = slug.trim().toLowerCase();
  if (!safeSlug) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const expert = await prisma.consultantExpert.findFirst({
    where: { slug: safeSlug, active: true },
    select: {
      id: true,
      slug: true,
      displayName: true,
      title: true,
      bio: true,
      gender: true,
      specialties: true,
      price30MinCents: true,
      price60MinCents: true,
      averageRating: true,
      reviewCount: true,
      slots: {
        where: {
          startUtc: { gt: new Date() },
          booking: { is: null },
        },
        orderBy: { startUtc: 'asc' },
        take: 120,
        select: { id: true, startUtc: true, endUtc: true },
      },
    },
  });

  if (!expert) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json({ expert });
}
