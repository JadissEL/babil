/**
 * Phase 10 — detect contentHash changes on SourcePageIndex and enqueue re-collect.
 */

import { createHash } from 'node:crypto'

import prisma from '@/lib/prisma'
import { enqueueIntelligenceJob } from '@/lib/intelligence-pipeline/enqueue-intelligence-job'
import { INTELLIGENCE_JOB_KINDS } from '@/lib/intelligence-pipeline/job-kinds'
import { logIntelligence } from '@/lib/intelligence-pipeline/intelligence-log'

const FETCH_MS = 12_000

function hashUrlContent(url: string, bodySample: string): string {
  return createHash('sha256').update(`${url}:${bodySample.slice(0, 4000)}`).digest('hex').slice(0, 32)
}

export async function runChangeDetectBatch(args?: {
  sourceId?: string
  limit?: number
}): Promise<{ checked: number; changed: number; enqueued: number }> {
  const pages = await prisma.sourcePageIndex.findMany({
    where: args?.sourceId ? { sourceId: args.sourceId } : undefined,
    take: args?.limit ?? 40,
    orderBy: { lastSeenAt: 'asc' },
  })

  let changed = 0
  let enqueued = 0

  for (const page of pages) {
    let sample = ''
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), FETCH_MS)
      const res = await fetch(page.url, {
        signal: ctrl.signal,
        headers: { 'User-Agent': 'BabilChangeDetect/1.0' },
      })
      clearTimeout(t)
      if (res.ok) sample = await res.text()
    } catch {
      continue
    }

    const nextHash = hashUrlContent(page.url, sample)
    if (page.contentHash && page.contentHash === nextHash) continue

    changed++
    await prisma.sourcePageIndex.update({
      where: { id: page.id },
      data: { contentHash: nextHash, lastSeenAt: new Date() },
    })

    const q = await enqueueIntelligenceJob({
      kind: INTELLIGENCE_JOB_KINDS.deep_collect,
      payload: {
        trigger: 'change_detect',
        sourceId: page.sourceId,
        changeDetectUrl: page.url,
      },
      priority: 2,
    })
    if (q.created) enqueued++
  }

  logIntelligence('info', 'change_detect_batch', {
    checked: pages.length,
    changed,
    enqueued,
  })

  return { checked: pages.length, changed, enqueued }
}
