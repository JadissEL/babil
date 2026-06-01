#!/usr/bin/env node
/**
 * Quick status: scrape run, observations by field/status, countries with visa_processing_time.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

const prisma = new PrismaClient();
const runId = process.argv[2] || 'run_2026-05-30T13-18-10-318Z_c9a3e772';
const runDir = path.join('datafile', 'scrape-runs', runId, 'sources');

async function main() {
  const scrape = { sources: 0, complete: 0, failed: 0, partial: 0, pages: 0 };
  if (fs.existsSync(runDir)) {
    for (const f of fs.readdirSync(runDir).filter((x) => x.endsWith('.json'))) {
      const r = JSON.parse(fs.readFileSync(path.join(runDir, f), 'utf8'));
      scrape.sources++;
      scrape[r.status] = (scrape[r.status] || 0) + 1;
      scrape.pages += r.pagesScraped || 0;
    }
  }

  const byStatus = await prisma.countryObservation.groupBy({
    by: ['verificationStatus'],
    _count: { _all: true },
  });

  const visaFields = await prisma.countryObservation.groupBy({
    by: ['fieldPath'],
    where: {
      fieldPath: {
        in: [
          'visa_processing_time',
          'appointment_difficulty',
          'full_data.appointment_audit.avg_wait_time',
          'full_data.friction_analysis.real_delay',
          'full_data.visa_system.tourism.fees',
        ],
      },
    },
    _count: { _all: true },
  });

  const countriesWithVisa = await prisma.countryObservation.groupBy({
    by: ['countryId'],
    where: { fieldPath: 'visa_processing_time' },
    _count: { _all: true },
  });

  const withFullVisa = await prisma.country.count({
    where: { visa_processing_time: { not: null } },
  });

  console.log(
    JSON.stringify(
      {
        scrape,
        observationsByStatus: Object.fromEntries(byStatus.map((r) => [r.verificationStatus, r._count._all])),
        visaFieldObservations: Object.fromEntries(visaFields.map((r) => [r.fieldPath, r._count._all])),
        countriesWithVisaObservation: countriesWithVisa.length,
        countriesWithMaterializedVisaTime: withFullVisa,
      },
      null,
      2,
    ),
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
