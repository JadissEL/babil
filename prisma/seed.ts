import { ConsultantGender, PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

import { syncCountryEducationProgramsFromFullData } from '../lib/country-education-programs-sync'
import { buildCountryPrismaPayloadFromStaticRecord } from '../lib/country-upsert-from-static'

const prisma = new PrismaClient()

async function seedConsultantMarketplace() {
  await prisma.consultantBooking.deleteMany()
  await prisma.consultantSlot.deleteMany()
  await prisma.consultantExpert.deleteMany()

  const expertsData = [
    {
      slug: 'amina-bennis',
      displayName: 'Amina Bennis',
      title: 'Conseillère mobilité étudiante',
      bio: 'Ancienne référente admissions : visas étudiants Schengen, UK et Canada, stratégie Parcoursup / équivalences.',
      gender: ConsultantGender.FEMALE,
      specialties: ['études', 'visa étudiant', 'Campus France', 'lettre de motivation'],
      price30MinCents: 3900,
      price60MinCents: 6900,
      averageRating: 4.9,
      reviewCount: 47,
      notifyEmail: 'amina.demo@example.com',
    },
    {
      slug: 'youssef-hani',
      displayName: 'Youssef El Hani',
      title: 'Coach visa travail & installation',
      bio: 'RH international et dossiers titre de séjour salarié : France, Belgique, pays du Golfe — préparation entretien consulaire.',
      gender: ConsultantGender.MALE,
      specialties: ['travail', 'visa travail', 'installation', 'entretien TLS'],
      price30MinCents: 4500,
      price60MinCents: 7900,
      averageRating: 4.7,
      reviewCount: 31,
      notifyEmail: 'youssef.demo@example.com',
    },
    {
      slug: 'sara-mehenni',
      displayName: 'Sara Mehenni',
      title: 'Experte business & franchise',
      bio: 'Structuration projet à l’étranger, visa affaires, création société et mise en relation réseaux locaux.',
      gender: ConsultantGender.FEMALE,
      specialties: ['business', 'visa affaires', 'entrepreneuriat', 'Schengen business'],
      price30MinCents: 4900,
      price60MinCents: 8900,
      averageRating: 5.0,
      reviewCount: 22,
      notifyEmail: 'sara.demo@example.com',
    },
  ]

  const now = new Date()
  for (const row of expertsData) {
    const expert = await prisma.consultantExpert.create({ data: row })
    const slotRows: { expertId: string; startUtc: Date; endUtc: Date }[] = []
    const base = new Date(now)
    base.setUTCHours(0, 0, 0, 0)
    for (let d = 1; d <= 21; d++) {
      const day = new Date(base)
      day.setUTCDate(day.getUTCDate() + d)
      const wd = day.getUTCDay()
      if (wd === 0 || wd === 6) continue
      for (const hour of [9, 11, 14, 16]) {
        const start = new Date(
          Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hour, 0),
        )
        if (start.getTime() <= now.getTime()) continue
        const end = new Date(start.getTime() + 60 * 60 * 1000)
        slotRows.push({ expertId: expert.id, startUtc: start, endUtc: end })
      }
    }
    if (slotRows.length) {
      await prisma.consultantSlot.createMany({ data: slotRows })
    }
  }

  console.log(`Seeded ${expertsData.length} consultant experts + slots.`)
}

async function main() {
  const dataPath = path.join(process.cwd(), 'data/countries.json')
  const rawData = fs.readFileSync(dataPath, 'utf8')
  const { countries } = JSON.parse(rawData)

  console.log(`Starting seeding for ${countries.length} countries...`)

  for (const c of countries) {
    const countryData = buildCountryPrismaPayloadFromStaticRecord(c as Record<string, unknown>)
    const row = await prisma.country.upsert({
      where: { name: countryData.name },
      update: countryData,
      create: countryData,
    })
    try {
      const parsed = countryData.full_data ? JSON.parse(countryData.full_data) : null
      await syncCountryEducationProgramsFromFullData(prisma, row.id, parsed, {
        sourceVersion: 'seed',
      })
    } catch (err) {
      console.warn(
        `[seed] education programs sync skipped for ${countryData.name}:`,
        err instanceof Error ? err.message : err,
      )
    }
  }

  await seedConsultantMarketplace()

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
