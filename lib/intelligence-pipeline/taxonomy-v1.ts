/**
 * Taxonomie v1 des `fieldPath` pour `CountryObservation`.
 * Versionner ce fichier quand les clés changent (éviter la dérive silencieuse).
 */

export const INTELLIGENCE_TAXONOMY_VERSION = 'v1' as const

/** Population totale (habitants) — source typique : World Bank WDI SP.POP.TOTL */
export const FIELD_GENERAL_POPULATION_TOTAL = 'general.population_total' as const

/** PIB nominal courant USD — World Bank WDI NY.GDP.MKTP.CD */
export const FIELD_ECONOMY_GDP_USD_CURRENT = 'economy.gdp_usd_current' as const

/** PIB par habitant, USD courants — World Bank WDI NY.GDP.PCAP.CD */
export const FIELD_ECONOMY_GDP_PER_CAPITA_USD_CURRENT = 'economy.gdp_per_capita_usd_current' as const

export const WORLD_BANK_INDICATORS = {
  population: 'SP.POP.TOTL',
  gdpUsd: 'NY.GDP.MKTP.CD',
  gdpPerCapitaUsd: 'NY.GDP.PCAP.CD',
} as const

export const MATERIALIZE_TARGETS: Record<
  string,
  { fullDataPath: string; kind: 'number' }
> = {
  [FIELD_ECONOMY_GDP_USD_CURRENT]: { fullDataPath: 'economy.gdp_usd', kind: 'number' },
  [FIELD_GENERAL_POPULATION_TOTAL]: { fullDataPath: 'economy.population_wb', kind: 'number' },
  [FIELD_ECONOMY_GDP_PER_CAPITA_USD_CURRENT]: { fullDataPath: 'economy.gdp_per_capita_usd', kind: 'number' },
}
