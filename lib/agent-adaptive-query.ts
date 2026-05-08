import {
  AGENT_MOROCCO_RESEARCH_HINT,
  AGENT_PRIMARY_RESEARCH_HINT,
} from './agent-research-sources'

export type Domain = 'overview' | 'economy' | 'education' | 'business' | 'driving' | 'community'

const DOMAIN_HINTS: Record<Domain, string[]> = {
  overview: ['country profile overview', 'capital population quick facts'],
  economy: ['gdp latest world bank', 'economic outlook'],
  education: ['education mobility access', 'language training options', 'PhD doctoral study visa funding pathways'],
  business: ['business setup conditions', 'street food business opportunity'],
  driving: [
    'Morocco driving license international driving permit IDP Geneva Vienna convention',
    'foreign driving license exchange conversion transport ministry official site',
    'visitor tourist student work permit resident driving license validity months',
  ],
  community: ['traveler quotes verified sources', 'appointment audit lived experience'],
}

const AGENT_MOROCCO_HINT_IN_QUERIES = process.env.AGENT_MOROCCO_HINT === '1'

export function resolveAdaptiveQuery(country: string, missingCritical: string[]) {
  const hints = Object.entries(DOMAIN_HINTS)
    .filter(([domain]) =>
      missingCritical.some((field) => field.startsWith(`${domain}_`) || field.includes(domain)),
    )
    .flatMap(([, values]) => values)
  const normalizedHints = hints.length > 0 ? hints : ['country intelligence evidence']
  const base = `${country} :: ${normalizedHints.slice(0, 3).join(' | ')} :: ${AGENT_PRIMARY_RESEARCH_HINT}`
  return AGENT_MOROCCO_HINT_IN_QUERIES ? `${base} :: ${AGENT_MOROCCO_RESEARCH_HINT}` : base
}

export function resolveAdaptiveQueryFromSnapshot(
  country: string,
  missingCritical: string[],
  fullData: Record<string, unknown>,
) {
  const sections = [
    { key: 'overview', value: fullData.overview },
    { key: 'economy', value: fullData.economy },
    { key: 'appointment_audit', value: fullData.appointment_audit },
    { key: 'visa_system', value: fullData.visa_system },
    { key: 'morocco_insights', value: fullData.morocco_insights },
    { key: 'travel_reasons', value: fullData.travel_reasons },
    { key: 'traveler_quotes', value: fullData.traveler_quotes },
    { key: 'phd_studies', value: fullData.phd_studies },
    { key: 'driving_license', value: fullData.driving_license },
    { key: 'driving_rights', value: fullData.driving_rights },
  ]

  const weakSections = sections
    .filter((section) => {
      const value = section.value
      if (value == null) return true
      if (Array.isArray(value)) return value.length === 0
      if (typeof value === 'string') return value.trim().length === 0
      if (typeof value === 'object') return Object.keys(value as Record<string, unknown>).length === 0
      return false
    })
    .map((section) => section.key)

  const coreQuery = resolveAdaptiveQuery(country, missingCritical)
  if (weakSections.length === 0) return coreQuery
  return `${coreQuery} | fill:${weakSections.slice(0, 3).join(',')}`
}
