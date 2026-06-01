/**
 * Alternate entry URLs when homepage returns 403/empty but sitemap may work on another host.
 */

export const HOST_FALLBACK_URLS: Record<string, string[]> = {
  'www.oecd.org': ['https://stats.oecd.org', 'https://www.oecd.org/en.html'],
  'oecd.org': ['https://stats.oecd.org'],
  'www.un.org': ['https://data.un.org', 'https://www.un.org/en'],
  'un.org': ['https://data.un.org'],
  'www.who.int': ['https://www.who.int/news-room'],
  'www.imf.org': ['https://www.imf.org/en/Data'],
  'www.wto.org': ['https://www.wto.org/english/res_e/statis_e/statis_e.htm'],
  'www.statista.com': ['https://www.statista.com/statistics/'],
  'data.world': ['https://data.world/search'],
}

export function fallbackUrlsForOrigin(origin: string): string[] {
  try {
    const host = new URL(origin).hostname
    return HOST_FALLBACK_URLS[host] ?? []
  } catch {
    return []
  }
}
