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
  | 'verified_updates_feed';

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
];

export function resolveUiPatternForPath(path: string): IntelligenceUiPattern | null {
  for (const entry of INTELLIGENCE_UI_REGISTRY) {
    if (entry.fullDataPaths?.some((p) => path === p || path.endsWith(`.${p}`))) {
      return entry.pattern;
    }
  }
  return null;
}
