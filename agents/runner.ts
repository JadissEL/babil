import 'dotenv/config'
import { promises as fs } from 'node:fs'
import prisma from '../lib/prisma'
import { parseCountryFullData } from '../lib/country-full-data-json'
import {
  deriveStreetFoodBusinessAccessFromFullData,
  ensureStreetFoodBusinessAccessOnFullData,
} from '../lib/country-street-food-access'
import { syncDrivingRightsIntelIntoFullData } from '../lib/driving-rights-intel'
import { appendFullDataChangelog } from '../lib/full-data-changelog'
import { CONTRACT_VERSION } from '../lib/country-intelligence-contract'
import { isSchengenMember } from '../lib/schengen-members'
import type { CompletenessReport } from '../lib/country-completeness'
import { ALL_COUNTRY_CONTRACT_FIELD_COUNT } from '../lib/country-completeness'
import { tryLoadWorldCountryRunOrderFile } from '../lib/agent-world-country-order'
import {
  buildAgentOrchestrationBlock,
  buildQualityManifestForCritical,
  buildResearchPlanLots,
  evaluateAdvancementGate,
} from '../lib/agent-orchestration'
import {
  appendOrchestrationCycle,
  loadRunMemory,
  saveRunMemory,
} from '../lib/agent-run-memory'
import { buildAgentResearchSourcesPayload } from '../lib/agent-research-sources'
import type { Domain } from '../lib/agent-adaptive-query'
import { resolveAdaptiveQuery } from '../lib/agent-adaptive-query'
import type { CountrySnapshot } from '../lib/agent-country-enrichment-merge'
import {
  buildCountryPayloadForCompleteness,
  runEnrichmentPassLoop,
  type EnrichmentLoopTask,
} from '../lib/agent-enrichment-loop'
import { appendSupervisorMetricEvent } from '../lib/agent-supervisor-metrics'
import { loadChildKnowledge } from '../lib/agent-child-knowledge'
import { maybeBuildCanaryChildFullData, runChildShadowCompare } from '../lib/agent-child-runner'
import { runManifestUrlFetchBatch } from '../lib/agent-manifest-source-fetch'
import type { AgentState, CountryTask, TaskStatus } from './runner-types'
import {
  AGENT_CHILD_MODE,
  AGENT_MANIFEST_FETCH_ENABLED,
  AGENT_MAX_RUNTIME_MS,
  AGENT_STRICT_COUNTRY_GATE,
  AGENT_STRICT_QUALITY_MANIFEST,
  AGENT_VERBOSE_LEVEL,
  COMPLETENESS_TARGET_SCORE,
  MAX_RECURSION_PASSES,
  REFRESH_MS,
  REENRICH_INTERVAL_HOURS,
  RETRY_BASE_DELAY_MS,
  RETRY_MAX_DELAY_MS,
  SEQUENTIAL_WORLD_ORDER_ENABLED,
  STABLE_SCORE_DELTA,
  STABLE_SCORE_MIN_ATTEMPTS,
  STATE_DIR,
  STATE_FILE,
  TASK_TTL_HOURS,
  TICK_MS,
  WORKER_BATCH,
} from './runner-constants'

let memoryState: AgentState = {
  tasks: [],
  generatedAt: new Date().toISOString(),
  contractVersion: CONTRACT_VERSION,
}
let tickInProgress = false
let refreshInProgress = false

function id() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function inferRegion(raw: string): string {
  const v = String(raw || 'Other')
  if (v === 'Europe') return 'Europe'
  if (v === 'Asia') return 'Asia'
  if (v === 'Africa') return 'Africa'
  if (v === 'Americas') return 'Americas'
  if (v === 'Oceania') return 'Oceania'
  return 'Other'
}

function normalizeDomain(domain: unknown): Domain {
  if (domain === 'economy') return 'economy'
  if (domain === 'education') return 'education'
  if (domain === 'business') return 'business'
  if (domain === 'driving') return 'driving'
  if (domain === 'community') return 'community'
  return 'overview'
}

