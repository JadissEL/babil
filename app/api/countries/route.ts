import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { loadFallbackCountries, type LegacyCountryRecord } from '@/lib/countries-fallback'
import { mapCountriesListToLight } from '@/lib/country-list-light'
import { augmentPrismaCountriesForPublicPayload, buildMergedCountriesList } from '@/lib/countries-prisma-merge'

function parseLightMode(req: Request): boolean {
  const v = new URL(req.url).searchParams.get('light')
  return v === '1' || v === 'true' || v === 'yes'
}

function maybeLightList(light: boolean, rows: LegacyCountryRecord[]): LegacyCountryRecord[] {
  return light ? mapCountriesListToLight(rows) : rows
}

export async function GET(req: Request) {
  const light = parseLightMode(req)

  try {
    const merged = await buildMergedCountriesList()
    if (merged.length > 0) return NextResponse.json(maybeLightList(light, merged))
  } catch {
    /* fallback below */
  }

  try {
    const staticList = await loadFallbackCountries()
    if (staticList.length > 0) return NextResponse.json(maybeLightList(light, staticList))
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

    return NextResponse.json(maybeLightList(light, formatted as LegacyCountryRecord[]))
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'List failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
