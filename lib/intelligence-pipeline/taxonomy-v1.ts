/**
 * Taxonomie v1 des `fieldPath` pour `CountryObservation`.
 * Versionner ce fichier quand les clés changent (éviter la dérive silencieuse).
 */

export const INTELLIGENCE_TAXONOMY_VERSION = 'v1' as const;

/** Population totale (habitants) — source typique : World Bank WDI SP.POP.TOTL */
export const FIELD_GENERAL_POPULATION_TOTAL = 'general.population_total' as const;

/** PIB nominal courant USD — World Bank WDI NY.GDP.MKTP.CD */
export const FIELD_ECONOMY_GDP_USD_CURRENT = 'economy.gdp_usd_current' as const;

/** PIB par habitant, USD courants — World Bank WDI NY.GDP.PCAP.CD */
export const FIELD_ECONOMY_GDP_PER_CAPITA_USD_CURRENT =
  'economy.gdp_per_capita_usd_current' as const;

/** Espérance de vie à la naissance (années) — World Bank WDI SP.DYN.LE00.IN */
export const FIELD_QUALITY_LIFE_EXPECTANCY_YEARS = 'quality.life_expectancy_years' as const;

/** Chômage (% de la population active, série modélisée OIT) — World Bank WDI SL.UEM.TOTL.ZS */
export const FIELD_WORK_UNEMPLOYMENT_RATE_PCT = 'work.unemployment_rate_pct' as const;

/** Population urbaine (% de la population totale) — World Bank WDI SP.URB.TOTL.IN.ZS */
export const FIELD_DEMOGRAPHICS_URBAN_POPULATION_PCT = 'demographics.urban_population_pct' as const;

export const WORLD_BANK_INDICATORS = {
  population: 'SP.POP.TOTL',
  gdpUsd: 'NY.GDP.MKTP.CD',
  gdpPerCapitaUsd: 'NY.GDP.PCAP.CD',
  lifeExpectancy: 'SP.DYN.LE00.IN',
  unemploymentTotalLaborForce: 'SL.UEM.TOTL.ZS',
  urbanPopulationPct: 'SP.URB.TOTL.IN.ZS',
} as const;

export const MATERIALIZE_TARGETS: Record<string, { fullDataPath: string; kind: 'number' }> = {
  [FIELD_ECONOMY_GDP_USD_CURRENT]: { fullDataPath: 'economy.gdp_usd', kind: 'number' },
  [FIELD_GENERAL_POPULATION_TOTAL]: { fullDataPath: 'economy.population_wb', kind: 'number' },
  [FIELD_ECONOMY_GDP_PER_CAPITA_USD_CURRENT]: {
    fullDataPath: 'economy.gdp_per_capita_usd',
    kind: 'number',
  },
  [FIELD_QUALITY_LIFE_EXPECTANCY_YEARS]: {
    fullDataPath: 'health.life_expectancy_years',
    kind: 'number',
  },
  [FIELD_WORK_UNEMPLOYMENT_RATE_PCT]: {
    fullDataPath: 'work.unemployment_rate_pct',
    kind: 'number',
  },
  [FIELD_DEMOGRAPHICS_URBAN_POPULATION_PCT]: {
    fullDataPath: 'demographics.urban_population_wb_pct',
    kind: 'number',
  },
};