async function loadState() {
  await fs.mkdir(STATE_DIR, { recursive: true })
  try {
    const raw = await fs.readFile(STATE_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Partial<AgentState>
    const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : []
    memoryState = {
      tasks: tasks.map((task) => ({
        id: String(task.id || id()),
        country: String(task.country || ''),
        region: String(task.region || 'Other'),
        domain: normalizeDomain(task.domain),
        query: String(task.query || 'country-first-completion-loop'),
        priority: Number(task.priority || 50),
        attempts: Number(task.attempts || 0),
        pass: Number(task.pass || 0),
        nextRunAt: String(task.nextRunAt || new Date().toISOString()),
        status:
          task.status === 'running' || task.status === 'done' || task.status === 'failed'
            ? task.status
            : 'queued',
        completenessScore: Number(task.completenessScore || 0),
        missingCritical: Array.isArray(task.missingCritical)
          ? task.missingCritical.map((v) => String(v))
          : [],
        lastError: task.lastError ? String(task.lastError) : undefined,
      })),
      generatedAt:
        typeof parsed.generatedAt === 'string' ? parsed.generatedAt : new Date().toISOString(),
      contractVersion:
        typeof parsed.contractVersion === 'string' ? parsed.contractVersion : CONTRACT_VERSION,
      worldOrderCursor:
        typeof parsed.worldOrderCursor === 'number' &&
        Number.isFinite(parsed.worldOrderCursor) &&
        parsed.worldOrderCursor >= 0
          ? Math.floor(parsed.worldOrderCursor)
          : 0,
    }
  } catch {
    memoryState = {
      tasks: [],
      generatedAt: new Date().toISOString(),
      contractVersion: CONTRACT_VERSION,
      worldOrderCursor: 0,
    }
  }
}

async function saveState() {
  memoryState.generatedAt = new Date().toISOString()
  memoryState.contractVersion = CONTRACT_VERSION
  await fs.writeFile(STATE_FILE, JSON.stringify(memoryState, null, 2), 'utf8')
}

async function fetchCountriesSeed() {
  const res = await fetch('https://restcountries.com/v3.1/all?fields=name,region')
  if (!res.ok) throw new Error(`restcountries ${res.status}`)
  const data = (await res.json()) as Array<{ name?: { common?: string }; region?: string }>
  return data
    .map((c) => ({
      country: String(c.name?.common || '').trim(),
      region: inferRegion(String(c.region || 'Other')),
    }))
    .filter((c) => c.country.length > 0)
}

async function resolveScheduleSeeds(): Promise<Array<{ country: string; region: string }>> {
  const fileOrder = await tryLoadWorldCountryRunOrderFile()
  if (fileOrder?.length) return fileOrder
  return fetchCountriesSeed()
}

function getTaskByCountry(country: string) {
  return memoryState.tasks.find((t) => t.country === country && t.status !== 'failed')
}

function enqueueCountry(country: string, region: string) {
  memoryState.tasks.push({
    id: id(),
    country,
    region,
    domain: 'overview',
    query: 'country-first-completion-loop',
    priority: 100,
    attempts: 0,
    pass: 0,
    nextRunAt: new Date().toISOString(),
    status: 'queued',
    completenessScore: 0,
    missingCritical: [],
  })
}

function parseExistingFullData(raw: string | null): Record<string, unknown> {
  return parseCountryFullData(raw)
}

/** Prisma columns used by scoring but sometimes omitted from `full_data` JSON. */
function hydrateAgentFullDataFromPrismaRow(
  fullData: Record<string, unknown>,
  row: { street_food_business_access?: string | null } | null | undefined,
): Record<string, unknown> {
  const top = fullData.street_food_business_access
  const hasTop = typeof top === 'string' && top.trim().length > 0
  if (hasTop) return fullData
  const col = row?.street_food_business_access
  if (typeof col === 'string' && col.trim()) {
    return { ...fullData, street_food_business_access: col.trim() }
  }
  return fullData
}

function nextRetryDelay(attempts: number) {
  const factor = Math.max(0, attempts - 1)
  const delay = RETRY_BASE_DELAY_MS * Math.pow(2, factor)
  return Math.min(delay, RETRY_MAX_DELAY_MS)
}

function summarizeState() {
  const queued = memoryState.tasks.filter((t) => t.status === 'queued').length
  const running = memoryState.tasks.filter((t) => t.status === 'running').length
  const done = memoryState.tasks.filter((t) => t.status === 'done').length
  const failed = memoryState.tasks.filter((t) => t.status === 'failed').length
  return { queued, running, done, failed, total: memoryState.tasks.length }
}

function logVerbose(message: string, data?: Record<string, unknown>) {
  if (AGENT_VERBOSE_LEVEL < 1) return
  if (data) {
    console.log(`[agents:verbose] ${message}`, JSON.stringify(data))
    return
  }
  console.log(`[agents:verbose] ${message}`)
}

function logVerbose2(message: string, data?: Record<string, unknown>) {
  if (AGENT_VERBOSE_LEVEL < 2) return
  if (data) {
    console.log(`[agents:verbose:2] ${message}`, JSON.stringify(data))
    return
  }
  console.log(`[agents:verbose:2] ${message}`)
}

function pickCanonicalTask(current: CountryTask, candidate: CountryTask) {
  const currentScore = Number(current.completenessScore || 0)
  const candidateScore = Number(candidate.completenessScore || 0)
  const statusRank: Record<TaskStatus, number> = {
    running: 4,
    queued: 3,
    done: 2,
    failed: 1,
  }
  if (statusRank[candidate.status] !== statusRank[current.status]) {
    return statusRank[candidate.status] > statusRank[current.status] ? candidate : current
  }
  if (candidateScore !== currentScore) return candidateScore > currentScore ? candidate : current
  if (candidate.attempts !== current.attempts)
    return candidate.attempts > current.attempts ? candidate : current
  return new Date(candidate.nextRunAt).getTime() > new Date(current.nextRunAt).getTime()
    ? candidate
    : current
}

function dedupeCountryTasks() {
  const byCountry = new Map<string, CountryTask>()
  for (const task of memoryState.tasks) {
    const key = task.country.trim().toLowerCase()
    const existing = byCountry.get(key)
    if (!existing) {
      byCountry.set(key, task)
      continue
    }
    byCountry.set(key, pickCanonicalTask(existing, task))
  }
  const deduped = Array.from(byCountry.values())
  const removed = memoryState.tasks.length - deduped.length
  if (removed > 0) {
    memoryState.tasks = deduped
    logVerbose('deduplicated country tasks', { removed, remaining: deduped.length })
  }
}

async function persistOrchestrationAndRunMemory(
  task: CountryTask,
  snapshot: CountrySnapshot,
  report: CompletenessReport,
  sourceHash: string,
): Promise<{ advancementGatePassed: boolean; orchestration: Record<string, unknown> }> {
  const countryPayload = buildCountryPayloadForCompleteness(snapshot, task as EnrichmentLoopTask)
  const { byKey: qualityManifest } = buildQualityManifestForCritical(
    countryPayload as unknown as Record<string, unknown>,
  )
  const gate = evaluateAdvancementGate(report, qualityManifest, {
    strictCountryGate: AGENT_STRICT_COUNTRY_GATE,
    strictQualityManifest: AGENT_STRICT_QUALITY_MANIFEST,
    completenessTarget: COMPLETENESS_TARGET_SCORE,
  })
  const plannerLots = buildResearchPlanLots(report)

  const mem = await loadRunMemory(task.country)
  if (report.criticalMissing.length > 0) {
    mem.improvementCycle += 1
  }
  appendOrchestrationCycle(mem, {
    at: new Date().toISOString(),
    fromPhase: 'collecting',
    toPhase: 'finalized',
    trigger: 'country_task_complete',
    criticalMissingCount: report.criticalMissing.length,
    completenessScore: report.score,
    sourceFingerprint: sourceHash.slice(0, 48),
  })
  mem.currentState = 'finalized'

  let runMemoryRelative: string | null = null
  try {
    const saved = await saveRunMemory(mem)
    runMemoryRelative = saved.relativePath
  } catch (err: unknown) {
    logVerbose('orchestration run memory save failed', {
      country: task.country,
      error: String((err as Error)?.message || err),
    })
  }

  const orchestration = buildAgentOrchestrationBlock({
    phase: 'finalized',
    planEpoch: mem.planEpoch,
    improvementCycle: mem.improvementCycle,
    gate,
    qualityManifest,
    plannerLots,
    runMemoryPath: runMemoryRelative,
    runMemoryCyclesTotal: mem.cycles.length,
  })

  return { advancementGatePassed: gate.passed, orchestration }
}

function taskAsEnrichmentLoop(task: CountryTask): EnrichmentLoopTask {
  return {
    id: task.id,
    country: task.country,
    region: task.region,
    domain: task.domain,
    query: task.query,
    pass: task.pass,
  }
}

async function processCountryTask(task: CountryTask) {
  const schengen = isSchengenMember(task.country)
  const existingRow = await prisma.country.findUnique({
    where: { name: task.country },
    select: {
      full_data: true,
      tourist_visa_score: true,
      study_visa_score: true,
      work_visa_score: true,
      business_visa_score: true,
      appointment_difficulty: true,
      street_food_business_access: true,
    },
  })

  const snapshotInit: CountrySnapshot = {
    fullData: hydrateAgentFullDataFromPrismaRow(
      parseExistingFullData(existingRow?.full_data ?? null),
      existingRow,
    ),
    scalar: {
      tourist_visa_score:
        typeof existingRow?.tourist_visa_score === 'number' ? existingRow.tourist_visa_score : 5.5,
      study_visa_score:
        typeof existingRow?.study_visa_score === 'number' ? existingRow.study_visa_score : 5.5,
      work_visa_score:
        typeof existingRow?.work_visa_score === 'number' ? existingRow.work_visa_score : 5.5,
      business_visa_score:
        typeof existingRow?.business_visa_score === 'number' ? existingRow.business_visa_score : 5.5,
      appointment_difficulty:
        typeof existingRow?.appointment_difficulty === 'string' &&
        existingRow.appointment_difficulty.trim()
          ? existingRow.appointment_difficulty.trim()
          : 'Medium',
    },
  }

  const enrichTask = taskAsEnrichmentLoop(task)
  const { snapshot, reportPayload, sourceHash, passesUsed } = await runEnrichmentPassLoop(
    enrichTask,
    snapshotInit,
    {
      maxPasses: MAX_RECURSION_PASSES,
      completenessTargetScore: COMPLETENESS_TARGET_SCORE,
      recursionMaxPassesMeta: MAX_RECURSION_PASSES,
      onPassMetrics: (m) =>
        logVerbose2('country pass metrics', {
          country: m.country,
          pass: m.pass,
          score: m.score,
          criticalMissing: m.criticalMissing,
        }),
    },
  )

  const orch = await persistOrchestrationAndRunMemory(task, snapshot, reportPayload.report, sourceHash)

  let manifestFetchSummary: Record<string, unknown> | undefined
  if (AGENT_MANIFEST_FETCH_ENABLED) {
    try {
      const memFetch = await loadRunMemory(task.country)
      const mf = await runManifestUrlFetchBatch({
        country: task.country,
        region: task.region,
        memory: memFetch,
        logVerbose,
      })
      await saveRunMemory(memFetch)
      if (mf.skippedReason !== 'no_map_file' || mf.results.length > 0) {
        manifestFetchSummary = {
          mapVersion: mf.mapVersion,
          runAt: new Date().toISOString(),
          totalFetchable: mf.totalFetchable,
          cursor: mf.newCursor,
          skippedReason: mf.skippedReason,
          results: mf.results.map((r) => ({
            categoryId: r.categoryId,
            sourceLabel: r.sourceLabel,
            url: r.url,
            ok: r.ok,
            httpStatus: r.httpStatus,
            skipped: r.skipped,
            error: r.error,
            fetchedAt: r.fetchedAt,
            notModified: r.notModified,
            etag: r.etag,
            excerpt: r.excerpt ? r.excerpt.slice(0, 2000) : undefined,
          })),
        }
      }
    } catch (err) {
      logVerbose('manifest_url_fetch_failed', { error: String((err as Error)?.message || err) })
    }
  }

  const fullDataSupervisor: Record<string, unknown> = {
    ...snapshot.fullData,
    _agent: {
      ...reportPayload._agent,
      orchestration: orch.orchestration,
      ...(manifestFetchSummary ? { manifestFetch: manifestFetchSummary } : {}),
    },
  }

  let fullDataForUpsert: Record<string, unknown> = fullDataSupervisor
  const canaryPayload = await maybeBuildCanaryChildFullData({
    country: task.country,
    region: task.region,
    supervisorFullData: fullDataSupervisor,
    supervisorScore: reportPayload.report.score,
    snapshotInit,
    task: enrichTask,
    completenessTargetScore: COMPLETENESS_TARGET_SCORE,
  })
  if (canaryPayload) {
    fullDataForUpsert = canaryPayload.fullData
  }

  fullDataForUpsert = ensureStreetFoodBusinessAccessOnFullData(fullDataForUpsert)
  fullDataForUpsert = syncDrivingRightsIntelIntoFullData(fullDataForUpsert)
  const streetFoodBusinessAccess = deriveStreetFoodBusinessAccessFromFullData(fullDataForUpsert)

  const childKnowledge = await loadChildKnowledge()

  logVerbose2('upsert payload preview', {
    country: task.country,
    schengen,
    completeness: reportPayload.report.score,
    criticalMissing: reportPayload.report.criticalMissing.length,
    contractFields: ALL_COUNTRY_CONTRACT_FIELD_COUNT,
    advancementGatePassed: orch.advancementGatePassed,
    strictCountryGate: AGENT_STRICT_COUNTRY_GATE,
  })

  fullDataForUpsert = appendFullDataChangelog(fullDataForUpsert, {
    actor: 'agent',
    action: 'enrichment.upsert',
    detail: `country=${task.country}; completeness=${reportPayload.report.score.toFixed(1)}${canaryPayload ? ';canary' : ''}`,
  })

  await prisma.country.upsert({
    where: { name: task.country },
    update: {
      region: task.region,
      schengen_flag: schengen,
      tourist_visa_score: snapshot.scalar.tourist_visa_score,
      study_visa_score: snapshot.scalar.study_visa_score,
      work_visa_score: snapshot.scalar.work_visa_score,
      business_visa_score: snapshot.scalar.business_visa_score,
      appointment_difficulty: snapshot.scalar.appointment_difficulty,
      ...(streetFoodBusinessAccess ? { street_food_business_access: streetFoodBusinessAccess } : {}),
      full_data: JSON.stringify(fullDataForUpsert),
    },
    create: {
      name: task.country,
      region: task.region,
      schengen_flag: schengen,
      tourist_visa_score: snapshot.scalar.tourist_visa_score,
      study_visa_score: snapshot.scalar.study_visa_score,
      work_visa_score: snapshot.scalar.work_visa_score,
      business_visa_score: snapshot.scalar.business_visa_score,
      appointment_difficulty: snapshot.scalar.appointment_difficulty,
      ...(streetFoodBusinessAccess ? { street_food_business_access: streetFoodBusinessAccess } : {}),
      full_data: JSON.stringify(fullDataForUpsert),
    },
  })

  return {
    score: reportPayload.report.score,
    criticalMissing: reportPayload.report.criticalMissing,
    advancementGatePassed: orch.advancementGatePassed,
    passCount: passesUsed,
    snapshotInit,
    enrichmentTask: enrichTask,
    childVersion: childKnowledge.version,
  }
}

async function runWorkerBatch() {
  const now = Date.now()
  const ttlCutoff = now - TASK_TTL_HOURS * 60 * 60 * 1000
  dedupeCountryTasks()

  let recoveredRunning = 0
  for (const task of memoryState.tasks) {
    if (task.status === 'running') {
      task.status = 'queued'
      task.nextRunAt = new Date(now).toISOString()
      recoveredRunning += 1
    }
  }
  if (recoveredRunning > 0) logVerbose('recovered running tasks', { count: recoveredRunning })

  const beforePurge = memoryState.tasks.length
  memoryState.tasks = memoryState.tasks.filter((t) => {
    if (t.status === 'queued' || t.status === 'running') return true
    return new Date(t.nextRunAt).getTime() >= ttlCutoff
  })
  const purged = beforePurge - memoryState.tasks.length
  if (purged > 0) logVerbose('purged stale tasks', { purged })

  const worldFileOrder = await tryLoadWorldCountryRunOrderFile()
  const sequentialActive =
    SEQUENTIAL_WORLD_ORDER_ENABLED && !!worldFileOrder && worldFileOrder.length > 0
  const orderLen = sequentialActive ? worldFileOrder!.length : 0
  const cursorIdx =
    sequentialActive && orderLen > 0
      ? ((((memoryState.worldOrderCursor ?? 0) % orderLen) + orderLen) % orderLen)
      : 0
  const targetCountry = sequentialActive ? worldFileOrder![cursorIdx]!.country : null

  let runnable = memoryState.tasks
    .filter((t) => t.status === 'queued' && new Date(t.nextRunAt).getTime() <= now)
    .filter((t) => (targetCountry === null ? true : t.country === targetCountry))
    .sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority
      if (a.completenessScore !== b.completenessScore)
        return a.completenessScore - b.completenessScore
      return a.country.localeCompare(b.country)
    })
    .slice(0, WORKER_BATCH)

  logVerbose('batch selected', {
    size: runnable.length,
    sequentialActive,
    worldOrderCursor: memoryState.worldOrderCursor,
    targetCountry,
    topTask: runnable[0]
      ? {
          id: runnable[0].id,
          country: runnable[0].country,
          score: runnable[0].completenessScore,
          missingCritical: runnable[0].missingCritical.length,
        }
      : null,
  })

  for (const task of runnable) {
    task.status = 'running'
    task.attempts += 1
    const startedAt = Date.now()

    logVerbose('country cycle start', {
      id: task.id,
      country: task.country,
      attempts: task.attempts,
      currentScore: task.completenessScore,
      missingCritical: task.missingCritical.length,
    })

    try {
      const previousScore = task.completenessScore
      const result = await processCountryTask(task)
      task.completenessScore = result.score
      task.missingCritical = result.criticalMissing
      task.priority =
        result.criticalMissing.length > 0
          ? 1000 + (100 - Math.min(100, result.score))
          : Math.max(10, 100 - result.score)
      task.query = resolveAdaptiveQuery(task.country, result.criticalMissing)

      const nextDoneAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      const nextRetryAt = new Date(Date.now() + nextRetryDelay(task.attempts)).toISOString()
      const plateau =
        task.attempts >= STABLE_SCORE_MIN_ATTEMPTS &&
        Math.abs(result.score - previousScore) <= STABLE_SCORE_DELTA

      if (AGENT_STRICT_COUNTRY_GATE) {
        if (result.advancementGatePassed) {
          task.status = 'done'
          task.nextRunAt = nextDoneAt
        } else {
          task.status = 'queued'
          task.nextRunAt = nextRetryAt
        }
      } else if (
        result.score >= COMPLETENESS_TARGET_SCORE &&
        result.criticalMissing.length === 0
      ) {
        task.status = 'done'
        task.nextRunAt = nextDoneAt
      } else if (plateau) {
        task.status = 'done'
        task.nextRunAt = nextDoneAt
      } else {
        task.status = 'queued'
        task.nextRunAt = nextRetryAt
      }

      logVerbose('country cycle result', {
        id: task.id,
        country: task.country,
        score: result.score,
        missingCritical: result.criticalMissing.length,
        status: task.status,
        advancementGatePassed: result.advancementGatePassed,
        strictCountryGate: AGENT_STRICT_COUNTRY_GATE,
      })
      const elapsedMs = Date.now() - startedAt
      logVerbose2('country cycle timings', {
        id: task.id,
        elapsedMs,
      })

      const childShadow =
        (await runChildShadowCompare({
          task: result.enrichmentTask,
          snapshotInit: result.snapshotInit,
          supervisorScore: result.score,
          supervisorElapsedMs: elapsedMs,
          completenessTargetScore: COMPLETENESS_TARGET_SCORE,
        })) ?? null

      void appendSupervisorMetricEvent({
        kind: 'supervisor_task_complete',
        at: new Date().toISOString(),
        contractVersion: CONTRACT_VERSION,
        agentRole: 'supervisor',
        country: task.country,
        taskId: task.id,
        score: result.score,
        criticalMissingCount: result.criticalMissing.length,
        gatePassed: result.advancementGatePassed,
        passCount: result.passCount,
        elapsedMs,
        childVersion: result.childVersion,
        childShadow,
      }).catch((err) =>
        logVerbose('supervisor metrics append failed', { error: String((err as Error)?.message || err) }),
      )

      if (sequentialActive && orderLen > 0 && task.status === 'done') {
        memoryState.worldOrderCursor = (cursorIdx + 1) % orderLen
        logVerbose('world order cursor advanced after terminal step', {
          nextCursor: memoryState.worldOrderCursor,
          finishedCountry: task.country,
        })
      }
    } catch (error) {
      task.lastError = String((error as Error)?.message || error)
      task.status = task.attempts >= 3 ? 'failed' : 'queued'
      task.nextRunAt = new Date(Date.now() + nextRetryDelay(task.attempts)).toISOString()
      logVerbose('country cycle failed', {
        id: task.id,
        country: task.country,
        status: task.status,
        error: task.lastError,
      })
      if (sequentialActive && orderLen > 0 && task.status === 'failed') {
        memoryState.worldOrderCursor = (cursorIdx + 1) % orderLen
        logVerbose('world order cursor advanced after failed country', {
          nextCursor: memoryState.worldOrderCursor,
          finishedCountry: task.country,
        })
      }
    }
  }
}

