export {
  tierRank,
  compareObservationPrecedence,
  pickWinningValueJsonByPath,
  setDeep,
  nestedObjectFromWinners,
  type ObservationForMerge,
} from './merge-observations'
export { DEFAULT_INTELLIGENCE_SOURCES, type DefaultSourceSeed } from './default-sources'
export {
  isIntelligenceSourceCollectionEnabled,
  parseDisabledIntelligenceSourceSlugs,
} from './source-collection-flags'
export {
  runEnrichmentPipeline,
  runEnrichmentPipelineStub,
  seedIntelligenceSources,
  type PipelineResult,
} from './run-enrichment-stub'
export {
  INTELLIGENCE_TAXONOMY_VERSION,
  FIELD_GENERAL_POPULATION_TOTAL,
  FIELD_ECONOMY_GDP_USD_CURRENT,
  FIELD_ECONOMY_GDP_PER_CAPITA_USD_CURRENT,
  FIELD_QUALITY_LIFE_EXPECTANCY_YEARS,
  FIELD_WORK_UNEMPLOYMENT_RATE_PCT,
  FIELD_DEMOGRAPHICS_URBAN_POPULATION_PCT,
  WORLD_BANK_INDICATORS,
  MATERIALIZE_TARGETS,
} from './taxonomy-v1'
export {
  normalizeCountryMatchKey,
  fetchWorldBankCountryIso2Map,
  resolveIso2ForBabilCountryName,
  fetchWorldBankLatestDatum,
  fetchWorldBankLatestDataForCountriesBatch,
  wbBatchRowsToDatumMap,
  chunkIso2ForWorldBank,
  type WbDatum,
} from './world-bank-client'
export { iso2FromIntelligenceOverride, COUNTRY_ISO2_OVERRIDES } from './country-iso-overrides'
export { runWorldBankCollector, type WorldBankCollectorResult } from './world-bank-collector'
export {
  materializeEconomyObservationsForCountry,
  materializeEconomyObservationsForAllCountries,
} from './materialize-economy-observations'
export { getIntelligenceProvenanceForCountry, type IntelligenceProvenanceRow } from './provenance'
