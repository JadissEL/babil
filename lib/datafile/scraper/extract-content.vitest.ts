import { describe, expect, it } from 'vitest'

import { extractFromHtml } from '@/lib/datafile/scraper/extract-content'

describe('extractFromHtml', () => {
  it('extracts title and text from minimal html', () => {
    const html = '<html><head><title>Visa France</title></head><body><p>Requirements for Moroccan citizens.</p></body></html>'
    const out = extractFromHtml('https://example.com/visa', html)
    expect(out.title).toBe('Visa France')
    expect(out.excerpt).toContain('Moroccan')
    expect(out.pageType).toBe('visa')
  })
})
