/**
 * Advanced runner orchestration — planning, quality manifest (critical fields), advancement gate.
 * See docs/internal-runner-orchestration.md for the full logical model.
 */

import type { CompletenessReport } from '@/lib/country-completeness'
import { ALL_COUNTRY_FIELD_SPECS } from '@/lib/country-completeness'
import type { CountryFieldSpec, IntelligenceDomain } from '@/lib/country-intelligence-contract'

export const ORCHESTRATION_MODEL_VERSION = 'agent-orchestration-v1' as const

export type OrchestrationPhase =
  | 'initialized'
  | 'planned'
  | 'collecting'
  | 'normalizing'
  | 'validating'
  | 'scoring'
  | 'improving'
  | 'finalized'
  | 'blocked_review'

export type CoherenceFlag = 'ok' | 'conflict' | 'single_official_ok' | 'insufficient_evidence'

export type QualityManifestEntry = {
  key: string
  path: string
  reliabilityScore: number
  completenessScore: number
  coherenceFlag: CoherenceFlag
}

export type ResearchPlanLot = {
  id: string
  priority: number
  labelFr: string
  targetKeys: readonly string[]
  sourceTierHint: string
}

export type AdvancementGateResult = {
  passed: boolean
  strictCountryGate: boolean
  strictQualityManifest: boolean
  checks: readonly { id: string; passed: boolean; detail?: string }[]
  reasonsPassed: readonly string[]
  reasonsFailed: readonly string[]
}

/** Domain pull order for planner lots (visa / friction / identity first). */
const DOMAIN_PLAN_PRIORITY: readonly IntelligenceDomain[] = [
  'visa',
  'friction',
  'identity',
  'provenance',
  'education',
  'work',
  'business',
  'driving',
  'community',
  'signals',
  'morocco_decision',
]

