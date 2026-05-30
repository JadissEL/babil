/**
 * Handlers for source_discovery, deep_collect, pdf_extract, link_follow, change_detect jobs.
 */

import prisma from '@/lib/prisma'
import { runDeepCollectForSource } from '@/lib/connectors/deep-collect'
import { extractPdfPagesAsObservations } from '@/lib/connectors/pdf-extract'
import { runIloStubCollect } from '@/lib/connectors/ilo-stub'
import { mapSourceSite } from '@/lib/source-discovery'
import { runChangeDetectBatch } from '@/lib/source-change-detection'
import type { IntelligenceJobPayload } from './job-kinds'

export async function runSourceDiscoveryJob(
  payload: IntelligenceJobPayload,
): Promise<{ status: 'SUCCEEDED' | 'FAILED'; result: unknown; errorSummary?: string }> {
  const sourceId = payload.sourceId
  if (!sourceId) {
    return { status: 'FAILED', result: null, errorSummary: 'source_discovery requires sourceId' }
  }
  const result = await mapSourceSite(sourceId)
  return {
    status: result.status === 'failed' ? 'FAILED' : 'SUCCEEDED',
    result,
    errorSummary: result.errorSummary,
  }
}

export async function runDeepCollectJob(
  payload: IntelligenceJobPayload,
): Promise<{ status: 'SUCCEEDED' | 'FAILED'; result: unknown; errorSummary?: string }> {
  const sourceId = payload.sourceId
  const countryId = payload.countryId
  if (!sourceId || countryId == null) {
    return {
      status: 'FAILED',
      result: null,
      errorSummary: 'deep_collect requires sourceId and countryId',
    }
  }
  const run = await prisma.enrichmentRun.create({
    data: { status: 'RUNNING', trigger: payload.trigger ?? 'job:deep_collect' },
  })
  try {
    const out = await runDeepCollectForSource({
      sourceId,
      countryId,
      runId: run.id,
    })
    await prisma.enrichmentRun.update({
      where: { id: run.id },
      data: { status: 'SUCCEEDED', finishedAt: new Date(), statsJson: JSON.stringify(out) },
    })
    return { status: 'SUCCEEDED', result: out }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await prisma.enrichmentRun.update({
      where: { id: run.id },
      data: { status: 'FAILED', finishedAt: new Date(), errorSummary: msg },
    })
    return { status: 'FAILED', result: null, errorSummary: msg }
  }
}

export async function runPdfExtractJob(
  payload: IntelligenceJobPayload,
): Promise<{ status: 'SUCCEEDED' | 'FAILED'; result: unknown; errorSummary?: string }> {
  const sourceId = payload.sourceId
  const countryId = payload.countryId
  if (!sourceId || countryId == null) {
    return {
      status: 'FAILED',
      result: null,
      errorSummary: 'pdf_extract requires sourceId and countryId',
    }
  }
  const pdfs = await prisma.sourcePageIndex.findMany({
    where: { sourceId, pageType: 'pdf' },
    take: 32,
    select: { url: true },
  })
  const run = await prisma.enrichmentRun.create({
    data: { status: 'RUNNING', trigger: payload.trigger ?? 'job:pdf_extract' },
  })
  const out = await extractPdfPagesAsObservations({
    countryId,
    sourceId,
    runId: run.id,
    pdfUrls: pdfs.map((p) => p.url),
  })
  await prisma.enrichmentRun.update({
    where: { id: run.id },
    data: { status: 'SUCCEEDED', finishedAt: new Date(), statsJson: JSON.stringify(out) },
  })
  return { status: 'SUCCEEDED', result: out }
}

export async function runLinkFollowJob(
  payload: IntelligenceJobPayload,
): Promise<{ status: 'SUCCEEDED' | 'FAILED'; result: unknown; errorSummary?: string }> {
  const sourceId = payload.sourceId
  const countryId = payload.countryId ?? 1
  if (!sourceId) {
    return { status: 'FAILED', result: null, errorSummary: 'link_follow requires sourceId' }
  }
  const run = await prisma.enrichmentRun.create({
    data: { status: 'RUNNING', trigger: payload.trigger ?? 'job:link_follow' },
  })
  const source = await prisma.intelligenceSource.findUnique({ where: { id: sourceId } })
  if (source) {
    await runIloStubCollect({ countryId, sourceId, runId: run.id })
  }
  await prisma.enrichmentRun.update({
    where: { id: run.id },
    data: { status: 'SUCCEEDED', finishedAt: new Date() },
  })
  return { status: 'SUCCEEDED', result: { enqueued: 'ilo_stub' } }
}

export async function runChangeDetectJob(
  payload: IntelligenceJobPayload,
): Promise<{ status: 'SUCCEEDED' | 'FAILED'; result: unknown; errorSummary?: string }> {
  const out = await runChangeDetectBatch({
    sourceId: payload.sourceId,
    limit: 50,
  })
  return { status: 'SUCCEEDED', result: out }
}
