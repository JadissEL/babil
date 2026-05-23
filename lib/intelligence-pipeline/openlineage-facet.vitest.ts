import { describe, expect, it } from 'vitest';
import { buildManifestFetchLineageFacet } from './openlineage-facet';

describe('buildManifestFetchLineageFacet', () => {
  it('builds inputs and outputs', () => {
    const f = buildManifestFetchLineageFacet({
      runId: 'run-1',
      jobKind: 'manifest_fetch',
      countryId: 3,
      countryName: 'France',
      sourceUrls: ['https://example.com/a'],
      observationFieldPaths: ['economy.gdp_usd_current', 'provenance.manifest.x.y'],
    });
    expect(f.namespace).toBe('babil.intelligence');
    expect(f.processingType).toBe('BATCH');
    expect(f.inputs).toHaveLength(1);
    expect(f.outputs.length).toBeGreaterThan(0);
  });
});
