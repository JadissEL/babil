import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

type Args = {
  apply: boolean
  skipInsights: boolean
}

function parseArgs(argv: string[]): Args {
  return {
    apply: argv.includes('--apply'),
    skipInsights: argv.includes('--skip-insights'),
  }
}

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const localUrl =
    (process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL || '').trim() ||
    (() => {
      throw new Error('Missing LOCAL_DATABASE_URL (or DATABASE_URL for the local/runner DB)')
    })()
  const renderUrl = getRequiredEnv('RENDER_DATABASE_URL')

  const local = new PrismaClient({ datasources: { db: { url: localUrl } } })
  const render = new PrismaClient({ datasources: { db: { url: renderUrl } } })

  try {
    const localCountries = await local.country.findMany({
      include: { insights: true },
      orderBy: { name: 'asc' },
    })

    let upsertedCountries = 0
    let recreatedInsights = 0

    for (const country of localCountries) {
      const payload = {
        name: country.name,
        region: country.region,
        schengen_flag: country.schengen_flag,
        tourist_visa_score: country.tourist_visa_score,
        study_visa_score: country.study_visa_score,
        work_visa_score: country.work_visa_score,
        business_visa_score: country.business_visa_score,
        appointment_difficulty: country.appointment_difficulty,
        visa_processing_time: country.visa_processing_time,
        rejection_risk: country.rejection_risk,
        language_study_access: country.language_study_access,
        technical_training_access: country.technical_training_access,
        short_course_access: country.short_course_access,
        street_food_business_access: country.street_food_business_access,
        driving_license_status: country.driving_license_status,
        full_data: country.full_data,
      }

      if (!args.apply) {
        continue
      }

      const renderCountry = await render.country.upsert({
        where: { name: country.name },
        update: payload,
        create: payload,
      })
      upsertedCountries += 1

      if (!args.skipInsights) {
        await render.countryInsight.deleteMany({ where: { countryId: renderCountry.id } })
        if (country.insights.length > 0) {
          await render.countryInsight.createMany({
            data: country.insights.map((insight) => ({
              countryId: renderCountry.id,
              osint_insights: insight.osint_insights,
              real_world_friction: insight.real_world_friction,
              community_sentiment: insight.community_sentiment,
            })),
          })
          recreatedInsights += country.insights.length
        }
      }
    }

    if (!args.apply) {
      const localInsightCount = localCountries.reduce((sum, c) => sum + c.insights.length, 0)
      console.log(
        JSON.stringify(
          {
            mode: 'dry-run',
            localCountries: localCountries.length,
            localInsights: localInsightCount,
            nextStep: 'Run with --apply to sync local data into Render database',
          },
          null,
          2,
        ),
      )
      return
    }

    console.log(
      JSON.stringify(
        {
          mode: 'apply',
          upsertedCountries,
          recreatedInsights: args.skipInsights ? 0 : recreatedInsights,
          skipInsights: args.skipInsights,
          status: 'ok',
        },
        null,
        2,
      ),
    )
  } finally {
    await local.$disconnect()
    await render.$disconnect()
  }
}

main().catch((error) => {
  console.error('[sync-countries-to-render] failed', error)
  process.exit(1)
})
