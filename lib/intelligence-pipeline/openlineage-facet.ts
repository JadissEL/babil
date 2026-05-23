/**
 * OpenLineage-inspired run facets for enrichment / pipeline jobs.
 * @see https://openlineage.io/docs/spec/object-model
 */

export type OpenLineageRunFacet = {
  schemaVersion: 'openlineage-facet-v1';
  runId: string;
  jobKind: string;
  processingType: 'BATCH';
  integration: 'BABIL';
  countryId?: number;
  countryName?: string;
  namespace: 'babil.intelligence';
  inputs: Array<{ name: string; type: 'dataset' | 'url' }>;
  outputs: Array<{ fieldPath: string; observationCount?: number }>;
  recordedAt: string;
};

export function buildManifestFetchLineageFacet(args: {
  runId: string;
  jobKind: string;
  countryId: number;
  countryName: string;
  sourceUrls: string[];
  observationFieldPaths: string[];
}): OpenLineageRunFacet {
  const uniquePaths = Array.from(new Set(args.observationFieldPaths));
  return {
    schemaVersion: 'openlineage-facet-v1',
    runId: args.runId,
    jobKind: args.jobKind,
    processingType: 'BATCH',
    integration: 'BABIL',
    countryId: args.countryId,
    countryName: args.countryName,
    namespace: 'babil.intelligence',
    inputs: args.sourceUrls.slice(0, 32).map((url) => ({ name: url, type: 'url' })),
    outputs: uniquePaths.slice(0, 48).map((fieldPath) => ({ fieldPath })),
    recordedAt: new Date().toISOString(),
  };
}
