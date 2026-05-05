import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { loadFallbackCountries } from '@/lib/countries-fallback'
import { parseCountryFullData } from '@/lib/country-full-data-json'
import { buildMergedCountriesList } from '@/lib/countries-prisma-merge'

export async function GET() {
  try {
    const merged = await buildMergedCountriesList()
    if (merged.length > 0) return NextResponse.json(merged)
  } catch {
    /* fallback below */
  }

  try {
    const staticList = await loadFallbackCountries()
    if (staticList.length > 0) return NextResponse.json(staticList)
  } catch {
    /* last resort: raw Prisma (no static JSON merge; comments included) */
  }

  try {
    const countries = await prisma.country.findMany({
      include: {
        comments: {
          where: { status: 'APPROVED' },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    const formatted = countries.map((c) => ({
      ...c,
      full_data: parseCountryFullData(c.full_data),
    }))

    return NextResponse.json(formatted)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'List failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
