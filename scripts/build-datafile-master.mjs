#!/usr/bin/env node
/**
 * Build datafile/sources.master.json from agent research categories (~300 labels).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'datafile', 'sources.master.json')

// Use tsx to load TypeScript source categories
const { execSync } = await import('node:child_process')
const tmpOut = path.join(ROOT, '.tmp-datafile-categories.json')
execSync(
  `npx tsx -e "import { AGENT_RESEARCH_SOURCE_CATEGORIES } from './lib/agent-research-sources.ts'; import fs from 'fs'; fs.writeFileSync('${tmpOut.replace(/\\/g, '/')}', JSON.stringify(AGENT_RESEARCH_SOURCE_CATEGORIES));"`,
  { cwd: ROOT, stdio: 'inherit' },
)
const AGENT_RESEARCH_SOURCE_CATEGORIES = JSON.parse(fs.readFileSync(tmpOut, 'utf8'))
try {
  fs.unlinkSync(tmpOut)
} catch {
  /* ignore */
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 72)
}

function tierMap(tier) {
  if (tier === 'official_critical' || tier.startsWith('morocco_official') || tier === 'visa') {
    return 'official'
  }
  if (tier === 'statistics' || tier.includes('education') || tier.includes('employment')) {
    return 'multilateral'
  }
  return 'curated'
}

function defaultScores(tier) {
  if (tier === 'official') return { trustScore: 92, authorityScore: 95, reliabilityLevel: 'high' }
  if (tier === 'multilateral') return { trustScore: 78, authorityScore: 82, reliabilityLevel: 'medium' }
  return { trustScore: 55, authorityScore: 50, reliabilityLevel: 'low' }
}

const sources = []
const seen = new Set()

for (const cat of AGENT_RESEARCH_SOURCE_CATEGORIES) {
  const tier = tierMap(cat.tier)
  const scores = defaultScores(tier)
  for (const name of cat.sources) {
    const id = slugify(name)
    if (seen.has(id)) continue
    seen.add(id)
    sources.push({
      id,
      name,
      baseUrl: null,
      tier,
      topics: [cat.id],
      countryScope: cat.tier.startsWith('morocco') ? 'morocco_corridor' : 'global',
      language: cat.tier.startsWith('morocco') ? 'fr' : 'en',
      ...scores,
      updateFrequencyHint: tier === 'official' ? 'monthly' : 'variable',
      requiresDiscoveryGate: true,
      categoryId: cat.id,
      notes: `From agent category ${cat.id}`,
    })
  }
}

const payload = {
  version: 1,
  generatedAt: new Date().toISOString(),
  sources,
}

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8')
console.log(`Wrote ${sources.length} sources → ${OUT}`)
