import { describe, expect, it } from 'vitest';
import { buildCountryPageJsonLd } from '@/lib/country-page-json-ld';

describe('buildCountryPageJsonLd', () => {
  it('returns WebPage and FAQPage graph entries', () => {
    const doc = buildCountryPageJsonLd({
      origin: 'https://example.com',
      countryId: '12',
      name: 'France',
      region: 'Europe',
      title: 'France — visa & mobilité · Schengen',
      description: 'Test description',
    });
    expect(doc['@context']).toBe('https://schema.org');
    const graph = doc['@graph'] as Array<Record<string, unknown>>;
    expect(Array.isArray(graph)).toBe(true);
    expect(graph.some((n) => n['@type'] === 'WebPage')).toBe(true);
    expect(graph.some((n) => n['@type'] === 'FAQPage')).toBe(true);
  });
});
