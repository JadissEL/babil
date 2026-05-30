export type SourcePageType =
  | 'visa'
  | 'education'
  | 'pdf'
  | 'faq'
  | 'news'
  | 'api'
  | 'employment'
  | 'other'

export type SourceCapabilities = {
  hasPdf: boolean
  hasApi: boolean
  hasCountryPages: boolean
  hasDynamicContent: boolean
}

export type DiscoveryMapResult = {
  sourceId: string
  status: 'complete' | 'failed' | 'procedural_no_fetch'
  pageCount: number
  sitemapUrl: string | null
  robotsPolicy: string | null
  capabilities: SourceCapabilities
  errorSummary?: string
}
