import { createHash } from 'node:crypto'

import { classifyPageUrl } from '@/lib/source-discovery/classify-page'

export function contentHash(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 32)
}

export function extractFromHtml(url: string, html: string): {
  title: string | null
  excerpt: string | null
  pageType: string
  hash: string
} {
  const titleM = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const title = titleM?.[1]?.trim().slice(0, 300) ?? null

  let body = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const maxLen = Number(process.env.DATAFILE_SCRAPE_EXCERPT_MAX || 4000)
  if (body.length > maxLen) body = `${body.slice(0, maxLen)}…`

  const excerpt = body.length > 0 ? body : null
  const pageType = classifyPageUrl(url, title)
  const hash = contentHash(`${url}:${excerpt ?? title ?? ''}`)

  return { title, excerpt, pageType, hash }
}