async function scheduleRefresh() {
  const seeds = await resolveScheduleSeeds()
  let added = 0
  let recycled = 0
  const now = Date.now()
  const reEnrichCutoff = now - REENRICH_INTERVAL_HOURS * 60 * 60 * 1000

  for (const seed of seeds) {
    const existingTask = getTaskByCountry(seed.country)
    if (!existingTask) {
      enqueueCountry(seed.country, seed.region)
      added += 1
      continue
    }
    if (
      existingTask.status === 'done' &&
      new Date(existingTask.nextRunAt).getTime() <= reEnrichCutoff
    ) {
      existingTask.status = 'queued'
      existingTask.attempts = 0
      existingTask.pass = 0
      existingTask.nextRunAt = new Date(now).toISOString()
      existingTask.priority = Math.max(existingTask.priority, 200)
      recycled += 1
    }
  }

  if (added === 0 && recycled === 0 && memoryState.tasks.length > 0) {
    const staleDone = memoryState.tasks
      .filter((task) => task.status === 'done')
      .sort((a, b) => new Date(a.nextRunAt).getTime() - new Date(b.nextRunAt).getTime())
      .slice(0, 10)
    for (const task of staleDone) {
      task.status = 'queued'
      task.attempts = 0
      task.pass = 0
      task.nextRunAt = new Date(now).toISOString()
      task.priority = Math.max(task.priority, 150)
      recycled += 1
    }
  }
  logVerbose('refresh enqueue completed', {
    addedCountries: added,
    recycledCountries: recycled,
    seeds: seeds.length,
  })
}

