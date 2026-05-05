import {
  COUNTRY_INTELLIGENCE_CONTRACT_V2,
  type IntelligenceDomain,
  type CountryFieldSpec,
} from './country-intelligence-contract'

type AnyObject = Record<string, unknown>

export type CompletenessReport = {
  score: number
  totalFields: number
  coveredFields: number
  missingFields: string[]
  criticalMissing: string[]
  domains: Record<IntelligenceDomain, { score: number; covered: number; total: number }>
}

function getByPath(obj: AnyObject, dottedPath: string): unknown {
  const segments = dottedPath.split('.')
  let current: unknown = obj
  for (const segment of segments) {
    if (!current || typeof current !== 'object') return undefined
    current = (current as AnyObject)[segment]
  }
  return current
}

function hasValue(value: unknown, expectedType: CountryFieldSpec['expectedType']) {
  if (value == null) return false
  if (expectedType === 'array') return Array.isArray(value) && value.length > 0
  if (expectedType === 'object') return typeof value === 'object' && !Array.isArray(value)
  if (expectedType === 'string') return typeof value === 'string' && value.trim().length > 0
  if (expectedType === 'number') return typeof value === 'number' && Number.isFinite(value)
  if (expectedType === 'boolean') return typeof value === 'boolean'
  return false
}

function emptyDomainMap(): CompletenessReport['domains'] {
  return {
    identity: { score: 0, covered: 0, total: 0 },
    visa: { score: 0, covered: 0, total: 0 },
    friction: { score: 0, covered: 0, total: 0 },
    education: { score: 0, covered: 0, total: 0 },
    business: { score: 0, covered: 0, total: 0 },
    driving: { score: 0, covered: 0, total: 0 },
    community: { score: 0, covered: 0, total: 0 },
    signals: { score: 0, covered: 0, total: 0 },
    provenance: { score: 0, covered: 0, total: 0 },
  }
}

export function buildCompletenessReport(countryPayload: AnyObject): CompletenessReport {
  const domains = emptyDomainMap()
  const missingFields: string[] = []
  const criticalMissing: string[] = []

  let coveredFields = 0
  for (const spec of COUNTRY_INTELLIGENCE_CONTRACT_V2) {
    const value = getByPath(countryPayload, spec.path)
    const covered = hasValue(value, spec.expectedType)
    domains[spec.domain].total += 1
    if (covered) {
      coveredFields += 1
      domains[spec.domain].covered += 1
    } else {
      missingFields.push(spec.key)
      if (spec.critical) criticalMissing.push(spec.key)
    }
  }

  for (const domain of Object.keys(domains) as IntelligenceDomain[]) {
    const d = domains[domain]
    d.score = d.total === 0 ? 0 : Math.round((d.covered / d.total) * 100)
  }

  const score =
    COUNTRY_INTELLIGENCE_CONTRACT_V2.length === 0
      ? 0
      : Math.round((coveredFields / COUNTRY_INTELLIGENCE_CONTRACT_V2.length) * 100)

  return {
    score,
    totalFields: COUNTRY_INTELLIGENCE_CONTRACT_V2.length,
    coveredFields,
    missingFields,
    criticalMissing,
    domains,
  }
}

export function buildCoverageManifest(report: CompletenessReport) {
  return {
    totalFields: report.totalFields,
    coveredFields: report.coveredFields,
    missingFields: report.missingFields,
    criticalMissing: report.criticalMissing,
    domainCoverage: report.domains,
    generatedAt: new Date().toISOString(),
  }
}
