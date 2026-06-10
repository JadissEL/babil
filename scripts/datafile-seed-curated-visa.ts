#!/usr/bin/env tsx
/**
 * Seed curated visa baseline observations (EU Visa Code + official guidance).
 * Applied to Schengen countries + named corridor destinations.
 *
 * npm run datafile:seed-curated-visa
 */
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'

import { upsertCountryObservation } from '@/lib/intelligence-pipeline/observation-writer'
import { assertProdWritesAllowed } from '@/lib/prod-write-guard'
import prisma from '@/lib/prisma'

type BaselineBlock = {
  sourceLabel: string
  sourceUrl: string
  fields: Record<string, string>
}

type BaselineFile = {
  schengenBaseline: BaselineBlock
  countries: Record<string, BaselineBlock>
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 72)
}

async function sourceIdForLabel(label: string): Promise<string> {
  const slug = `curated_${slugify(label)}`
  const row = await prisma.intelligenceSource.upsert({
    where: { slug },
    update: {},
    create: {
      slug,
      name: label,
      tier: 'TIER_A_OFFICIAL',
      licenseNote: 'curated visa baseline (official regulation/guidance)',
    },
    select: { id: true },
  })
  return row.id
}

async function writeBlock(
  countryId: number,
  block: BaselineBlock,
  runId: string,
): Promise<number> {
  const sourceId = await sourceIdForLabel(block.sourceLabel)
  let written = 0
  for (const [fieldPath, value] of Object.entries(block.fields)) {
    await upsertCountryObservation({
      countryId,
      sourceId,
      runId,
      fieldPath,
      valueJson: JSON.stringify({ value, source: 'curated_visa_baseline' }),
      confidence: 0.72,
      verificationStatus: 'estimated',
      sourceUrl: block.sourceUrl,
      rawExcerpt: value,
      dedupeKey: `curated-visa:${countryId}:${fieldPath}`,
    })
    written += 1
  }
  return written
}

async function main() {
  assertProdWritesAllowed('datafile:seed-curated-visa')

  const file = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'datafile', 'curated-visa-baselines.json'), 'utf8'),
  ) as BaselineFile

  const run = await prisma.enrichmentRun.create({
    data: { status: 'RUNNING', trigger: 'datafile:seed-curated-visa' },
  })

  let written = 0
  const schengen = await prisma.country.findMany({
    where: { schengen_flag: true },
    select: { id: true, name: true },
  })
  for (const c of schengen) {
    written += await writeBlock(c.id, file.schengenBaseline, run.id)
  }

  for (const [name, block] of Object.entries(file.countries)) {
    const c = await prisma.country.findFirst({ where: { name }, select: { id: true } })
    if (!c) {
      console.warn(`[curated-visa] country not found: ${name}`)
      continue
    }
    written += await writeBlock(c.id, block, run.id)
  }

  await prisma.enrichmentRun.update({
    where: { id: run.id },
    data: { status: 'SUCCESS', finishedAt: new Date() },
  })

  console.log(
    JSON.stringify({ schengenCountries: schengen.length, observationsWritten: written }),
  )
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
