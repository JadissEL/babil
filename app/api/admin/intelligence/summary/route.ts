import { NextResponse } from 'next/server'

import { getAdminUser } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

function parseStatsJson(raw: string | null | undefined): unknown {
  if (!raw || raw.trim() === '') return null
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

/** Résumé admin : dernier run, sources, observations, répartition par fieldPath. */
export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const [lastRun, sourceCount, observationCount, observationsByField] = await Promise.all([
      prisma.enrichmentRun.findFirst({ orderBy: { startedAt: 'desc' } }),
      prisma.intelligenceSource.count(),
      prisma.countryObservation.count(),
      prisma.countryObservation.groupBy({
        by: ['fieldPath'],
        _count: { fieldPath: true },
        orderBy: { _count: { fieldPath: 'desc' } },
        take: 24,
      }),
    ])

    const fieldPathBreakdown = observationsByField.map((r) => ({
      fieldPath: r.fieldPath,
      count: r._count.fieldPath,
    }))

    const lastRunParsed = lastRun
      ? {
          ...lastRun,
          stats: parseStatsJson(lastRun.statsJson),
        }
      : null

    return NextResponse.json({
      lastRun: lastRunParsed,
      sourceCount,
      observationCount,
      fieldPathBreakdown,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json(
      { error: 'Intelligence tables unavailable', detail: message },
      { status: 503 },
    )
  }
}
