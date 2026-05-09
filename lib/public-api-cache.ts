/**
 * Shared `Cache-Control` for anonymous, user-agnostic GET handlers (CDN / browser).
 * Tune conservatively: list data changes rarely; country detail may include fresher aggregates.
 */

/** Merged countries list — safe to cache briefly at the edge. */
export const COUNTRIES_LIST_CACHE_CONTROL =
  'public, max-age=0, s-maxage=120, stale-while-revalidate=600'

/** Single country payload (may include observation aggregates) — shorter edge TTL. */
export const COUNTRY_DETAIL_CACHE_CONTROL =
  'public, max-age=0, s-maxage=60, stale-while-revalidate=300'
