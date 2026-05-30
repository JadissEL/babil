/**
 * Maps intelligence domain + expectedType (+ optional uiPattern) → React block keys.
 */

import type { IntelligenceDomain } from '@/lib/country-intelligence-contract';

export type IntelligenceUiPattern =
  | 'economy_stat_panel'
  | 'visa_friction_alert'
  | 'traveler_quotes'
  | 'appointment_audit'
  | 'sourced_entry_list'
  | 'provenance_chip'
  | 'verified_updates_feed'
  | 'scholarship_table'
  | 'job_sponsorship_card'
  | 'business_setup_steps'
  | 'visa_document_timeline'
  | 'morocco_review_badge';

export type UiRegistryEntry = {
  pattern: IntelligenceUiPattern;
  domain: IntelligenceDomain;
  expectedTypes: Array<'string' | 'number' | 'boolean' | 'array' | 'object'>;
  contractKeys?: string[];
  fullDataPaths?: string[];
};

export const INTELLIGENCE_UI_REGISTRY: UiRegistryEntry[] = [
  {
    pattern: 'economy_stat_panel',
    domain: 'signals',
    expectedTypes: ['number'],
    contractKeys: ['economy_gdp_usd', 'economy_population_wb', 'economy_gdp_per_capita_usd'],
    fullDataPaths: ['economy.gdp_usd', 'economy.population_wb', 'economy.gdp_per_capita_usd'],
  },
  {
    pattern: 'visa_friction_alert',
    domain: 'friction',
    expectedTypes: ['string', 'number'],
    contractKeys: ['friction_score', 'appointment_difficulty', 'friction_risk_level'],
    fullDataPaths: ['friction_score', 'appointment_audit.official_difficulty'],
  },
  {
    pattern: 'traveler_quotes',
    domain: 'community',
    expectedTypes: ['array'],
    contractKeys: ['traveler_quotes'],
    fullDataPaths: ['traveler_quotes'],
  },
  {
    pattern: 'appointment_audit',
    domain: 'friction',
    expectedTypes: ['string', 'array', 'object'],
    contractKeys: ['appointment_platform', 'appointment_issues'],
    fullDataPaths: ['appointment_audit'],
  },
  {
    pattern: 'sourced_entry_list',
    domain: 'morocco_decision',
    expectedTypes: ['array', 'object'],
    fullDataPaths: ['morocco_research_pack.sourced_entries'],
  },
  {
    pattern: 'provenance_chip',
    domain: 'provenance',
    expectedTypes: ['string'],
    fullDataPaths: ['traveler_quotes_meta.status', '_intelligence.economy_materialized_at'],
  },
  {
    pattern: 'verified_updates_feed',
    domain: 'signals',
    expectedTypes: ['number', 'string'],
    fullDataPaths: ['_intelligence.economy_materialized_at'],
  },
  {
    pattern: 'scholarship_table',
    domain: 'education',
    expectedTypes: ['array', 'object'],
    fullDataPaths: ['education_mobility.language_study', 'education_mobility.short_courses'],
  },
  {
    pattern: 'job_sponsorship_card',
    domain: 'work',
    expectedTypes: ['string', 'boolean'],
    contractKeys: ['work_visa_score'],
    fullDataPaths: ['visa_system.work'],
  },
  {
    pattern: 'business_setup_steps',
    domain: 'business',
    expectedTypes: ['string', 'array'],
    contractKeys: ['visa_business_setup'],
    fullDataPaths: ['visa_system.business'],
  },
  {
    pattern: 'visa_document_timeline',
    domain: 'visa',
    expectedTypes: ['string', 'array'],
    fullDataPaths: ['visa_system.tourism', 'morocco_applicability'],
  },
  {
    pattern: 'morocco_review_badge',
    domain: 'morocco_decision',
    expectedTypes: ['string'],
    fullDataPaths: ['morocco_applicability', 'morocco_research_pack'],
  },
];

/** Map information model type → default UI pattern. */
export const INFORMATION_MODEL_UI_PATTERN: Record<string, IntelligenceUiPattern> = {
  visa: 'visa_document_timeline',
  scholarship: 'scholarship_table',
  job: 'job_sponsorship_card',
  business: 'business_setup_steps',
  residence: 'visa_friction_alert',
};

export function resolveUiPatternForPath(path: string): IntelligenceUiPattern | null {
  for (const entry of INTELLIGENCE_UI_REGISTRY) {
    if (entry.fullDataPaths?.some((p) => path === p || path.endsWith(`.${p}`))) {
      return entry.pattern;
    }
  }
  return null;
}
