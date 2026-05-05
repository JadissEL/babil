import { NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'

import { getAdminUser } from '@/lib/admin-auth'
import { materializePublicFullData } from '@/lib/country-full-data-materialize'
import { hasCuratedHighlightByCountryName } from '@/lib/country-highlights'
import { hasCountryPhdStoredData } from '@/lib/country-phd-studies'
import prisma from '@/lib/prisma'
import { isDbUnavailable } from '@/lib/db-resilience'

type TaskStatus = 'queued' | 'running' | 'done' | 'failed'
type ResearchTask = {
  id: string
  status: TaskStatus
  nextRunAt: string
  country?: string
  domain?: string
  query?: string
  lastError?: string
  completenessScore?: number
  missingCritical?: string[]
}

function summarizeTasks(tasks: ResearchTask[]) {
  const queued = tasks.filter((t) => t.status === 'queued').length
  const running = tasks.filter((t) => t.status === 'running').length
  const done = tasks.filter((t) => t.status === 'done').length
  const failed = tasks.filter((t) => t.status === 'failed').length
  return { queued, running, done, failed, total: tasks.length }
}

function topFailedTasks(tasks: ResearchTask[], limit = 5) {
  return tasks
    .filter((t) => t.status === 'failed')
    .slice(0, limit)
    .map((t) => ({
      id: t.id,
      country: t.country || 'Unknown',
      domain: t.domain || 'unknown',
      query: t.query || '',
      error: t.lastError || 'Unknown error',
    }))
}

function nextQueuedTasks(tasks: ResearchTask[], limit = 5) {
  return tasks
    .filter((t) => t.status === 'queued')
    .sort((a, b) => new Date(a.nextRunAt).getTime() - new Date(b.nextRunAt).getTime())
    .slice(0, limit)
    .map((t) => ({
      id: t.id,
      country: t.country || 'Unknown',
      domain: t.domain || 'unknown',
      query: t.query || '',
      nextRunAt: t.nextRunAt,
    }))
}

function lowestCompletenessTasks(tasks: ResearchTask[], limit = 5) {
  return tasks
    .filter((t) => typeof t.completenessScore === 'number')
    .sort((a, b) => (a.completenessScore ?? 0) - (b.completenessScore ?? 0))
    .slice(0, limit)
    .map((t) => ({
      id: t.id,
      country: t.country || 'Unknown',
      score: t.completenessScore ?? 0,
      criticalMissing: Array.isArray(t.missingCritical) ? t.missingCritical.length : 0,
      status: t.status,
    }))
}

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let taskSummary = { queued: 0, running: 0, done: 0, failed: 0, total: 0 }
  let failedTasks: Array<{ id: string; country: string; domain: string; query: string; error: string }> = []
  let queuedPreview: Array<{ id: string; country: string; domain: string; query: string; nextRunAt: string }> = []
  let lowestCompleteness: Array<{
    id: string
    country: string
    score: number
    criticalMissing: number
    status: TaskStatus
  }> = []
  let stateStatus: 'ok' | 'missing' | 'invalid' = 'missing'
  let stateGeneratedAt: string | null = null

  const statePath = path.join(process.cwd(), '.agent-state', 'tasks.json')
  try {
    const raw = await fs.readFile(statePath, 'utf8')
    const parsed = JSON.parse(raw) as { tasks?: ResearchTask[]; generatedAt?: string }
    if (Array.isArray(parsed.tasks)) {
      taskSummary = summarizeTasks(parsed.tasks)
      failedTasks = topFailedTasks(parsed.tasks, 5)
      queuedPreview = nextQueuedTasks(parsed.tasks, 5)
      lowestCompleteness = lowestCompletenessTasks(parsed.tasks, 5)
      stateStatus = 'ok'
      stateGeneratedAt = typeof parsed.generatedAt === 'string' ? parsed.generatedAt : null
    } else {
      stateStatus = 'invalid'
    }
  } catch {
    stateStatus = 'missing'
  }

  try {
    const countries = await prisma.country.findMany({
      select: { name: true, full_data: true },
    })
    const now = Date.now()
    const activeThresholdMs = 24 * 60 * 60 * 1000
    let updatedLast24h = 0
    let completenessTotal = 0
    let completenessCount = 0
    let withDataImage = 0
    let withCuratedImage = 0
    let likelyGenericFallback = 0
    let withPhdStudiesData = 0

    for (const c of countries) {
      if (!c.full_data) continue
      try {
        const full = materializePublicFullData(c.full_data)
        const agentMeta = full._agent as { updatedAt?: string; completeness?: { score?: number } } | undefined
        const travelReasons = full.travel_reasons as Array<{ imageUrl?: string }> | undefined
        const ts = agentMeta?.updatedAt
        const completeness = agentMeta?.completeness?.score
        if (typeof completeness === 'number' && Number.isFinite(completeness)) {
          completenessTotal += completeness
          completenessCount += 1
        }

        if (hasCountryPhdStoredData(full)) withPhdStudiesData += 1

        const firstReason = Array.isArray(travelReasons) ? travelReasons[0] : undefined
        const hasDataImage =
          typeof firstReason?.imageUrl === 'string' && firstReason.imageUrl.trim().length > 0
        const hasCurated = hasCuratedHighlightByCountryName(c.name)
        if (hasDataImage) withDataImage += 1
        if (hasCurated) withCuratedImage += 1
        if (!hasDataImage && !hasCurated) likelyGenericFallback += 1

        if (!ts) continue
        const age = now - new Date(ts).getTime()
        if (Number.isFinite(age) && age >= 0 && age <= activeThresholdMs) updatedLast24h += 1
      } catch {
        // ignore malformed per-country payload
      }
    }

    return NextResponse.json({
      stateStatus,
      stateGeneratedAt,
      taskSummary,
      failedTasks,
      queuedPreview,
      lowestCompleteness,
      countriesTotal: countries.length,
      countriesUpdatedLast24h: updatedLast24h,
      avgCompletenessScore:
        completenessCount > 0 ? Math.round(completenessTotal / completenessCount) : null,
      visualCoverage: {
        withDataImage,
        withCuratedImage,
        likelyGenericFallback,
      },
      educationPhd: {
        countriesWithStructuredPhdStudies: withPhdStudiesData,
      },
    })
  } catch (error: unknown) {
    if (isDbUnavailable(error)) {
      return NextResponse.json(
        {
          stateStatus,
          stateGeneratedAt,
          taskSummary,
          failedTasks,
          queuedPreview,
          lowestCompleteness,
          degraded: true,
          error: 'Database temporarily unavailable',
        },
        { status: 503 },
      )
    }
    const message = error instanceof Error ? error.message : 'Failed to read health'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
