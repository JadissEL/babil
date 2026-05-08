export type IntelligenceDomain =
  | 'identity'
  | 'visa'
  | 'friction'
  | 'education'
  | 'business'
  | 'driving'
  | 'community'
  | 'signals'
  | 'provenance'
  /** Données `full_data.morocco_research_pack` (décision Maroc → pays) */
  | 'morocco_decision'

export type CountryFieldSpec = {
  key: string
  path: string
  domain: IntelligenceDomain
  critical: boolean
  expectedType: 'string' | 'number' | 'boolean' | 'array' | 'object'
  justification: string
  acquisition: 'api' | 'scraping' | 'generated' | 'hybrid'
}

// Derived strictly from currently implemented product surfaces/routes.
export const COUNTRY_INTELLIGENCE_CONTRACT_V2: CountryFieldSpec[] = [
  { key: 'country_name', path: 'name', domain: 'identity', critical: true, expectedType: 'string', justification: 'Primary selector and card label across all country routes.', acquisition: 'api' },
  { key: 'country_region', path: 'region', domain: 'identity', critical: true, expectedType: 'string', justification: 'Explorer filtering and regional clustering.', acquisition: 'api' },
  { key: 'country_schengen_flag', path: 'schengen_flag', domain: 'identity', critical: true, expectedType: 'boolean', justification: 'Schengen page and Schengen-only filter.', acquisition: 'hybrid' },
  { key: 'official_score', path: 'full_data.official_score', domain: 'signals', critical: true, expectedType: 'number', justification: 'Referenced in recommendation/probability engines.', acquisition: 'hybrid' },
  { key: 'friction_score', path: 'full_data.friction_score', domain: 'friction', critical: true, expectedType: 'number', justification: 'Used to classify operational friction and ranking.', acquisition: 'hybrid' },
  { key: 'acceptance_rate_morocco', path: 'full_data.acceptance_rate_morocco', domain: 'signals', critical: true, expectedType: 'string', justification: 'Displayed/used in visa risk outputs for Moroccan users.', acquisition: 'scraping' },
  { key: 'confidence_score', path: 'full_data.confidence_score', domain: 'signals', critical: false, expectedType: 'number', justification: 'Used as confidence indicator on detail views.', acquisition: 'hybrid' },
  { key: 'brutal_reality_score', path: 'full_data.brutal_reality_score', domain: 'signals', critical: false, expectedType: 'number', justification: 'Detail-side reality framing and risk narrative.', acquisition: 'hybrid' },
  { key: 'tourist_visa_score', path: 'tourist_visa_score', domain: 'visa', critical: true, expectedType: 'number', justification: 'Country card visa probability and explorer weighting.', acquisition: 'hybrid' },
  { key: 'study_visa_score', path: 'study_visa_score', domain: 'visa', critical: true, expectedType: 'number', justification: 'Education and recommendation scoring.', acquisition: 'hybrid' },
  { key: 'work_visa_score', path: 'work_visa_score', domain: 'visa', critical: true, expectedType: 'number', justification: 'Probability/recommendation and compare flows.', acquisition: 'hybrid' },
  { key: 'business_visa_score', path: 'business_visa_score', domain: 'visa', critical: true, expectedType: 'number', justification: 'Business/investment recommendation outputs.', acquisition: 'hybrid' },
  { key: 'appointment_difficulty', path: 'appointment_difficulty', domain: 'friction', critical: true, expectedType: 'string', justification: 'Explorer filter and friction tier mapping.', acquisition: 'scraping' },
  { key: 'visa_processing_time', path: 'visa_processing_time', domain: 'visa', critical: false, expectedType: 'string', justification: 'Expected processing lead time in visa planning.', acquisition: 'scraping' },
  { key: 'rejection_risk', path: 'rejection_risk', domain: 'visa', critical: false, expectedType: 'string', justification: 'Displayed risk framing in recommendation outputs.', acquisition: 'hybrid' },
  { key: 'appointment_platform', path: 'full_data.appointment_audit.platform', domain: 'friction', critical: true, expectedType: 'string', justification: 'Country detail appointment system section.', acquisition: 'scraping' },
  { key: 'appointment_official_difficulty', path: 'full_data.appointment_audit.official_difficulty', domain: 'friction', critical: true, expectedType: 'string', justification: 'Core operational friction measurement.', acquisition: 'scraping' },
  { key: 'appointment_real_difficulty', path: 'full_data.appointment_audit.real_difficulty', domain: 'friction', critical: true, expectedType: 'string', justification: 'Gap between official and lived experience.', acquisition: 'scraping' },
  { key: 'appointment_avg_wait_time', path: 'full_data.appointment_audit.avg_wait_time', domain: 'friction', critical: true, expectedType: 'string', justification: 'User waiting-time expectation.', acquisition: 'scraping' },
  { key: 'appointment_issues', path: 'full_data.appointment_audit.issues', domain: 'friction', critical: true, expectedType: 'array', justification: 'Explicit blockers shown in appointment audit.', acquisition: 'scraping' },
  { key: 'friction_real_delay', path: 'full_data.friction_analysis.real_delay', domain: 'friction', critical: false, expectedType: 'string', justification: 'Delay narrative in Schengen and recommendation pages.', acquisition: 'scraping' },
  { key: 'friction_risk_level', path: 'full_data.friction_analysis.risk_level', domain: 'friction', critical: true, expectedType: 'string', justification: 'Risk badge and filtering semantics.', acquisition: 'hybrid' },
  { key: 'friction_transparency_score', path: 'full_data.friction_analysis.transparency_score', domain: 'friction', critical: false, expectedType: 'number', justification: 'Recommendation trust weighting.', acquisition: 'hybrid' },
  { key: 'visa_tourism_difficulty', path: 'full_data.visa_system.tourism.difficulty', domain: 'visa', critical: true, expectedType: 'string', justification: 'Tourism decision surfaces.', acquisition: 'scraping' },
  { key: 'visa_work_availability', path: 'full_data.visa_system.work.availability', domain: 'visa', critical: true, expectedType: 'boolean', justification: 'Work track recommendations.', acquisition: 'scraping' },
  { key: 'visa_business_setup', path: 'full_data.visa_system.business.setup', domain: 'business', critical: true, expectedType: 'string', justification: 'Business page setup panel.', acquisition: 'scraping' },
  { key: 'visa_business_rights', path: 'full_data.visa_system.business.rights', domain: 'business', critical: false, expectedType: 'string', justification: 'Business rights explanatory context.', acquisition: 'scraping' },
  { key: 'education_language_study', path: 'full_data.education_mobility.language_study', domain: 'education', critical: true, expectedType: 'object', justification: 'Education hub language tab.', acquisition: 'scraping' },
  { key: 'education_technical_training', path: 'full_data.education_mobility.technical_training', domain: 'education', critical: true, expectedType: 'object', justification: 'Education hub technical tab.', acquisition: 'scraping' },
  { key: 'education_short_courses', path: 'full_data.education_mobility.short_courses', domain: 'education', critical: true, expectedType: 'object', justification: 'Education hub short courses tab.', acquisition: 'scraping' },
  { key: 'education_phd_studies', path: 'full_data.phd_studies', domain: 'education', critical: false, expectedType: 'object', justification: 'Country detail PhD decision section; schema-normalized enrichment surface.', acquisition: 'scraping' },
  { key: 'education_language_bac_required', path: 'full_data.education_mobility.language_study.bac_required', domain: 'education', critical: false, expectedType: 'boolean', justification: 'Bac/no-bac accessibility decision.', acquisition: 'scraping' },
  { key: 'education_technical_visa_type', path: 'full_data.education_mobility.technical_training.visa', domain: 'education', critical: false, expectedType: 'string', justification: 'Visa route for technical training.', acquisition: 'scraping' },
  { key: 'street_food_opportunity', path: 'full_data.street_food.opportunity', domain: 'business', critical: true, expectedType: 'string', justification: 'Business page micro-business pillar.', acquisition: 'scraping' },
  { key: 'street_food_investment_min', path: 'full_data.street_food.investment_min', domain: 'business', critical: false, expectedType: 'number', justification: 'Investment barrier shown on business pages.', acquisition: 'scraping' },
  { key: 'street_food_barriers', path: 'full_data.street_food.barriers', domain: 'business', critical: false, expectedType: 'array', justification: 'Operational constraints list.', acquisition: 'scraping' },
  { key: 'driving_license_status', path: 'full_data.driving_license.status', domain: 'driving', critical: true, expectedType: 'string', justification: 'Permis status badge per country.', acquisition: 'scraping' },
  { key: 'driving_license_duration', path: 'full_data.driving_license.duration', domain: 'driving', critical: false, expectedType: 'string', justification: 'Validity duration expectation.', acquisition: 'scraping' },
  { key: 'driving_license_conversion_possible', path: 'full_data.driving_license.conversion_possible', domain: 'driving', critical: true, expectedType: 'boolean', justification: 'Conversion decision key.', acquisition: 'scraping' },
  { key: 'driving_license_conversion_details', path: 'full_data.driving_license.conversion_details', domain: 'driving', critical: false, expectedType: 'string', justification: 'Conversion process narrative.', acquisition: 'scraping' },
  { key: 'driving_rights_schema_v1', path: 'full_data.driving_rights.meta.schemaVersion', domain: 'driving', critical: false, expectedType: 'number', justification: 'Structured driving intelligence for Moroccan license holders (eligibility, residency, conversion, sources).', acquisition: 'hybrid' },
  { key: 'driving_rights_sources', path: 'full_data.driving_rights.meta.sources', domain: 'driving', critical: false, expectedType: 'array', justification: 'Official URLs for legal verification of driving rules.', acquisition: 'scraping' },
  { key: 'driving_rights_summary_fr', path: 'full_data.driving_rights.simpleSummaryFr', domain: 'driving', critical: false, expectedType: 'string', justification: 'Plain-language Moroccan-user summary for permis section.', acquisition: 'hybrid' },
  { key: 'morocco_reality', path: 'full_data.morocco_insights.reality', domain: 'community', critical: false, expectedType: 'string', justification: 'Contextual local lens text.', acquisition: 'generated' },
  { key: 'morocco_pro_tip', path: 'full_data.morocco_insights.pro_tip', domain: 'community', critical: false, expectedType: 'string', justification: 'Actionable user hint for Moroccan profiles.', acquisition: 'generated' },
  { key: 'morocco_darija_note', path: 'full_data.morocco_insights.darija_note', domain: 'community', critical: false, expectedType: 'string', justification: 'Localized language engagement note.', acquisition: 'generated' },
  { key: 'embassy_behavior', path: 'full_data.embassy_behavior', domain: 'community', critical: false, expectedType: 'string', justification: 'Displayed in Schengen/Detail behavior context.', acquisition: 'scraping' },
  { key: 'travel_reasons', path: 'full_data.travel_reasons', domain: 'community', critical: true, expectedType: 'array', justification: 'Country detail inspirational section.', acquisition: 'generated' },
  { key: 'traveler_quotes', path: 'full_data.traveler_quotes', domain: 'community', critical: true, expectedType: 'array', justification: 'Country detail quotes section with strict distribution.', acquisition: 'hybrid' },
  { key: 'traveler_quotes_meta_status', path: 'full_data.traveler_quotes_meta.status', domain: 'provenance', critical: true, expectedType: 'string', justification: 'Verifiability state of quotes content.', acquisition: 'hybrid' },
  { key: 'overview_extract', path: 'full_data.overview.extract', domain: 'signals', critical: true, expectedType: 'string', justification: 'General summary baseline for country context.', acquisition: 'api' },
  { key: 'economy_gdp_usd', path: 'full_data.economy.gdp_usd', domain: 'signals', critical: true, expectedType: 'number', justification: 'Economy signal used in country intelligence.', acquisition: 'api' },
  { key: 'agent_updated_at', path: 'full_data._agent.updatedAt', domain: 'provenance', critical: true, expectedType: 'string', justification: 'Freshness and admin monitoring.', acquisition: 'generated' },
  { key: 'agent_source_hash', path: 'full_data._agent.sourceHash', domain: 'provenance', critical: false, expectedType: 'string', justification: 'Detect payload identity/update drift.', acquisition: 'generated' },
  { key: 'coverage_manifest', path: 'full_data._agent.coverageManifest', domain: 'provenance', critical: true, expectedType: 'object', justification: 'Tracks covered vs missing fields per country.', acquisition: 'generated' },
  { key: 'completeness_score', path: 'full_data._agent.completeness.score', domain: 'provenance', critical: true, expectedType: 'number', justification: 'Country readiness ranking for enrichment sequencing.', acquisition: 'generated' },
]

export const CONTRACT_VERSION = 'country-intelligence-v3'

export const CONTRACT_CRITICAL_KEYS = COUNTRY_INTELLIGENCE_CONTRACT_V2.filter((f) => f.critical).map(
  (f) => f.key,
)
