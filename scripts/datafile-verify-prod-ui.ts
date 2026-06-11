#!/usr/bin/env tsx
/**
 * Prod UI check: corridor + Schengen pages show visa delay/fee hints.
 * npm run datafile:verify-prod-ui -- https://babil-amber.vercel.app
 */
import 'dotenv/config'

import { chromium } from 'playwright'

import prisma from '@/lib/prisma'

const base = (process.argv[2] ?? 'https://babil-amber.vercel.app').replace(/\/$/, '')
const TARGET_NAMES = ['France', 'Spain', 'Canada', 'Germany', 'Morocco'] as const

async function main() {
  const rows = await prisma.country.findMany({
    where: { name: { in: [...TARGET_NAMES] } },
    select: { id: true, name: true },
  })

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const results: Record<string, unknown>[] = []

  for (const { name, id } of rows) {
    await page.goto(`${base}/countries/${id}`, { waitUntil: 'domcontentloaded', timeout: 120_000 })
    await page.waitForTimeout(2500)
    const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ')
    const hasVisaDelay =
      /jours|semaines|days|weeks|délai|delai|processing|traitement|mois/i.test(body) &&
      !/Exigences et délais variables selon nationalité/i.test(body.slice(0, 800))
    const hasFees = /EUR|USD|GBP|CAD|MAD|€|\$|frais|fee|coût|cost/i.test(body)
    const hasAppointment = /rendez-vous|appointment|rdv|attente|wait|TLS|VFS/i.test(body)
    results.push({
      country: name,
      url: `${base}/countries/${id}`,
      hasVisaDelayHint: hasVisaDelay,
      hasFeesHint: hasFees,
      hasAppointmentHint: hasAppointment,
    })
  }

  await browser.close()
  await prisma.$disconnect()

  const withDelayAndFees = results.filter(
    (r) => r.hasVisaDelayHint && r.hasFeesHint,
  ).length
  console.log(JSON.stringify({ checked: results.length, withDelayAndFees, results }, null, 2))
  if (withDelayAndFees < Math.min(3, results.length)) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
