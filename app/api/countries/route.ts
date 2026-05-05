import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { loadFallbackCountries, type LegacyCountryRecord } from '@/lib/countries-fallback'
import { augmentPrismaCountriesForPublicPayload, buildMergedCountriesList } from '@/lib/countries-prisma-merge'

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

    let mergeFallback: LegacyCountryRecord[] = []
    try {
      mergeFallback = await loadFallbackCountries()
    } catch {
      mergeFallback = []
    }
    const formatted = augmentPrismaCountriesForPublicPayload(
      countries as unknown as Array<Record<string, unknown>>,
      mergeFallback,
    )

    return NextResponse.json(formatted)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'List failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