async function main() {
  await loadState()
  await scheduleRefresh()
  await saveState()

  const fileOrder = await tryLoadWorldCountryRunOrderFile()
  const sequential =
    SEQUENTIAL_WORLD_ORDER_ENABLED && !!fileOrder && fileOrder.length > 0
  console.log(
    `[agents] running - tick=${TICK_MS}ms refresh=${REFRESH_MS}ms contract=${CONTRACT_VERSION} sequential=${sequential} worldList=${sequential ? fileOrder!.length : 'restcountries'} strictGate=${AGENT_STRICT_COUNTRY_GATE} strictQuality=${AGENT_STRICT_QUALITY_MANIFEST} childMode=${AGENT_CHILD_MODE} maxRuntimeMs=${AGENT_MAX_RUNTIME_MS > 0 ? AGENT_MAX_RUNTIME_MS : 'none'}`,
  )

  let maxRuntimeTimer: ReturnType<typeof setTimeout> | undefined

  const tickTimer = setInterval(async () => {
    if (tickInProgress) {
      console.warn('[agents] tick skipped (previous tick still running)')
      return
    }
    tickInProgress = true
    try {
      await runWorkerBatch()
      await saveState()
      const stats = summarizeState()
      console.log(
        `[agents] tick ok queued=${stats.queued} running=${stats.running} done=${stats.done} failed=${stats.failed} total=${stats.total}`,
      )
    } catch (error) {
      console.error('[agents] worker tick failed', error)
    } finally {
      tickInProgress = false
    }
  }, TICK_MS)

  const refreshTimer = setInterval(async () => {
    if (refreshInProgress) {
      console.warn('[agents] refresh skipped (previous refresh still running)')
      return
    }
    refreshInProgress = true
    try {
      await scheduleRefresh()
      await saveState()
      const stats = summarizeState()
      console.log(`[agents] refresh cycle completed total=${stats.total} queued=${stats.queued}`)
    } catch (error) {
      console.error('[agents] refresh cycle failed', error)
    } finally {
      refreshInProgress = false
    }
  }, REFRESH_MS)

  const shutdown = async (reason: string) => {
    if (maxRuntimeTimer !== undefined) {
      clearTimeout(maxRuntimeTimer)
      maxRuntimeTimer = undefined
    }
    const label =
      reason === 'SIGINT' || reason === 'SIGTERM' ? `signal ${reason}` : `reason=${reason}`
    console.log(`[agents] shutting down (${label})...`)
    clearInterval(tickTimer)
    clearInterval(refreshTimer)
    try {
      await saveState()
      await prisma.$disconnect()
      console.log('[agents] shutdown complete')
      process.exit(0)
    } catch (error) {
      console.error('[agents] shutdown failed', error)
      process.exit(1)
    }
  }

  if (AGENT_MAX_RUNTIME_MS > 0) {
    maxRuntimeTimer = setTimeout(() => {
      void shutdown('AGENT_MAX_RUNTIME_MS')
    }, AGENT_MAX_RUNTIME_MS)
  }

  process.on('SIGINT', () => {
    void shutdown('SIGINT')
  })
  process.on('SIGTERM', () => {
    void shutdown('SIGTERM')
  })
}

main().catch((error) => {
  console.error('[agents] fatal startup error', error)
  process.exit(1)
})
