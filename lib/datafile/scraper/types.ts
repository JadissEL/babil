/**
 * Types for the datafile scrape algorithm (~300 trusted sites).
 */

export type ScrapePageRecord = {
  url: string
  pageType: string
  title: string | null
  contentHash: string
  excerpt: string | null
  fetchedAt: string
  statusCode: number | null
  error?: string
}

export type ScrapeSourceResult = {
  sourceId: string
  name: string
  baseUrl: string
  status: 'complete' | 'skipped' | 'failed' | 'partial'
  robotsPolicy: string | null
  pagesScraped: number
  pages: ScrapePageRecord[]
  errorSummary?: string
  startedAt: string
  finishedAt: string
}

export type ScrapeRunManifest = {
  runId: string
  startedAt: string
  finishedAt?: string
  config: {
    maxPagesPerSource: number
    delayMsBetweenRequests: number
    maxSources: number | null
  }
  stats: {
    sourcesTotal: number
    sourcesAttempted: number
    sourcesComplete: number
    sourcesSkipped: number
    sourcesFailed: number
    pagesScraped: number
  }
  sourceIds: string[]
}
