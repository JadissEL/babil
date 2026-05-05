import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { parseCountryFullData } from '@/lib/country-full-data-json'
import { loadFallbackCountries } from '@/lib/countries-fallback'
import { mergeDisplayedFullData } from '@/lib/countries-prisma-merge'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const id = Number.parseInt(params.id, 10)
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid country id' }, { status: 400 })
  }

  try {
    const country = await prisma.country.findUnique({
      where: { id },
      include: {
        comments: {
          where: { status: 'APPROVED' },
          include: {
            user: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (country) {
      let full_data = parseCountryFullData(country.full_data)
      try {
        const fallback = await loadFallbackCountries()
        const staticRow = fallback.find((c) => c.id === id)
        const staticFull =
          staticRow?.full_data && typeof staticRow.full_data === 'object' && !Array.isArray(staticRow.full_data)
            ? (staticRow.full_data as Record<string, unknown>)
            : null
        if (staticFull) {
          full_data = mergeDisplayedFullData(staticFull, full_data)
        }
      } catch {
        /* use DB-only full_data */
      }
      return NextResponse.json({
        ...country,
        full_data,
      })
    }
  } catch {
    /* Missing DATABASE_URL, DB down, etc. — serve static JSON like pre-Prisma deploys. */
  }

  try {
    const fallback = await loadFallbackCountries()
    const country = fallback.find((c) => c.id === id)
    if (country) return NextResponse.json(country)
  } catch {
    /* 404 below */
  }

  return NextResponse.json({ error: 'Country not found' }, { status: 404 })
}
