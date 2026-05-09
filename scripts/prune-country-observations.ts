/**
 * Purge anciennes lignes CountryObservation (par date observedAt).
 *
 * @example
 * npx tsx scripts/prune-country-observations.ts --dry-run --older-than-days=730
 * npx tsx scripts/prune-country-observations.ts --older-than-days=730
 */
import prisma from '../lib/prisma'

function parseArgs(argv: string[]) {
  const dryRun = argv.includes('--dry-run')
  let olderThanDays = 730
  const d = argv.find((a) => a.startsWith('--older-than-days='))
  if (d) {
    const n = Number.parseInt(d.split('=')[1] ?? '', 10)
    if (Number.isFinite(n) && n > 0) olderThanDays = n
  }
  return { dryRun, olderThanDays }
}

async function main() {
  const { dryRun, olderThanDays } = parseArgs(process.argv.slice(2))
  const cutoff = new Date(Date.now() - olderThanDays * 86_400_000)

  const count = await prisma.countryObservation.count({
    where: { observedAt: { lt: cutoff } },
  })

  console.log(
    `[prune-country-observations] cutoff=${cutoff.toISOString()} older_than_days=${olderThanDays} matching_rows=${count} dry_run=${dryRun}`,
  )

  if (count === 0) {
    await prisma.$disconnect()
    return
  }

  if (dryRun) {
    console.log('[prune-country-observations] dry-run: no rows deleted.')
    await prisma.$disconnect()
    return
  }

  const result = await prisma.countryObservation.deleteMany({
    where: { observedAt: { lt: cutoff } },
  })

  console.log(`[prune-country-observations] deleted_count=${result.count}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
