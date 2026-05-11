import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  AGENT_COMBINED_STRUCTURED_SOURCE_ROW_TOTAL,
  AGENT_MOROCCO_SOURCE_CATEGORIES,
  AGENT_MOROCCO_STRUCTURED_SOURCE_ROW_TOTAL,
  AGENT_RESEARCH_SOURCE_CATEGORIES,
  AGENT_RESEARCH_SOURCES_VERSION,
  AGENT_STRUCTURED_SOURCE_ROW_TOTAL,
  buildAgentResearchSourcesPayload,
} from '@/lib/agent-research-sources'

function sumSources(
  cats: readonly { sources: readonly string[] }[],
): number {
  let n = 0
  for (const c of cats) n += c.sources.length
  return n
}

describe('buildAgentResearchSourcesPayload', () => {
  it('uses v2 manifest version', () => {
    const p = buildAgentResearchSourcesPayload()
    assert.equal(p.version, 'agent-research-sources-v2')
    assert.equal(p.version, AGENT_RESEARCH_SOURCES_VERSION)
  })

  it('aggregates structured row totals (global + Morocco corridor)', () => {
    const p = buildAgentResearchSourcesPayload()
    assert.equal(p.globalStructuredSourceRowTotal, AGENT_STRUCTURED_SOURCE_ROW_TOTAL)
    assert.equal(p.moroccoStructuredSourceRowTotal, AGENT_MOROCCO_STRUCTURED_SOURCE_ROW_TOTAL)
    assert.equal(p.structuredSourceRowTotal, AGENT_COMBINED_STRUCTURED_SOURCE_ROW_TOTAL)
    assert.equal(p.structuredSourceRowTotal, p.globalStructuredSourceRowTotal + p.moroccoStructuredSourceRowTotal)
  })

  it('concatenates Morocco categories into categories and mirrors moroccoCorridorCategories', () => {
    const p = buildAgentResearchSourcesPayload()
    assert.equal(p.categories.length, AGENT_RESEARCH_SOURCE_CATEGORIES.length + AGENT_MOROCCO_SOURCE_CATEGORIES.length)
    assert.equal(p.moroccoCorridorCategories.length, AGENT_MOROCCO_SOURCE_CATEGORIES.length)
    const moroccoIds = new Set(p.moroccoCorridorCategories.map((c) => c.id))
    assert.ok(moroccoIds.has('ma_official'))
    assert.ok(moroccoIds.has('ma_migration_supplemental_81_150'))
    const combined = sumSources(p.categories)
    assert.equal(combined, p.structuredSourceRowTotal)
  })

  it('includes Morocco-specific rules and corridor hint strings', () => {
    const p = buildAgentResearchSourcesPayload()
    assert.ok(p.rulesMoroccoMust.length >= 3)
    assert.ok(p.moroccoCorridorHint.includes('officiel'))
    assert.ok(p.primaryHint.toLowerCase().includes('official'))
  })

  it('lists every tier used in categories within hierarchy (no orphan tiers)', () => {
    const p = buildAgentResearchSourcesPayload()
    const order = new Set(p.hierarchy)
    for (const c of p.categories) {
      assert.ok(
        order.has(c.tier),
        `tier "${c.tier}" (category ${c.id}) missing from payload.hierarchy`,
      )
    }
  })
})
