import { NextRequest, NextResponse } from 'next/server'

import { publicApiErrorMessage } from '@/lib/api-public-error'
import { runEnrichmentPipeline } from '@/lib/intelligence-pipeline/run-enrichment-stub'

/**
 * Déclenchement planifié du pipeline intelligence (World Bank + matérialisation).
 * Protégé par `CRON_SECRET` : en-tête `Authorization: Bearer <CRON_SECRET>` ou `?secret=`.
 *
 * @see docs/intelligence-cron-and-environments.md — secrets, environnements, reprise (C.51) et `INTELLIGENCE_SOURCE_DISABLED_SLUGS` (C.52).
 *
 * Query :
 * - `mode=full` (défaut) : collecte WB + matérialisation
 * - `mode=materialize` : matérialisation seule (rapide, utile si la collecte tourne ailleurs)
 *
 * Sur Vercel, les exécutions longues peuvent time-out selon le plan ; pour une collecte
 * complète, préférer un job GitHub Actions ou un worker Render avec `npm run intelligence:world-bank:materialize`.
 */
export const runtime = 'nodejs'
export const maxDuration = 300

function authorize(req: NextRequest, secret: string): boolean {
  const auth = req.headers.get('authorization')
  if (auth === `Bearer ${secret}`) return true
  const q = req.nextUrl.searchParams.get('secret')
  return q === secret
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 503 })
  }
  if (!authorize(req, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const mode = req.nextUrl.searchParams.get('mode') ?? 'full'
  const worldBank = mode !== 'materialize'
  const materializeEconomy = true

  try {
    const result = await runEnrichmentPipeline({
      trigger: 'cron',
      worldBank,
      materializeEconomy,
    })
    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json(
      { error: publicApiErrorMessage(e, 'Pipeline run failed') },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
