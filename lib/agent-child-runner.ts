/**
 * Child enrichment runner: same merge loop as the supervisor, from a read-only snapshot,
 * with a smaller pass budget. Does not open its own DB connection for reads in shadow mode
 * (caller supplies snapshotInit). Optional canary write is handled in the supervisor.
 */

import type { CountrySnapshot } from './agent-country-enrichment-merge'
import { runEnrichmentPassLoop, type EnrichmentLoopTask } from './agent-enrichment-loop'
import { loadChildKnowledge } from './agent-child-knowledge'

function deepCloneSnapshot(s: CountrySnapshot): CountrySnapshot {
  return JSON.parse(JSON.stringify(s)) as CountrySnapshot
}

export type ChildShadowCompareInput = {
  task: EnrichmentLoopTask
  snapshotInit: CountrySnapshot
  supervisorScore: number
  supervisorElapsedMs: number
  completenessTargetScore: number
}

export type ChildShadowCompareResult = {
  childScore: number
  supervisorScore: number
  childElapsedMs: number
  supervisorElapsedMs: number
  scoreDelta: number
  timeDeltaMs: number
  childPassesUsed: number
  childVersion: string
}

export async function runChildShadowCompare(
  input: ChildShadowCompareInput,
): Promise<ChildShadowCompareResult | null> {
  const mode = (process.env.AGENT_CHILD_MODE || 'off').toLowerCase()
  if (mode !== 'shadow' && mode !== 'canary') return null

  const knowledge = await loadChildKnowledge()
  const maxPasses = knowledge.policy.maxShadowPasses
  const snapshot = deepCloneSnapshot(input.snapshotInit)
  const task: EnrichmentLoopTask = {
    ...input.task,
    pass: 0,
    domain: 'overview',
    query: 'child-shadow-loop',
  }

  const t0 = Date.now()
  const { passesUsed, finalReport } = await runEnrichmentPassLoop(task, snapshot, {
    maxPasses,
    completenessTargetScore: input.completenessTargetScore,
    recursionMaxPassesMeta: maxPasses,
  })
  const childElapsedMs = Date.now() - t0

  return {
    childScore: finalReport.score,
    supervisorScore: input.supervisorScore,
    childElapsedMs,
    supervisorElapsedMs: input.supervisorElapsedMs,
    scoreDelta: finalReport.score - input.supervisorScore,
    timeDeltaMs: input.supervisorElapsedMs - childElapsedMs,
    childPassesUsed: passesUsed,
    childVersion: knowledge.version,
  }
}

export type CanaryWriteInput = {
  country: string
  region: string
  /** Supervisor payload about to be written (for _agent merge). */
  supervisorFullData: Record<string, unknown>
  supervisorScore: number
  snapshotInit: CountrySnapshot
  task: EnrichmentLoopTask
  completenessTargetScore: number
}

const parseCanaryCountries = () =>
  String(process.env.AGENT_CHILD_CANARY_COUNTRIES || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)

const promotionDelta = () =>
  Number(process.env.AGENT_CHILD_PROMOTION_SCORE_DELTA || 0.5)

/** Returns merged full_data for upsert when canary write wins; otherwise null. */
export async function maybeBuildCanaryChildFullData(input: CanaryWriteInput): Promise<{
  fullData: Record<string, unknown>
  childVersion: string
} | null> {
  if (process.env.AGENT_CHILD_CANARY_WRITE !== '1') return null
  if ((process.env.AGENT_CHILD_MODE || 'off').toLowerCase() !== 'canary') return null
  if (!parseCanaryCountries().includes(input.country.trim().toLowerCase())) return null

  const knowledge = await loadChildKnowledge()
  const { snapshot, finalReport } = await runEnrichmentPassLoop(
    { ...input.task, pass: 0, domain: 'overview', query: 'child-canary-loop' },
    deepCloneSnapshot(input.snapshotInit),
    {
      maxPasses: knowledge.policy.maxShadowPasses,
      completenessTargetScore: input.completenessTargetScore,
      recursionMaxPassesMeta: knowledge.policy.maxShadowPasses,
    },
  )

  const supervisorPayload = input.supervisorFullData
  const prevAgent =
    supervisorPayload._agent && typeof supervisorPayload._agent === 'object'
      ? (supervisorPayload._agent as Record<string, unknown>)
      : {}

  const supervisorScore = input.supervisorScore
  if (!Number.isFinite(supervisorScore)) return null
  if (finalReport.score < supervisorScore + promotionDelta()) return null

  const fullData = {
    ...snapshot.fullData,
    _agent: {
      ...prevAgent,
      childProvenance: {
        mode: 'canary',
        version: knowledge.version,
        appliedAt: new Date().toISOString(),
        priorSupervisorScore: supervisorScore,
        childScore: finalReport.score,
      },
    },
  }

  return { fullData, childVersion: knowledge.version }
}