function getByPath(obj: Record<string, unknown>, dottedPath: string): unknown {
  const segments = dottedPath.split('.')
  let current: unknown = obj
  for (const segment of segments) {
    if (!current || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[segment]
  }
  return current
}

function hasStructuredValue(value: unknown, expectedType: CountryFieldSpec['expectedType']): boolean {
  if (value == null) return false
  if (expectedType === 'array') return Array.isArray(value) && value.length > 0
  if (expectedType === 'object') return typeof value === 'object' && !Array.isArray(value)
  if (expectedType === 'string') return typeof value === 'string' && value.trim().length > 0
  if (expectedType === 'number') return typeof value === 'number' && Number.isFinite(value)
  if (expectedType === 'boolean') return typeof value === 'boolean'
  return false
}

/**
 * Heuristic quality for contract critical keys only (until per-field SourcedValue exists).
 * - api: treat as single authoritative pipeline → single_official_ok
 * - hybrid: partial triangulation potential
 * - scraping / generated: insufficient_evidence (strict quality gate can block)
 */
export function buildQualityManifestForCritical(
  countryPayload: Record<string, unknown>,
  opts?: { disputedFieldPaths?: string[] },
): {
  byKey: Record<string, QualityManifestEntry>
  conflicts: string[]
} {
  const byKey: Record<string, QualityManifestEntry> = {}
  const conflicts: string[] = []

  for (const fieldPath of opts?.disputedFieldPaths ?? []) {
    conflicts.push(`observation_dispute:${fieldPath}`)
  }

  const criticalSpecs = ALL_COUNTRY_FIELD_SPECS.filter((s) => s.critical)

  for (const spec of criticalSpecs) {
    const value = (() => {
      if (spec.path.startsWith('full_data.')) {
        return getByPath(
          (countryPayload.full_data || {}) as Record<string, unknown>,
          spec.path.slice('full_data.'.length),
        )
      }
      return (countryPayload as Record<string, unknown>)[spec.path]
    })()

    const covered = hasStructuredValue(value, spec.expectedType)
    let coherenceFlag: CoherenceFlag = 'insufficient_evidence'
    let reliabilityScore = 25
    let completenessScore = covered ? 55 : 0

    if (!covered) {
      byKey[spec.key] = {
        key: spec.key,
        path: spec.path,
        reliabilityScore: 0,
        completenessScore: 0,
        coherenceFlag: 'insufficient_evidence',
      }
      continue
    }

    switch (spec.acquisition) {
      case 'api':
        coherenceFlag = 'single_official_ok'
        reliabilityScore = 78
        completenessScore = Math.max(completenessScore, 80)
        break
      case 'hybrid':
        coherenceFlag = 'single_official_ok'
        reliabilityScore = 62
        completenessScore = Math.max(completenessScore, 70)
        break
      case 'scraping':
        coherenceFlag = 'insufficient_evidence'
        reliabilityScore = 45
        completenessScore = Math.max(completenessScore, 65)
        break
      case 'generated':
        coherenceFlag = 'insufficient_evidence'
        reliabilityScore = 35
        completenessScore = Math.max(completenessScore, 60)
        break
      default:
        coherenceFlag = 'insufficient_evidence'
    }

    /** Traveler quotes verified file → upgrade trust */
    if (spec.key === 'traveler_quotes' && Array.isArray(value) && value.length > 0) {
      const meta = getByPath(
        (countryPayload.full_data || {}) as Record<string, unknown>,
        'traveler_quotes_meta.status',
      )
      if (meta === 'verified') {
        coherenceFlag = 'single_official_ok'
        reliabilityScore = Math.max(reliabilityScore, 72)
      }
    }

    byKey[spec.key] = {
      key: spec.key,
      path: spec.path,
      reliabilityScore,
      completenessScore,
      coherenceFlag,
    }
  }

  if (opts?.disputedFieldPaths?.length) {
    for (const spec of criticalSpecs) {
      if (
        spec.key === 'economy_gdp_usd' &&
        opts.disputedFieldPaths.some((p) => p.includes('gdp'))
      ) {
        const entry = byKey[spec.key]
        if (entry) entry.coherenceFlag = 'conflict'
      }
    }
  }

  const intel = (countryPayload.full_data || {}) as Record<string, unknown>
  const intelBlock = intel._intelligence as Record<string, unknown> | undefined
  const storedDisputes = intelBlock?.disputed_field_paths
  if (Array.isArray(storedDisputes)) {
    for (const p of storedDisputes) {
      if (typeof p === 'string' && !conflicts.includes(`observation_dispute:${p}`)) {
        conflicts.push(`observation_dispute:${p}`)
      }
    }
  }

  return { byKey, conflicts }
}

/** Buckets missing keys into ordered research lots (deterministic, no network I/O). */
export function buildResearchPlanLots(report: CompletenessReport): ResearchPlanLot[] {
  const want = new Set<string>()
  for (const k of report.criticalMissing) want.add(k)
  for (const k of report.missingFields) want.add(k)
  if (want.size === 0) return []

  const keyToSpec = new Map(ALL_COUNTRY_FIELD_SPECS.map((s) => [s.key, s]))
  const lots: ResearchPlanLot[] = []
  let lotCounter = 0

  for (const domain of DOMAIN_PLAN_PRIORITY) {
    const keysInDomain = Array.from(want).filter((k) => keyToSpec.get(k)?.domain === domain)
    if (keysInDomain.length === 0) continue

    const tier =
      domain === 'visa' || domain === 'friction' || domain === 'identity'
        ? 'official_first'
        : domain === 'morocco_decision'
          ? 'morocco_corridor'
          : 'data_then_testimonial'

    /** Chunk to keep hints readable */
    const chunkSize = 12
    for (let i = 0; i < keysInDomain.length; i += chunkSize) {
      const slice = keysInDomain.slice(i, i + chunkSize)
      lotCounter += 1
      lots.push({
        id: `lot_${domain}_${lotCounter}`,
        priority: DOMAIN_PLAN_PRIORITY.indexOf(domain),
        labelFr: `Recherche ${domain} (${slice.length} champs)`,
        targetKeys: slice,
        sourceTierHint: tier,
      })
    }
  }

  return lots
}

export function buildPlannerHintSuffix(report: CompletenessReport): string {
  const lots = buildResearchPlanLots(report)
  if (lots.length === 0) return ''
  const head = lots.slice(0, 2)
  const parts = head.map(
    (l) => `${l.id}[${l.targetKeys.slice(0, 6).join(',')}${l.targetKeys.length > 6 ? '…' : ''}]`,
  )
  return ` | plan:${parts.join(' ; ')}`
}

export function evaluateAdvancementGate(
  report: CompletenessReport,
  qualityByKey: Record<string, QualityManifestEntry>,
  options: {
    strictCountryGate: boolean
    strictQualityManifest: boolean
    completenessTarget: number
  },
): AdvancementGateResult {
  const checks: { id: string; passed: boolean; detail?: string }[] = []
  const reasonsPassed: string[] = []
  const reasonsFailed: string[] = []

  const noCriticalMissing = report.criticalMissing.length === 0
  checks.push({ id: 'no_critical_missing', passed: noCriticalMissing })
  if (noCriticalMissing) reasonsPassed.push('critical_missing_empty')
  else reasonsFailed.push(`critical_missing:${report.criticalMissing.join(',')}`)

  const scoreOk = report.score >= options.completenessTarget
  checks.push({
    id: 'completeness_score_target',
    passed: scoreOk,
    detail: `${report.score}/${options.completenessTarget}`,
  })
  if (scoreOk) reasonsPassed.push('score_target_met')
  else reasonsFailed.push(`score_below_target:${report.score}<${options.completenessTarget}`)

  const criticalSpecs = ALL_COUNTRY_FIELD_SPECS.filter((s) => s.critical)
  let conflict = false
  for (const spec of criticalSpecs) {
    const q = qualityByKey[spec.key]
    if (q?.coherenceFlag === 'conflict') {
      conflict = true
      reasonsFailed.push(`conflict:${spec.key}`)
    }
  }
  checks.push({ id: 'no_quality_conflicts', passed: !conflict })
  if (!conflict) reasonsPassed.push('no_conflicts')

  let strictQualityPassed = true
  if (options.strictQualityManifest) {
    strictQualityPassed = true
    for (const spec of criticalSpecs) {
      const q = qualityByKey[spec.key]
      const ok =
        q &&
        (q.coherenceFlag === 'ok' || q.coherenceFlag === 'single_official_ok') &&
        q.completenessScore >= 50
      if (!ok) {
        strictQualityPassed = false
        reasonsFailed.push(`quality_insufficient:${spec.key}`)
      }
    }
    checks.push({ id: 'strict_critical_quality', passed: strictQualityPassed })
    if (strictQualityPassed) reasonsPassed.push('strict_quality_ok')
  } else {
    checks.push({ id: 'strict_critical_quality', passed: true, detail: 'skipped' })
    reasonsPassed.push('strict_quality_skipped')
  }

  const passed = noCriticalMissing && scoreOk && !conflict && strictQualityPassed

  return {
    passed,
    strictCountryGate: options.strictCountryGate,
    strictQualityManifest: options.strictQualityManifest,
    checks,
    reasonsPassed,
    reasonsFailed: Array.from(new Set(reasonsFailed)),
  }
}

/** Build stub for `full_data._agent.orchestration` (JSON-serializable). */
export function buildAgentOrchestrationBlock(input: {
  phase: OrchestrationPhase
  planEpoch: number
  improvementCycle: number
  gate: AdvancementGateResult
  qualityManifest: Record<string, QualityManifestEntry>
  plannerLots: readonly ResearchPlanLot[]
  runMemoryPath: string | null
  runMemoryCyclesTotal: number
}): Record<string, unknown> {
  return {
    modelVersion: ORCHESTRATION_MODEL_VERSION,
    phase: input.phase,
    planEpoch: input.planEpoch,
    improvementCycle: input.improvementCycle,
    advancementGate: {
      passed: input.gate.passed,
      strictCountryGate: input.gate.strictCountryGate,
      strictQualityManifest: input.gate.strictQualityManifest,
      checks: input.gate.checks,
      reasonsPassed: input.gate.reasonsPassed,
      reasonsFailed: input.gate.reasonsFailed,
    },
    qualityManifest: input.qualityManifest,
    planner: {
      lots: input.plannerLots.map((l) => ({
        id: l.id,
        priority: l.priority,
        labelFr: l.labelFr,
        targetKeys: l.targetKeys,
        sourceTierHint: l.sourceTierHint,
      })),
      generatedAt: new Date().toISOString(),
    },
    runMemory: {
      persistedFile: input.runMemoryPath,
      cyclesRecorded: input.runMemoryCyclesTotal,
    },
    lockVersion: 1,
  }
}
