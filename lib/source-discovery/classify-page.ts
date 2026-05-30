import type { SourcePageType } from '@/lib/source-discovery/types'

const RULES: Array<{ type: SourcePageType; patterns: RegExp[] }> = [
  { type: 'visa', patterns: [/visa/i, /immigration/i, /consul/i, /entry-require/i] },
  { type: 'education', patterns: [/study/i, /universit/i, /scholarship/i, /student/i] },
  { type: 'employment', patterns: [/work-permit/i, /employment/i, /job/i, /sponsor/i] },
  { type: 'pdf', patterns: [/\.pdf($|\?)/i] },
  { type: 'faq', patterns: [/faq/i, /frequently-asked/i] },
  { type: 'news', patterns: [/news/i, /press/i, /announcement/i] },
  { type: 'api', patterns: [/api\./i, /\/api\//i, /openapi/i] },
]

export function classifyPageUrl(url: string, title?: string | null): SourcePageType {
  const hay = `${url} ${title ?? ''}`
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(hay))) return rule.type
  }
  return 'other'
}
