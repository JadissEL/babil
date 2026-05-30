/**
 * Deterministic Morocco passport applicability (cases A–E).
 */

import type {
  ApplicabilityCase,
  ApplicabilityDecision,
  MoroccoApplicabilityResult,
} from '@/lib/morocco-applicability/types'

const AFRICA_ISO = new Set([
  'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CV', 'CM', 'CF', 'TD', 'KM', 'CG', 'CD', 'CI', 'DJ',
  'EG', 'GQ', 'ER', 'SZ', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'KE', 'LS', 'LR', 'LY', 'MG',
  'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RW', 'ST', 'SN', 'SC', 'SL', 'SO',
  'ZA', 'SS', 'SD', 'TZ', 'TG', 'TN', 'UG', 'ZM', 'ZW',
])

const MENA_ISO = new Set([
  'MA', 'DZ', 'TN', 'LY', 'EG', 'SD', 'MR', 'SA', 'AE', 'QA', 'BH', 'KW', 'OM', 'YE', 'JO',
  'LB', 'SY', 'IQ', 'IR', 'IL', 'PS', 'TR',
])

export type ApplicabilityInput = {
  countryIso: string
  /** Raw scope text from source (e.g. "all nationalities", "EU citizens only"). */
  scopeText?: string | null
  /** Target destination ISO for the rule. */
  destinationIso?: string | null
  moroccanVisaExempt?: boolean
  evidenceObservationIds?: string[]
}

function fieldPathFor(caseId: ApplicabilityCase, destinationIso: string): string {
  return `morocco_applicability.${caseId.toLowerCase()}.${destinationIso.toLowerCase()}`
}

export function evaluateMoroccoApplicability(input: ApplicabilityInput): MoroccoApplicabilityResult {
  const scope = (input.scopeText ?? '').toLowerCase().trim()
  const dest = (input.destinationIso ?? 'XX').toUpperCase()
  const evidence = input.evidenceObservationIds ?? []

  if (input.moroccanVisaExempt) {
    return {
      case: 'E',
      decision: 'include',
      scope: 'morocco_exempt',
      rationale: 'Morocco passport listed as visa-exempt for destination (tier C corroboration required).',
      evidenceObservationIds: evidence,
      fieldPath: fieldPathFor('E', dest),
    }
  }

  if (
    !scope ||
    scope.includes('all nationalit') ||
    scope.includes('toutes nationalit') ||
    scope.includes('any nationality') ||
    scope === 'universal'
  ) {
    return {
      case: 'A',
      decision: 'include',
      scope: 'universal',
      rationale: 'Requirement applies to all nationalities including Morocco.',
      evidenceObservationIds: evidence,
      fieldPath: fieldPathFor('A', dest),
    }
  }

  if (scope.includes('africa') || scope.includes('afrique')) {
    const decision: ApplicabilityDecision = AFRICA_ISO.has('MA') ? 'include' : 'review'
    return {
      case: 'B',
      decision,
      scope: 'african_nationalities',
      rationale: 'Rule targets African nationals; Morocco included — confirm bilateral treaties.',
      evidenceObservationIds: evidence,
      fieldPath: fieldPathFor('B', dest),
    }
  }

  if (scope.includes('mena') || scope.includes('maghreb') || scope.includes('arab')) {
    const decision: ApplicabilityDecision = MENA_ISO.has('MA') ? 'include' : 'review'
    return {
      case: 'C',
      decision,
      scope: 'mena_nationalities',
      rationale: 'Rule targets MENA/Maghreb nationals; Morocco likely in scope — admin review if unclear.',
      evidenceObservationIds: evidence,
      fieldPath: fieldPathFor('C', dest),
    }
  }

  if (scope.includes('eu ') || scope.includes('schengen') || scope.includes('third country')) {
    return {
      case: 'D',
      decision: 'review',
      scope: 'third_country_tier',
      rationale: 'Third-country or regional carve-out — requires legal parse with citation (never silent exclude).',
      evidenceObservationIds: evidence,
      fieldPath: fieldPathFor('D', dest),
    }
  }

  if (scope.includes('morocco') || scope.includes('maroc')) {
    return {
      case: 'D',
      decision: 'include',
      scope: 'morocco_named',
      rationale: 'Morocco explicitly named in scope text.',
      evidenceObservationIds: evidence,
      fieldPath: fieldPathFor('D', dest),
    }
  }

  return {
    case: 'D',
    decision: 'review',
    scope: 'unknown',
    rationale: 'Scope unclear — routed to admin review (no silent exclusion).',
    evidenceObservationIds: evidence,
    fieldPath: fieldPathFor('D', dest),
  }
}
