/**
 * Optional cursor pagination for `GET /api/countries`.
 * Ordering matches {@link buildMergedCountriesList}: stable ascending `id`.
 */

export const COUNTRIES_LIST_PAGE_MIN = 1
export const COUNTRIES_LIST_PAGE_MAX = 200

export type CountriesListPaginationMode =
  | { mode: 'full' }
  | { mode: 'page'; limit: number; cursor: number | null }

export type CountriesListPaginationError = { ok: false; error: string }
export type CountriesListPaginationOk = { ok: true; query: CountriesListPaginationMode }

export function parseCountriesListPagination(searchParams: URLSearchParams): CountriesListPaginationOk | CountriesListPaginationError {
  const limitRaw = searchParams.get('limit')
  const cursorRaw = searchParams.get('cursor')

  if (limitRaw === null && cursorRaw === null) {
    return { ok: true, query: { mode: 'full' } }
  }

  if (limitRaw === null && cursorRaw !== null) {
    return { ok: false, error: 'cursor requires limit' }
  }

  const limit = Number.parseInt(limitRaw ?? '', 10)
  if (!Number.isFinite(limit) || limit < COUNTRIES_LIST_PAGE_MIN || limit > COUNTRIES_LIST_PAGE_MAX) {
    return {
      ok: false,
      error: `limit must be an integer between ${COUNTRIES_LIST_PAGE_MIN} and ${COUNTRIES_LIST_PAGE_MAX}`,
    }
  }

  let cursor: number | null = null
  if (cursorRaw !== null && cursorRaw !== '') {
    const c = Number.parseInt(cursorRaw, 10)
    if (!Number.isFinite(c) || c < 0) {
      return { ok: false, error: 'cursor must be a non-negative integer (country id)' }
    }
    cursor = c
  }

  return { ok: true, query: { mode: 'page', limit, cursor } }
}

export type CountriesListPageResult<T extends { id: number }> = {
  items: T[]
  nextCursor: number | null
  hasMore: boolean
}

/**
 * @param rows Already sorted by `id` ascending (as returned by merge helpers).
 * @param cursor Exclusive lower bound: return rows with `id > cursor`. `null` = start of list.
 */
export function paginateCountriesByStableId<T extends { id: number }>(
  rows: readonly T[],
  limit: number,
  cursor: number | null,
): CountriesListPageResult<T> {
  let i = 0
  if (cursor !== null) {
    while (i < rows.length && rows[i]!.id <= cursor) i++
  }
  const items = rows.slice(i, i + limit) as T[]
  const hasMore = i + limit < rows.length
  const lastId = items.length > 0 ? items[items.length - 1]!.id : null
  return {
    items,
    nextCursor: hasMore && lastId !== null ? lastId : null,
    hasMore,
  }
}
