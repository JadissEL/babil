import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  COUNTRIES_LIST_PAGE_MAX,
  paginateCountriesByStableId,
  parseCountriesListPagination,
} from '@/lib/countries-list-pagination'

test('parseCountriesListPagination: full list when no params', () => {
  const r = parseCountriesListPagination(new URLSearchParams())
  assert.equal(r.ok, true)
  if (r.ok) assert.deepEqual(r.query, { mode: 'full' })
})

test('parseCountriesListPagination: page mode', () => {
  const r = parseCountriesListPagination(new URLSearchParams({ limit: '2', cursor: '10' }))
  assert.equal(r.ok, true)
  if (r.ok) assert.deepEqual(r.query, { mode: 'page', limit: 2, cursor: 10 })
})

test('parseCountriesListPagination: cursor without limit fails', () => {
  const r = parseCountriesListPagination(new URLSearchParams({ cursor: '5' }))
  assert.equal(r.ok, false)
})

test('parseCountriesListPagination: limit bounds', () => {
  assert.equal(parseCountriesListPagination(new URLSearchParams({ limit: '0' })).ok, false)
  assert.equal(
    parseCountriesListPagination(new URLSearchParams({ limit: String(COUNTRIES_LIST_PAGE_MAX + 1) })).ok,
    false,
  )
})

test('paginateCountriesByStableId: first page and next', () => {
  const rows = [{ id: 1 }, { id: 2 }, { id: 5 }]
  const p1 = paginateCountriesByStableId(rows, 2, null)
  assert.deepEqual(p1.items.map((x) => x.id), [1, 2])
  assert.equal(p1.hasMore, true)
  assert.equal(p1.nextCursor, 2)

  const p2 = paginateCountriesByStableId(rows, 2, 2)
  assert.deepEqual(p2.items.map((x) => x.id), [5])
  assert.equal(p2.hasMore, false)
  assert.equal(p2.nextCursor, null)
})

test('paginateCountriesByStableId: cursor skips duplicates id order', () => {
  const rows = [{ id: 1 }, { id: 3 }]
  const p = paginateCountriesByStableId(rows, 10, 1)
  assert.deepEqual(p.items.map((x) => x.id), [3])
})
