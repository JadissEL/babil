import { showConsultantMarketplaceNav } from '@/lib/consultant-nav';
import prisma from '@/lib/prisma';
import { getObjectiveBySlug } from '@/lib/user-objectives/registry';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

function parseGender(raw: string | null): 'MALE' | 'FEMALE' | 'ALL' | null {
  if (!raw || raw === 'all') return 'ALL';
  const u = raw.toLowerCase();
  if (u === 'male' || u === 'homme') return 'MALE';
  if (u === 'female' || u === 'femme') return 'FEMALE';
  if (u === 'unspecified' || u === 'indifferent') return 'ALL';
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const objectiveSlug = searchParams.get('objective');
  const def = objectiveSlug ? getObjectiveBySlug(objectiveSlug) : null;
  if (objectiveSlug && !showConsultantMarketplaceNav(def)) {
    return Response.json({ experts: [], hiddenForTourism: true });
  }

  const interest = searchParams.get('interest')?.trim().toLowerCase() ?? '';
  const maxPriceEur = searchParams.get('maxPriceEur');
  const maxPriceCents = maxPriceEur ? Math.round(Number(maxPriceEur) * 100) : null;
  const minStars = searchParams.get('minStars');
  const minRating = minStars != null && minStars !== '' ? Number(minStars) : null;
  const genderFilter = parseGender(searchParams.get('gender'));

  if (genderFilter === null) {
    return Response.json({ error: 'Invalid gender filter' }, { status: 400 });
  }

  if (minRating != null && (Number.isNaN(minRating) || minRating < 0 || minRating > 5)) {
    return Response.json({ error: 'Invalid minStars' }, { status: 400 });
  }

  if (maxPriceCents != null && (Number.isNaN(maxPriceCents) || maxPriceCents < 0)) {
    return Response.json({ error: 'Invalid maxPriceEur' }, { status: 400 });
  }

  const experts = await prisma.consultantExpert.findMany({
    where: { active: true },
    orderBy: [{ averageRating: 'desc' }, { displayName: 'asc' }],
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
    },
  });

  const now = new Date();
  const filtered = experts.filter((e) => {
    if (genderFilter === 'MALE' && e.gender !== 'MALE' && e.gender !== 'UNSPECIFIED') return false;
    if (genderFilter === 'FEMALE' && e.gender !== 'FEMALE' && e.gender !== 'UNSPECIFIED')
      return false;
    if (minRating != null && e.averageRating < minRating) return false;
    if (maxPriceCents != null) {
      const cheapest = Math.min(e.price30MinCents, e.price60MinCents);
      if (cheapest > maxPriceCents) return false;
    }
    if (interest) {
      const hay = [...e.specialties, e.title ?? '', e.bio].join(' ').toLowerCase();
      if (!hay.includes(interest)) return false;
    }
    return true;
  });

  const withAvailability = await Promise.all(
    filtered.map(async (e) => {
      const count = await prisma.consultantSlot.count({
        where: {
          expertId: e.id,
          startUtc: { gt: now },
          booking: { is: null },
        },
      });
      return { ...e, upcomingSlots: count };
    }),
  );

  return Response.json({ experts: withAvailability });
}
