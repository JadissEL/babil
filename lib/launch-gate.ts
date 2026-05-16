/**
 * Exhaustive launch gate: same machine-checkable bar for every country row.
 * "Complete" = structurally present or honest unknown — never silent fabrication.
 *
 * Append-only DB facts (`CountryObservation`, `IntelligenceSource`) remain the long-term
 * audit trail; this gate reads the materialized `Country` row + parsed `full_data` only.
 */

import {
  type CompletenessReport,
  buildCompletenessReport,
  buildCoverageManifest,
} from '@/lib/country-completeness';
import { MOROCCO_PACK_VERSION } from '@/lib/morocco-content-constants';

type AnyObject = Record<string, unknown>;

export const LAUNCH_GATE_DEFAULT_MIN_COMPLETENESS = Number(
  process.env.LAUNCH_COMPLETENESS_MIN ?? 72,
);

/** User-facing or machine unknowns that must not be confused with verified facts. */
export function isExplicitUnknownString(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const t = value.trim();
  if (!t) return false;
  if (/^à vérifier sur la source officielle/i.test(t)) return true;
  if (/^aucun taux public consolidé/i.test(t)) return true;
  if (/^non publié\b/i.test(t)) return true;
  return false;
}

export function buildCountryPayloadForLaunchGate(row: {
  name: string;
  region: string;
  schengen_flag: boolean;
  tourist_visa_score: number | null;
  study_visa_score: number | null;
  work_visa_score: number | null;
  business_visa_score: number | null;
  appointment_difficulty: string | null;
  full_data: AnyObject | null;
}): AnyObject {
  const full = row.full_data && typeof row.full_data === 'object' ? row.full_data : {};
  return {
    name: row.name,
    region: row.region,
    schengen_flag: row.schengen_flag,
    tourist_visa_score: row.tourist_visa_score ?? undefined,
    study_visa_score: row.study_visa_score ?? undefined,
    work_visa_score: row.work_visa_score ?? undefined,
    business_visa_score: row.business_visa_score ?? undefined,
    appointment_difficulty: row.appointment_difficulty ?? undefined,
    full_data: full,
  };
}

export type LaunchGateResult = {
  pass: boolean;
  countryId?: number;
  countryName: string;
  reasons: string[];
  completenessScore: number;
  criticalMissingKeys: string[];
  report: CompletenessReport;
};

function isExpectedMoroccoPackVersion(v: string): boolean {
  return v.trim() === MOROCCO_PACK_VERSION;
}

export function evaluateLaunchGate(
  row: Parameters<typeof buildCountryPayloadForLaunchGate>[0] & { id?: number },
  options: {
    minCompleteness?: number;
    requireAgentProvenance?: boolean;
    /**
     * When true (e.g. `--as-public` / static seed CI), completeness score + Morocco pack
     * still gate quality; `criticalMissing` is reported on the result but does not fail the
     * run — seeded JSON rows rarely satisfy every intelligence-contract critical key.
     */
    ignoreCriticalMissing?: boolean;
  } = {},
): LaunchGateResult {
  const payload = buildCountryPayloadForLaunchGate(row);
  const report = buildCompletenessReport(payload);
  const minScore = options.minCompleteness ?? LAUNCH_GATE_DEFAULT_MIN_COMPLETENESS;
  const requireAgentProvenance = options.requireAgentProvenance !== false;
  const ignoreCriticalMissing = options.ignoreCriticalMissing === true;
  const reasons: string[] = [];

  if (report.score < minScore) {
    reasons.push(`completeness_score_below_${minScore}:actual=${report.score}`);
  }

  if (!ignoreCriticalMissing && report.criticalMissing.length > 0) {
    reasons.push(`critical_missing:${report.criticalMissing.join(',')}`);
  }

  const full = payload.full_data as AnyObject;
  const agent = full._agent as AnyObject | undefined;

  if (requireAgentProvenance) {
    if (!agent || typeof agent !== 'object') {
      reasons.push('missing_full_data._agent');
    } else {
      if (typeof agent.updatedAt !== 'string' || !agent.updatedAt.trim()) {
        reasons.push('missing_full_data._agent.updatedAt');
      }
      const manifest = agent.coverageManifest;
      if (!manifest || typeof manifest !== 'object') {
        reasons.push('missing_full_data._agent.coverageManifest');
      }
    }
  }

  const pack = full.morocco_research_pack as AnyObject | undefined;
  const packVersion = typeof pack?._pack_version === 'string' ? pack._pack_version.trim() : '';
  if (!packVersion) {
    reasons.push('missing_morocco_research_pack._pack_version');
  } else if (!isExpectedMoroccoPackVersion(packVersion)) {
    reasons.push(`morocco_research_pack._pack_version_must_be_${MOROCCO_PACK_VERSION}`);
  }

  const pass = reasons.length === 0;

  return {
    pass,
    countryId: row.id,
    countryName: row.name,
    reasons,
    completenessScore: report.score,
    criticalMissingKeys: [...report.criticalMissing],
    report,
  };
}

export { buildCoverageManifest };
