import { NextResponse } from 'next/server'

import { getAdminUser } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

/** Résumé admin : dernier run, nombre de sources, nombre d’observations. */
export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const [lastRun, sourceCount, observationCount] = await Promise.all([
      prisma.enrichmentRun.findFirst({ orderBy: { startedAt: 'desc' } }),
      prisma.intelligenceSource.count(),
      prisma.countryObservation.count(),
    ])
    return NextResponse.json({
      lastRun,
      sourceCount,
      observationCount,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json(
      { error: 'Intelligence tables unavailable', detail: message },
      { status: 503 },
    )
  }
}
