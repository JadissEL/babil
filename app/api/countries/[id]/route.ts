import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { loadFallbackCountries } from '@/lib/countries-fallback'
import { augmentCountryDetailPayload } from '@/lib/countries-prisma-merge'
import { COUNTRY_DETAIL_CACHE_CONTROL } from '@/lib/public-api-cache'
import { getObservationConfidenceAggregateForCountry } from '@/lib/country-observation-confidence-db'
import { analyzeEconomyIndicatorsAnomalies } from '@/lib/intelligence-data-anomalies'
import { fetchObservationJumpAnomaliesForCountry } from '@/lib/intelligence-data-anomalies-db'
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
      try {
        const fd = payload.full_data
        const economy =
          fd && typeof fd === 'object' && !Array.isArray(fd)
            ? (fd as Record<string, unknown>).economy
            : undefined
        const econBlock =
          economy && typeof economy === 'object' && !Array.isArray(economy)
            ? (economy as Record<string, unknown>)
            : undefined
        const fromSheet = analyzeEconomyIndicatorsAnomalies(econBlock)
        let fromJumps: Awaited<ReturnType<typeof fetchObservationJumpAnomaliesForCountry>> = []
        try {
          fromJumps = await fetchObservationJumpAnomaliesForCountry(country.id)
        } catch {
          /* ignore */
        }
        const dataQualityAnomalies = [...fromSheet, ...fromJumps]
        if (dataQualityAnomalies.length) {
          payload = { ...payload, dataQualityAnomalies }
        }
      } catch {
        /* ne pas bloquer la fiche */
      }
      if (intelligence) {
        try {
          const intelligence_provenance = await getIntelligenceProvenanceForCountry(country.id)
          payload = { ...payload, intelligence_provenance }
        } catch {
          payload = { ...payload, intelligence_provenance: [] }
        }
      }
      return NextResponse.json(payload, {
        headers: { 'Cache-Control': COUNTRY_DETAIL_CACHE_CONTROL },
      })
    }
  } catch {
    /* Missing DATABASE_URL, DB down, etc. — serve static JSON like pre-Prisma deploys. */
  }

  try {
    const fallback = await loadFallbackCountries()
    const country = fallback.find((c) => c.id === id)
    if (country)
      return NextResponse.json(country, {
        headers: { 'Cache-Control': COUNTRY_DETAIL_CACHE_CONTROL },
      })
  } catch {
    /* 404 below */
  }

  return NextResponse.json({ error: 'Country not found' }, { status: 404 })
}
