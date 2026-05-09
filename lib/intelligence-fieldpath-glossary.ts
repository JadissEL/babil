/**
 * C.49 — Libellés FR pour les `fieldPath` du pipeline (provenance utilisateur / doc).
 * Garder aligné avec [taxonomy-v1.ts](intelligence-pipeline/taxonomy-v1.ts).
 */

export type FieldPathGlossaryEntry = {
  fieldPath: string
  labelFr: string
  descriptionFr: string
  /** Chemin dans `full_data` après matérialisation, si applicable */
  materializedPathFr?: string
}

export const INTELLIGENCE_FIELDPATH_GLOSSARY: FieldPathGlossaryEntry[] = [
  {
    fieldPath: 'general.population_total',
    labelFr: 'Population totale',
    descriptionFr: 'Nombre d’habitants (série World Bank WDI, dernière année disponible par pays).',
    materializedPathFr: 'economy.population_wb',
  },
  {
    fieldPath: 'economy.gdp_usd_current',
    labelFr: 'PIB nominal (USD courants)',
    descriptionFr: 'Produit intérieur brut en dollars US courants (World Bank WDI).',
    materializedPathFr: 'economy.gdp_usd',
  },
  {
    fieldPath: 'economy.gdp_per_capita_usd_current',
    labelFr: 'PIB par habitant (USD courants)',
    descriptionFr: 'PIB divisé par la population, en USD courants (World Bank WDI).',
    materializedPathFr: 'economy.gdp_per_capita_usd',
  },
  {
    fieldPath: 'quality.life_expectancy_years',
    labelFr: 'Espérance de vie à la naissance',
    descriptionFr: 'Années de vie moyenne à la naissance (World Bank WDI).',
    materializedPathFr: 'health.life_expectancy_years',
  },
  {
    fieldPath: 'work.unemployment_rate_pct',
    labelFr: 'Chômage (% population active)',
    descriptionFr: 'Part de la population active sans emploi, en % (série modélisée OIT / World Bank WDI).',
    materializedPathFr: 'work.unemployment_rate_pct',
  },
  {
    fieldPath: 'demographics.urban_population_pct',
    labelFr: 'Population urbaine (% du total)',
    descriptionFr: 'Part de la population vivant en zones urbaines (World Bank WDI, série SP.URB.TOTL.IN.ZS).',
    materializedPathFr: 'demographics.urban_population_wb_pct',
  },
]

const byPath = new Map(INTELLIGENCE_FIELDPATH_GLOSSARY.map((e) => [e.fieldPath, e]))

export function getIntelligenceFieldPathGlossaryEntry(fieldPath: string): FieldPathGlossaryEntry | undefined {
  return byPath.get(fieldPath)
}
