/**
 * C.42 — Garde CI : sort en erreur si runs d’enrichissement bloqués (PENDING/RUNNING sans fin > 2 h).
 *
 * @example
 * npx tsx scripts/check-enrichment-run-alerts.ts
 * npx tsx scripts/check-enrichment-run-alerts.ts --fail-on-warning
 */
import prisma from '../lib/prisma'
import {
  computeEnrichmentRunAlertLevel,
  FAILED_ENRICHMENT_LOOKBACK_MS,
  STALE_ENRICHMENT_RUN_MS,
} from '../lib/enrichment-run-alerts'

async function main() {
  const failOnWarning = process.argv.includes('--fail-on-warning')
  const now = Date.now()
  const staleCutoff = new Date(now - STALE_ENRICHMENT_RUN_MS)
  const failedLookbackStart = new Date(now - FAILED_ENRICHMENT_LOOKBACK_MS)

  try {
    const [staleCount, recentBadCount, lastRun] = await Promise.all([
      prisma.enrichmentRun.count({
        where: {
          finishedAt: null,
          status: { in: ['PENDING', 'RUNNING'] },
          startedAt: { lt: staleCutoff },
        },
      }),
      prisma.enrichmentRun.count({
        where: {
          status: { in: ['FAILED', 'PARTIAL'] },
          startedAt: { gte: failedLookbackStart },
        },
      }),
      prisma.enrichmentRun.findFirst({
        orderBy: { startedAt: 'desc' },
        select: { id: true, status: true, startedAt: true },
      }),
    ])

    const level = computeEnrichmentRunAlertLevel({
      staleRunCount: staleCount,
      recentFailedOrPartialCount: recentBadCount,
      lastRunStatus: lastRun?.status ?? null,
    })

    const payload = {
      level,
      staleRunCount: staleCount,
      recentFailedOrPartialCount: recentBadCount,
      lastRunId: lastRun?.id ?? null,
      lastRunStatus: lastRun?.status ?? null,
    }
    console.log(`[check-enrichment-run-alerts] ${JSON.stringify(payload)}`)

    if (level === 'critical') {
      console.error('[check-enrichment-run-alerts] CRITICAL: stale enrichment runs (no finish after threshold).')
      process.exitCode = 1
    } else if (level === 'warning' && failOnWarning) {
      console.error('[check-enrichment-run-alerts] WARNING treated as failure (--fail-on-warning).')
      process.exitCode = 1
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
