import { describe, expect, it } from 'vitest'

import { isLikelyHtmlPageUrl, isSitemapXmlUrl } from '@/lib/datafile/scraper/discover-page-urls'

describe('discover-page-urls', () => {
  it('detects sitemap xml URLs', () => {
    expect(isSitemapXmlUrl('https://france-visas.gouv.fr/sitemap.xml')).toBe(true)
    expect(isSitemapXmlUrl('https://example.com/visa/guide')).toBe(false)
  })

  it('allows html paths', () => {
    expect(isLikelyHtmlPageUrl('https://france-visas.gouv.fr/en/visa')).toBe(true)
    expect(isLikelyHtmlPageUrl('https://example.com/file.pdf')).toBe(false)
  })
})
