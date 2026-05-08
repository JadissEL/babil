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
  runEnrichmentPipeline,
  runEnrichmentPipelineStub,
  seedIntelligenceSources,
  type PipelineResult,
} from './run-enrichment-stub'
export {
  INTELLIGENCE_TAXONOMY_VERSION,
  FIELD_GENERAL_POPULATION_TOTAL,
  FIELD_ECONOMY_GDP_USD_CURRENT,
  WORLD_BANK_INDICATORS,
  MATERIALIZE_TARGETS,
} from './taxonomy-v1'
export {
  normalizeCountryMatchKey,
  fetchWorldBankCountryIso2Map,
  resolveIso2ForBabilCountryName,
  fetchWorldBankLatestDatum,
  type WbDatum,
} from './world-bank-client'
export { runWorldBankCollector, type WorldBankCollectorResult } from './world-bank-collector'
export {
  materializeEconomyObservationsForCountry,
  materializeEconomyObservationsForAllCountries,
} from './materialize-economy-observations'
export { getIntelligenceProvenanceForCountry, type IntelligenceProvenanceRow } from './provenance'
