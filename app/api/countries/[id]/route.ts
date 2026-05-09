import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { loadFallbackCountries } from '@/lib/countries-fallback'
import { augmentCountryDetailPayload } from '@/lib/countries-prisma-merge'
import { getObservationConfidenceAggregateForCountry } from '@/lib/country-observation-confidence-db'
import { getIntelligenceProvenanceForCountry } from '@/lib/intelligence-pipeline/provenance'

export async function GET(
  req: Request,
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
        insights: {
          orderBy: { id: 'desc' },
          take: 25,
        },
      },
    })

    if (country) {
      let fallback: Awaited<ReturnType<typeof loadFallbackCountries>> = []
      try {
        fallback = await loadFallbackCountries()
      } catch {
        /* DB-only merge + normalize */
      }
      const url = new URL(req.url)
      const intelligence = url.searchParams.get('intelligence') === '1'
      let payload: Record<string, unknown> = augmentCountryDetailPayload(country, fallback)
      try {
        const observationConfidenceAggregate = await getObservationConfidenceAggregateForCountry(country.id)
        if (observationConfidenceAggregate) {
          payload = { ...payload, observationConfidenceAggregate }
        }
      } catch {
        /* DB indisponible ou requête refusée — ne pas bloquer la fiche pays. */
      }
      if (intelligence) {
        try {
          const intelligence_provenance = await getIntelligenceProvenanceForCountry(country.id)
          payload = { ...payload, intelligence_provenance }
        } catch {
          payload = { ...payload, intelligence_provenance: [] }
        }
      }
      return NextResponse.json(payload)
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
