#!/usr/bin/env node
/**
 * Validate datafile/sources.master.json and report dedupe vs manifest + optional DB upsert.
 * Usage: node scripts/ingest-datafile-sources.mjs [--write-db]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const MASTER = path.join(ROOT, 'datafile', 'sources.master.json')
const MANIFEST = path.join(ROOT, 'data', 'agent-manifest-url-map.scaffold.json')
const writeDb = process.argv.includes('--write-db')

function slugify(s) {
  return `datafile_${s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 72)}`
}

function tierToPrisma(tier) {
  if (tier === 'official') return 'TIER_A_OFFICIAL'
  if (tier === 'multilateral') return 'TIER_B_MULTILATERAL'
  return 'TIER_C_CURATED'
}

if (!fs.existsSync(MASTER)) {
  console.error(`Missing ${MASTER} — run: npm run datafile:build-master`)
  process.exit(1)
}

const master = JSON.parse(fs.readFileSync(MASTER, 'utf8'))
const manifest = fs.existsSync(MANIFEST)
  ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
  : { entries: [] }

const manifestLabels = new Set(
  (manifest.entries ?? []).map((e) => String(e.sourceLabel ?? '').toLowerCase().trim()),
)

const dupIds = new Set()
const errors = []
for (const s of master.sources) {
  if (!s.id || !s.name) errors.push(`missing id/name: ${JSON.stringify(s)}`)
  if (dupIds.has(s.id)) errors.push(`duplicate id: ${s.id}`)
  dupIds.add(s.id)
  if (s.baseUrl && !/^https?:\/\//i.test(s.baseUrl)) {
    errors.push(`invalid baseUrl for ${s.id}`)
  }
}

if (errors.length) {
  console.error('Validation errors:\n', errors.join('\n'))
  process.exit(1)
}

const inManifest = []
const onlyMaster = []
for (const s of master.sources) {
  const hit = manifestLabels.has(s.name.toLowerCase().trim())
  if (hit) inManifest.push(s.name)
  else onlyMaster.push(s.name)
}

console.log(`datafile ingest: OK (${master.sources.length} sources)`)
console.log(`  overlap manifest labels: ${inManifest.length}`)
console.log(`  master-only labels: ${onlyMaster.length}`)

const reportPath = path.join(ROOT, 'datafile', 'ingest-report.json')
fs.writeFileSync(
  reportPath,
  JSON.stringify(
    {
      at: new Date().toISOString(),
      total: master.sources.length,
      inManifestCount: inManifest.length,
      onlyMasterCount: onlyMaster.length,
      onlyMasterSample: onlyMaster.slice(0, 30),
    },
    null,
    2,
  ),
  'utf8',
)
console.log(`  report → ${reportPath}`)

if (!writeDb) {
  console.log('(dry-run) pass --write-db to upsert IntelligenceSource rows')
  process.exit(0)
}

const { PrismaClient } = await import('@prisma/client')
const prisma = new PrismaClient()
let upserted = 0
try {
  for (const s of master.sources) {
    const slug = slugify(s.id)
    await prisma.intelligenceSource.upsert({
      where: { slug },
      create: {
        slug,
        name: s.name,
        tier: tierToPrisma(s.tier),
        baseUrl: s.baseUrl ?? null,
        licenseNote: s.notes ?? 'datafile master list',
        trustScore: s.trustScore ?? 50,
        authorityScore: s.authorityScore ?? 50,
        reliabilityLevel: s.reliabilityLevel ?? 'medium',
        updateFrequencyHint: s.updateFrequencyHint ?? null,
        countryCoverage: s.countryScope ?? null,
        informationTypesJson: JSON.stringify(s.topics ?? []),
        requiresDiscoveryGate: s.requiresDiscoveryGate !== false,
        discoveryStatus: 'pending',
        datafileSourceId: s.id,
      },
      update: {
        name: s.name,
        baseUrl: s.baseUrl ?? undefined,
        trustScore: s.trustScore ?? undefined,
        authorityScore: s.authorityScore ?? undefined,
        reliabilityLevel: s.reliabilityLevel ?? undefined,
        updateFrequencyHint: s.updateFrequencyHint ?? undefined,
        countryCoverage: s.countryScope ?? undefined,
        informationTypesJson: JSON.stringify(s.topics ?? []),
        datafileSourceId: s.id,
      },
    })
    upserted++
  }
  console.log(`DB upserted ${upserted} IntelligenceSource rows`)
} finally {
  await prisma.$disconnect()
}
