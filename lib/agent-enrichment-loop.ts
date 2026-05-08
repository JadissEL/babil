/**
 * Multi-pass fetch + merge used by the supervisor and (with smaller maxPasses) by the child shadow runner.
 */

import { CONTRACT_VERSION } from './country-intelligence-contract'
import { isSchengenMember } from './schengen-members'
import {
  buildCompletenessReport,
  buildCoverageManifest,
  type CompletenessReport,
} from './country-completeness'
import { buildPlannerHintSuffix } from './agent-orchestration'
import { buildAgentResearchSourcesPayload } from './agent-research-sources'
import type { Domain } from './agent-adaptive-query'
import { resolveAdaptiveQuery, resolveAdaptiveQueryFromSnapshot } from './agent-adaptive-query'
import type { CountrySnapshot } from './agent-country-enrichment-merge'
import {
  fetchWikipediaSummary,
  fetchWorldBankGdp,
  hashEnrichmentInputs,
  loadVerifiedTravelerQuotes,
  mergeCountryData,
} from './agent-country-enrichment-merge'
import { syncDrivingRightsIntelIntoFullData } from './driving-rights-intel'

export type EnrichmentLoopTask = {
  id: string
  country: string
  region: string
  domain: Domain
  query: string
  pass: number
}

export function buildCountryPayloadForCompleteness(snapshot: CountrySnapshot, task: EnrichmentLoopTask) {
  return {
    name: task.country,
    region: task.region,
    schengen_flag: isSchengenMember(task.country),
    tourist_visa_score: snapshot.scalar.tourist_visa_score,
    study_visa_score: snapshot.scalar.study_visa_score,
    work_visa_score: snapshot.scalar.work_visa_score,
    business_visa_score: snapshot.scalar.business_visa_score,
    appointment_difficulty: snapshot.scalar.appointment_difficulty,
    full_data: snapshot.fullData,
  }
}

export function buildCompletenessPayload(
  snapshot: CountrySnapshot,
  task: EnrichmentLoopTask,
  sourceHash: string,
  recursionMeta: { pass: number; maxPasses: number },
) {
  const countryPayload = buildCountryPayloadForCompleteness(snapshot, task)
  const report = buildCompletenessReport(countryPayload)
  const coverageManifest = buildCoverageManifest(report)
  const plannerSuffix = buildPlannerHintSuffix(report)
  const nextHints = `${resolveAdaptiveQuery(task.country, report.criticalMissing)}${plannerSuffix}`

  return {
    report,
    coverageManifest,
    _agent: {
      lastTaskId: task.id,
      lastQuery: task.query,
      domain: task.domain,
      updatedAt: new Date().toISOString(),
      sourceHash,
      contractVersion: CONTRACT_VERSION,
      completeness: {
        score: report.score,
        coveredFields: report.coveredFields,
        totalFields: report.totalFields,
        criticalMissing: report.criticalMissing,
        domains: report.domains,
      },
      coverageManifest,
      recursion: {
        pass: recursionMeta.pass,
        maxPasses: recursionMeta.maxPasses,
      },
      nextResearchHints: nextHints,
      researchSourceManifest: buildAgentResearchSourcesPayload(),
    },
  }
}

export type EnrichmentLoopResult = {
  snapshot: CountrySnapshot
  reportPayload: ReturnType<typeof buildCompletenessPayload>
  sourceHash: string
  passesUsed: number
  finalReport: CompletenessReport
}

export async function runEnrichmentPassLoop(
  task: EnrichmentLoopTask,
  snapshotInit: CountrySnapshot,
  opts: {
    maxPasses: number
    completenessTargetScore: number
    /** Shown in _agent.recursion.maxPasses (supervisor env cap vs child policy). */
    recursionMaxPassesMeta: number
    onPassMetrics?: (m: {
      country: string
      pass: number
      score: number
      criticalMissing: number
    }) => void
  },
): Promise<EnrichmentLoopResult> {
  // Pass-0 completeness uses `snapshot` before the first merge; materialize v1 from legacy `driving_license` here so all callers (runner, child) agree.
  let snapshot: CountrySnapshot = {
    ...snapshotInit,
    fullData: syncDrivingRightsIntelIntoFullData(snapshotInit.fullData),
  }
  let bestScore = -1
  let sourceHash = ''
  let reportPayload = buildCompletenessPayload(snapshot, task, hashEnrichmentInputs({}), {
    pass: 0,
    maxPasses: opts.recursionMaxPassesMeta,
  })
  let passesUsed = 0

  for (let pass = 1; pass <= opts.maxPasses; pass += 1) {
    task.pass = pass
    task.domain = pass === 1 ? 'overview' : 'community'
    task.query = resolveAdaptiveQueryFromSnapshot(
      task.country,
      reportPayload.report.criticalMissing,
      snapshot.fullData,
    )

    const wiki = await fetchWikipediaSummary(task.country)
    const gdp = await fetchWorldBankGdp(task.country)
    const quotes = await loadVerifiedTravelerQuotes(task.country)
    sourceHash = hashEnrichmentInputs({ wiki, gdp, quoteStatus: quotes.status })

    snapshot = mergeCountryData(
      task.country,
      task.region,
      snapshot.fullData,
      wiki,
      gdp,
      quotes,
      snapshot.scalar,
    )
    reportPayload = buildCompletenessPayload(snapshot, task, sourceHash, {
      pass,
      maxPasses: opts.recursionMaxPassesMeta,
    })
    passesUsed = pass
    opts.onPassMetrics?.({
      country: task.country,
      pass,
      score: reportPayload.report.score,
      criticalMissing: reportPayload.report.criticalMissing.length,
    })

    if (reportPayload.report.score <= bestScore) break
    bestScore = reportPayload.report.score

    if (
      reportPayload.report.score >= opts.completenessTargetScore &&
      reportPayload.report.criticalMissing.length === 0
    ) {
      break
    }
  }

  return {
    snapshot,
    reportPayload,
    sourceHash,
    passesUsed,
    finalReport: reportPayload.report,
  }
}
