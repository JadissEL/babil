/**
 * C.49 — Libellés FR pour les `fieldPath` du pipeline (provenance utilisateur / doc).
 * Garder aligné avec [taxonomy-v1.ts](intelligence-pipeline/taxonomy-v1.ts).
 *
 * PAGE 32 (Beacon) ajoute des champs optionnels d'affichage :
 *  - `sourceKind`  : pictogramme de famille (publique / institutionnelle / agent).
 *  - `exampleFr`   : exemple de valeur courte affichée dans le tableau.
 *  - `sourceLabelFr` : libellé court de la source d'autorité (ex. "World Bank").
 *  - `updatedAtFr` : étiquette courte de fraîcheur (ex. "2024-Q1", "Live", "2023").
 */

export type FieldPathSourceKind = 'publique' | 'institutionnelle' | 'agent';

export type FieldPathGlossaryEntry = {
  fieldPath: string;
  labelFr: string;
  descriptionFr: string;
  /** Chemin dans `full_data` après matérialisation, si applicable */
  materializedPathFr?: string;
  sourceKind?: FieldPathSourceKind;
  exampleFr?: string;
  sourceLabelFr?: string;
  updatedAtFr?: string;
};

/** Meta paths on golden record (not materialized economy stats). */
const META_GLOSSARY_ENTRIES: FieldPathGlossaryEntry[] = [
  {
    fieldPath: '_intelligence.field_lineage',
    labelFr: 'Lignée par champ (golden record)',
    descriptionFr:
      'Carte observationId → source, confiance et statut pour chaque champ promu dans full_data.',
    sourceKind: 'agent',
    exampleFr: 'world_bank · 91%',
    sourceLabelFr: 'Pipeline',
    updatedAtFr: 'Live',
  },
  {
    fieldPath: '_intelligence.disputed_field_paths',
    labelFr: 'Champs en litige',
    descriptionFr:
      'Liste des fieldPath taxonomy non promus tant qu’une contradiction n’est pas résolue (revue admin).',
    sourceKind: 'agent',
    exampleFr: 'economy.gdp_usd_current',
    sourceLabelFr: 'Contradiction pass',
    updatedAtFr: 'Live',
  },
];

export const INTELLIGENCE_FIELDPATH_GLOSSARY: FieldPathGlossaryEntry[] = [
  {
    fieldPath: 'general.population_total',
    labelFr: 'Population totale',
    descriptionFr: 'Nombre d’habitants (série World Bank WDI, dernière année disponible par pays).',
    materializedPathFr: 'economy.population_wb',
    sourceKind: 'institutionnelle',
    exampleFr: '67.4M',
    sourceLabelFr: 'World Bank',
    updatedAtFr: '2024-Q1',
  },
  {
    fieldPath: 'economy.gdp_usd_current',
    labelFr: 'PIB nominal (USD courants)',
    descriptionFr: 'Produit intérieur brut en dollars US courants (World Bank WDI).',
    materializedPathFr: 'economy.gdp_usd',
    sourceKind: 'institutionnelle',
    exampleFr: '2.78T',
    sourceLabelFr: 'World Bank',
    updatedAtFr: '2024-Q1',
  },
  {
    fieldPath: 'economy.gdp_per_capita_usd_current',
    labelFr: 'PIB par habitant (USD courants)',
    descriptionFr: 'PIB divisé par la population, en USD courants (World Bank WDI).',
    materializedPathFr: 'economy.gdp_per_capita_usd',
    sourceKind: 'institutionnelle',
    exampleFr: '41 350 $',
    sourceLabelFr: 'World Bank',
    updatedAtFr: '2024-Q1',
  },
  {
    fieldPath: 'quality.life_expectancy_years',
    labelFr: 'Espérance de vie à la naissance',
    descriptionFr: 'Années de vie moyenne à la naissance (World Bank WDI).',
    materializedPathFr: 'health.life_expectancy_years',
    sourceKind: 'institutionnelle',
    exampleFr: '82.4 ans',
    sourceLabelFr: 'World Bank',
    updatedAtFr: '2023',
  },
  {
    fieldPath: 'work.unemployment_rate_pct',
    labelFr: 'Chômage (% population active)',
    descriptionFr:
      'Part de la population active sans emploi, en % (série modélisée OIT / World Bank WDI).',
    materializedPathFr: 'work.unemployment_rate_pct',
    sourceKind: 'institutionnelle',
    exampleFr: '7.3 %',
    sourceLabelFr: 'OIT / World Bank',
    updatedAtFr: 'Live',
  },
  {
    fieldPath: 'provenance.world_bank.iso2',
    labelFr: 'Code ISO2 (World Bank)',
    descriptionFr: 'Identifiant pays ISO2 extrait de l’API World Bank v2 (métadonnées corridor).',
    sourceKind: 'institutionnelle',
    exampleFr: 'MA',
    sourceLabelFr: 'World Bank API',
    updatedAtFr: 'Live',
  },
  {
    fieldPath: 'geography.capital_coordinates_approx',
    labelFr: 'Coordonnées capitale (approx.)',
    descriptionFr:
      'Latitude/longitude approximatives depuis métadonnées World Bank (non substitut carte officielle).',
    sourceKind: 'institutionnelle',
    exampleFr: '33.97°N',
    sourceLabelFr: 'World Bank API',
    updatedAtFr: 'Live',
  },
  {
    fieldPath: 'demographics.urban_population_pct',
    labelFr: 'Population urbaine (% du total)',
    descriptionFr:
      'Part de la population vivant en zones urbaines (World Bank WDI, série SP.URB.TOTL.IN.ZS).',
    materializedPathFr: 'demographics.urban_population_wb_pct',
    sourceKind: 'institutionnelle',
    exampleFr: '81.5 %',
    sourceLabelFr: 'UN DESA',
    updatedAtFr: '2023',
  },
  ...META_GLOSSARY_ENTRIES,
];

const byPath = new Map(INTELLIGENCE_FIELDPATH_GLOSSARY.map((e) => [e.fieldPath, e]));

const MANIFEST_PROVENANCE_FALLBACK: FieldPathGlossaryEntry = {
  fieldPath: 'provenance.manifest.*',
  labelFr: 'Extrait source (manifeste HTTP)',
  descriptionFr:
    'Instantané allowlisté d’une source du manifeste agents (bronze). Non matérialisé automatiquement dans les indicateurs pays.',
  sourceKind: 'institutionnelle',
  exampleFr: 'HTTP 200',
  sourceLabelFr: 'Manifest',
  updatedAtFr: 'Live',
};

export function getIntelligenceFieldPathGlossaryEntry(
  fieldPath: string,
): FieldPathGlossaryEntry | undefined {
  const direct = byPath.get(fieldPath);
  if (direct) return direct;
  if (fieldPath.startsWith('provenance.manifest.')) {
    return { ...MANIFEST_PROVENANCE_FALLBACK, fieldPath };
  }
  return undefined;
}

/** All glossary rows including dynamic manifest provenance pattern label. */
export function listIntelligenceFieldPathGlossaryEntries(): FieldPathGlossaryEntry[] {
  const seen = new Set<string>();
  const rows: FieldPathGlossaryEntry[] = [];
  for (const e of [...INTELLIGENCE_FIELDPATH_GLOSSARY, MANIFEST_PROVENANCE_FALLBACK]) {
    if (seen.has(e.fieldPath)) continue;
    seen.add(e.fieldPath);
    rows.push(e);
  }
  return rows;
}
