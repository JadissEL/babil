import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { loadFallbackCountries } from '@/lib/countries-fallback'

function parseFullData(value: unknown) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

export async function GET() {
  // Primary dataset for public explorer: static JSON enriched to broad coverage.
  // Keeps the app usable even when hosted DB is partially populated.
  try {
    const fallback = await loadFallbackCountries()
    if (fallback.length > 0) return NextResponse.json(fallback)
  } catch {}

  try {
    const countries = await prisma.country.findMany({
      include: {
        comments: {
          where: { status: 'APPROVED' },
          include: { user: true }
        }
      }
    });

    const formatted = countries.map((c: any) => ({
      ...c,
      full_data: parseFullData(c.full_data)
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
