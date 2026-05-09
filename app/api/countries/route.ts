import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { loadFallbackCountries, type LegacyCountryRecord } from '@/lib/countries-fallback'
import { mapCountriesListToLight } from '@/lib/country-list-light'
import {
  paginateCountriesByStableId,
  parseCountriesListPagination,
  type CountriesListPaginationMode,
} from '@/lib/countries-list-pagination'
import { augmentPrismaCountriesForPublicPayload, buildMergedCountriesList } from '@/lib/countries-prisma-merge'
import { COUNTRIES_LIST_CACHE_CONTROL } from '@/lib/public-api-cache'

/**
 * Public countries list.
 *
 * - **`?light=1`** — strip `full_data` and `commentaires` for lighter payloads (see `mapCountriesListToLight`).
 * - **Pagination (optional):** `?limit=1..200` with optional `?cursor=<country id>` (exclusive).
 *   Response shape: `{ items, nextCursor, hasMore }`. Omit `limit` to keep the legacy **array** body.
 *
 * @see {@link COUNTRIES_LIST_CACHE_CONTROL} — edge caching for anonymous reads.
 */
function parseLightMode(req: Request): boolean {
  const v = new URL(req.url).searchParams.get('light')
  return v === '1' || v === 'true' || v === 'yes'
}

function maybeLightList(light: boolean, rows: LegacyCountryRecord[]): LegacyCountryRecord[] {
  return light ? mapCountriesListToLight(rows) : rows
}

const listCacheHeaders = { 'Cache-Control': COUNTRIES_LIST_CACHE_CONTROL }

function respondCountriesList(rows: LegacyCountryRecord[], light: boolean, pagination: CountriesListPaginationMode) {
  if (pagination.mode === 'full') {
    return NextResponse.json(maybeLightList(light, rows), { headers: listCacheHeaders })
  }
  const { limit, cursor } = pagination
  const { items, nextCursor, hasMore } = paginateCountriesByStableId(rows, limit, cursor)
  return NextResponse.json(
    {
      items: maybeLightList(light, items),
      nextCursor,
      hasMore,
    },
    { headers: listCacheHeaders },
  )
}

export async function GET(req: Request) {
  const light = parseLightMode(req)
  const parsed = parseCountriesListPagination(new URL(req.url).searchParams)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }
  const pagination = parsed.query

  try {
    const merged = await buildMergedCountriesList()
    if (merged.length > 0) return respondCountriesList(merged, light, pagination)
  } catch {
    /* fallback below */
  }

  try {
    const staticList = await loadFallbackCountries()
    if (staticList.length > 0) return respondCountriesList(staticList, light, pagination)
  } catch {
    /* last resort: raw Prisma (no static JSON merge; comments included) */
  }

  try {
    const countries = await prisma.country.findMany({
      orderBy: { id: 'asc' },
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

    return respondCountriesList(formatted as LegacyCountryRecord[], light, pagination)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'List failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
