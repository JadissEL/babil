/**
 * C.45 — Traite **un** job PENDING de `IntelligencePipelineJob` (worker long-running).
 * Exécuter en boucle côté Render/cron ou `while npm run intelligence:worker-once; do sleep 60; done` en dev.
 *
 * @example
 * npx tsx scripts/intelligence-pipeline-worker-once.ts
 */
import 'dotenv/config'

import prisma from '../lib/prisma'
import { runEnrichmentPipeline } from '../lib/intelligence-pipeline/run-enrichment-stub'

export type IntelligenceJobPayload = {
  trigger?: string
  worldBank?: boolean
  materializeEconomy?: boolean
  worldBankLimit?: number
  stubMultilateralCollectors?: boolean
}

async function claimNextPendingJob() {
  return prisma.$transaction(async (tx) => {
    const job = await tx.intelligencePipelineJob.findFirst({
      where: { status: 'PENDING' },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    })
    if (!job) return null
    await tx.intelligencePipelineJob.update({
      where: { id: job.id },
      data: { status: 'RUNNING', startedAt: new Date() },
    })
    return job
  })
}

async function main() {
  const job = await claimNextPendingJob()
  if (!job) {
    console.log('[intelligence-pipeline-worker-once] no pending job')
    await prisma.$disconnect()
    return
  }

  let payload: IntelligenceJobPayload
  try {
    payload = JSON.parse(job.payloadJson) as IntelligenceJobPayload
  } catch {
    await prisma.intelligencePipelineJob.update({
      where: { id: job.id },
      data: {
        status: 'FAILED',
        finishedAt: new Date(),
        errorSummary: 'Invalid payloadJson',
      },
    })
    console.error('[intelligence-pipeline-worker-once] invalid JSON payload')
    await prisma.$disconnect()
    process.exit(1)
    return
  }

  console.log(`[intelligence-pipeline-worker-once] job=${job.id} kind=${job.kind}`)

  const result = await runEnrichmentPipeline({
    trigger: payload.trigger ?? `job:${job.kind}`,
    worldBank: payload.worldBank,
    materializeEconomy: payload.materializeEconomy,
    worldBankLimit: payload.worldBankLimit,
    stubMultilateralCollectors: payload.stubMultilateralCollectors,
  })

  const jobFailed = result.status === 'FAILED'
  await prisma.intelligencePipelineJob.update({
    where: { id: job.id },
    data: {
      status: jobFailed ? 'FAILED' : 'SUCCEEDED',
      finishedAt: new Date(),
      errorSummary: result.errorSummary ?? null,
      resultJson: JSON.stringify(result),
    },
  })

  console.log(`[intelligence-pipeline-worker-once] done status=${jobFailed ? 'FAILED' : 'SUCCEEDED'}`)
  await prisma.$disconnect()
  if (jobFailed) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
