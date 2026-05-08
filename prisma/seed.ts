import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

import { buildCountryPrismaPayloadFromStaticRecord } from '../lib/country-upsert-from-static'

const prisma = new PrismaClient()

async function main() {
  const dataPath = path.join(process.cwd(), 'data/countries.json')
  const rawData = fs.readFileSync(dataPath, 'utf8')
  const { countries } = JSON.parse(rawData)

  console.log(`Starting seeding for ${countries.length} countries...`)

  for (const c of countries) {
    const countryData = buildCountryPrismaPayloadFromStaticRecord(c as Record<string, unknown>)
    await prisma.country.upsert({
      where: { name: countryData.name },
      update: countryData,
      create: countryData,
    })
  }

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
