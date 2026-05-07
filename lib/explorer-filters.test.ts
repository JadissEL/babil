import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  explorerCountryIsSchengenMember,
  matchesExplorerRegionFilter,
  matchesExplorerSchengenOnlyToggle,
  parseExplorerRegionFilter,
} from '@/lib/explorer-filters'

describe('parseExplorerRegionFilter', () => {
  it('maps URL and bar values to internal region', () => {
    assert.equal(parseExplorerRegionFilter(''), 'all')
    assert.equal(parseExplorerRegionFilter('all'), 'all')
    assert.equal(parseExplorerRegionFilter('schengen'), 'Schengen')
    assert.equal(parseExplorerRegionFilter('europe'), 'Europe')
    assert.equal(parseExplorerRegionFilter('oceania'), 'Oceania')
  })
})

describe('matchesExplorerRegionFilter', () => {
  it('Schengen uses canonical membership only, not dataset region', () => {
    assert.equal(
      matchesExplorerRegionFilter('Schengen', { name: 'France', region: 'Europe' }),
      true,
    )
    assert.equal(
      matchesExplorerRegionFilter('Schengen', { name: 'Maroc', region: 'Schengen' }),
      false,
    )
    assert.equal(
      matchesExplorerRegionFilter('Schengen', { name: 'Espagne', region: 'Schengen' }),
      true,
    )
  })

  it('Europe includes Schengen-tagged rows when the country is a member', () => {
    assert.equal(
      matchesExplorerRegionFilter('Europe', { name: 'Espagne', region: 'Schengen' }),
      true,
    )
    assert.equal(
      matchesExplorerRegionFilter('Europe', { name: 'Maroc', region: 'Schengen' }),
      false,
    )
    assert.equal(
      matchesExplorerRegionFilter('Europe', { name: 'Irlande', region: 'Europe' }),
      true,
    )
  })

  it('is case-insensitive on dataset region labels', () => {
    assert.equal(
      matchesExplorerRegionFilter('Asia', { name: 'Japan', region: 'asia' }),
      true,
    )
  })
})

describe('matchesExplorerSchengenOnlyToggle', () => {
  it('matches explorerCountryIsSchengenMember when active', () => {
    assert.equal(matchesExplorerSchengenOnlyToggle(false, { name: 'Maroc' }), true)
    assert.equal(matchesExplorerSchengenOnlyToggle(true, { name: 'Maroc' }), false)
    assert.equal(matchesExplorerSchengenOnlyToggle(true, { name: 'Roumanie' }), true)
  })
})

describe('explorerCountryIsSchengenMember', () => {
  it('includes Bulgaria and Romania (full Schengen from 2025)', () => {
    assert.equal(explorerCountryIsSchengenMember('Bulgaria'), true)
    assert.equal(explorerCountryIsSchengenMember('Romania'), true)
    assert.equal(explorerCountryIsSchengenMember('Bulgarie'), true)
    assert.equal(explorerCountryIsSchengenMember('Roumanie'), true)
  })
})
