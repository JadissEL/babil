import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseCountryFullData } from '@/lib/country-full-data-json'
import { loadFallbackCountries } from '@/lib/countries-fallback'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number.parseInt(params.id, 10)
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid country id' }, { status: 400 })
  }

  // Primary source: static enriched dataset aligned with /api/countries
  try {
    const fallback = await loadFallbackCountries()
    const country = fallback.find((c) => c.id === id)
    if (country) return NextResponse.json(country)
  } catch {}

  try {
    const country = await prisma.country.findUnique({
      where: { id },
      include: {
        comments: {
          where: { status: 'APPROVED' },
          include: {
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!country) {
      return NextResponse.json({ error: 'Country not found' }, { status: 404 });
    }

    const formattedCountry = {
      ...country,
      full_data: parseCountryFullData(country.full_data)
    };

    return NextResponse.json(formattedCountry);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
