#!/usr/bin/env tsx
/**
 * Backfill FieldDefinition seeds from country intelligence contract (taxonomy v2).
 */
import { seedFieldDefinitionsFromContract } from '@/lib/intelligence-pipeline/taxonomy-v2'

async function main() {
  const n = await seedFieldDefinitionsFromContract()
  console.log(`Seeded/updated ${n} FieldDefinition rows`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
