#!/usr/bin/env tsx
/**
 * Enqueue source_discovery jobs for gated sources still pending discovery.
 * Usage: npx tsx scripts/intelligence-enqueue-discovery-batch.ts [--limit=20]
 */
import prisma from '@/lib/prisma'
import { enqueueIntelligenceJob } from '@/lib/intelligence-pipeline/enqueue-intelligence-job'
import { INTELLIGENCE_JOB_KINDS } from '@/lib/intelligence-pipeline/job-kinds'

async function main() {
  const limitArg = process.argv.find((a) => a.startsWith('--limit='))
  const limit = limitArg ? Number(limitArg.split('=')[1]) : 20

  const sources = await prisma.intelligenceSource.findMany({
    where: {
      requiresDiscoveryGate: true,
      discoveryStatus: { in: ['pending', 'failed'] },
      baseUrl: { not: null },
    },
    take: limit,
    select: { id: true, slug: true },
  })

  let created = 0
  let skipped = 0
  for (const s of sources) {
    const out = await enqueueIntelligenceJob({
      kind: INTELLIGENCE_JOB_KINDS.source_discovery,
      payload: { sourceId: s.id, trigger: 'batch:discovery' },
      priority: 1,
    })
    if (out.created) created++
    else skipped++
  }

  console.log(
    JSON.stringify({ candidates: sources.length, enqueued: created, skipped }, null, 2),
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
