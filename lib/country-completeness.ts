import {
  COUNTRY_INTELLIGENCE_CONTRACT_V2,
  type IntelligenceDomain,
  type CountryFieldSpec,
} from './country-intelligence-contract';
import { COUNTRY_MOROCCO_RESEARCH_CONTRACT } from './morocco-research-contract';
import { EXPLICIT_UNKNOWN_SHORT_FR } from './morocco-content-constants';

/** V2 produit + pack Maroc vérifiable (complétude agent / admin). */
export const ALL_COUNTRY_FIELD_SPECS: CountryFieldSpec[] = [
  ...COUNTRY_INTELLIGENCE_CONTRACT_V2,
  ...COUNTRY_MOROCCO_RESEARCH_CONTRACT,
];

export const ALL_COUNTRY_CONTRACT_FIELD_COUNT = ALL_COUNTRY_FIELD_SPECS.length;

type AnyObject = Record<string, unknown>;

export type CompletenessReport = {
  score: number;
  totalFields: number;
  coveredFields: number;
  missingFields: string[];
  criticalMissing: string[];
  domains: Record<IntelligenceDomain, { score: number; covered: number; total: number }>;
};

function getByPath(obj: AnyObject, dottedPath: string): unknown {
  const segments = dottedPath.split('.');
  let current: unknown = obj;
  for (const segment of segments) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as AnyObject)[segment];
  }
  return current;
}

function travelerQuotesCoverage(value: unknown, payload: AnyObject): boolean {
  if (Array.isArray(value) && value.length > 0) return true;
  const meta = getByPath(payload, 'full_data.traveler_quotes_meta') as AnyObject | undefined;
  const status = typeof meta?.status === 'string' ? meta.status.trim() : '';
  if (status === 'collecting') return true;
  if (status === 'verified') return Array.isArray(value) && value.length === 10;
  return false;
}

function appointmentIssuesCoverage(value: unknown, payload: AnyObject): boolean {
  if (Array.isArray(value) && value.length > 0) return true;
  const platform = getByPath(payload, 'full_data.appointment_audit.platform');
  if (typeof platform !== 'string') return false;
  const t = platform.trim();
  return t === EXPLICIT_UNKNOWN_SHORT_FR || /^à vérifier sur la source officielle/i.test(t);
}

function workAvailabilityCoverage(value: unknown): boolean {
  if (typeof value === 'boolean') return true;
  if (typeof value === 'string' && value.trim().length > 0) return true;
  return false;
}

/** Territoires / juridictions sans série PIB distincte dans WDI — honnête pour le barème launch. */
function economyGdpUsdCoverage(value: unknown, payload: AnyObject): boolean {
  if (typeof value === 'number' && Number.isFinite(value)) return true;
  const econ = getByPath(payload, 'full_data.economy');
  if (econ !== null && typeof econ === 'object' && !Array.isArray(econ)) {
    if ((econ as Record<string, unknown>).gdp_wb_series_unavailable === true) return true;
  }
  return false;
}

function hasValue(value: unknown, spec: CountryFieldSpec, payload: AnyObject) {
  const expectedType = spec.expectedType;
  if (spec.key === 'traveler_quotes') return travelerQuotesCoverage(value, payload);
  if (spec.key === 'appointment_issues') return appointmentIssuesCoverage(value, payload);
  if (spec.key === 'visa_work_availability') return workAvailabilityCoverage(value);
  if (spec.key === 'economy_gdp_usd') return economyGdpUsdCoverage(value, payload);
  if (value == null) return false;
  if (expectedType === 'array') return Array.isArray(value) && value.length > 0;
  if (expectedType === 'object') return typeof value === 'object' && !Array.isArray(value);
  if (expectedType === 'string') return typeof value === 'string' && value.trim().length > 0;
  if (expectedType === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (expectedType === 'boolean') return typeof value === 'boolean';
  return false;
}

function emptyDomainMap(): CompletenessReport['domains'] {
  return {
    identity: { score: 0, covered: 0, total: 0 },
    visa: { score: 0, covered: 0, total: 0 },
    friction: { score: 0, covered: 0, total: 0 },
    education: { score: 0, covered: 0, total: 0 },
    work: { score: 0, covered: 0, total: 0 },
    business: { score: 0, covered: 0, total: 0 },
    driving: { score: 0, covered: 0, total: 0 },
    community: { score: 0, covered: 0, total: 0 },
    signals: { score: 0, covered: 0, total: 0 },
    provenance: { score: 0, covered: 0, total: 0 },
    morocco_decision: { score: 0, covered: 0, total: 0 },
  };
}

export function buildCompletenessReport(countryPayload: AnyObject): CompletenessReport {
  const domains = emptyDomainMap();
  const missingFields: string[] = [];
  const criticalMissing: string[] = [];

  let coveredFields = 0;
  for (const spec of ALL_COUNTRY_FIELD_SPECS) {
    const value = getByPath(countryPayload, spec.path);
    const covered = hasValue(value, spec, countryPayload);
    domains[spec.domain].total += 1;
    if (covered) {
      coveredFields += 1;
      domains[spec.domain].covered += 1;
    } else {
      missingFields.push(spec.key);
      if (spec.critical) criticalMissing.push(spec.key);
    }
  }

  for (const domain of Object.keys(domains) as IntelligenceDomain[]) {
    const d = domains[domain];
    d.score = d.total === 0 ? 0 : Math.round((d.covered / d.total) * 100);
  }

  const totalSpecCount = ALL_COUNTRY_FIELD_SPECS.length;
  const score = totalSpecCount === 0 ? 0 : Math.round((coveredFields / totalSpecCount) * 100);

  return {
    score,
    totalFields: totalSpecCount,
    coveredFields,
    missingFields,
    criticalMissing,
    domains,
  };
}

export function buildCoverageManifest(report: CompletenessReport) {
  return {
    totalFields: report.totalFields,
    coveredFields: report.coveredFields,
    missingFields: report.missingFields,
    criticalMissing: report.criticalMissing,
    domainCoverage: report.domains,
    generatedAt: new Date().toISOString(),
  };
}
