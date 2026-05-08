/**
 * Country Intelligence pipeline — orchestration entrypoints.
 * Connecteurs réseau : implémenter hors repo ou derrière feature flags + quotas.
 */

import prisma from '@/lib/prisma'
import { DEFAULT_INTELLIGENCE_SOURCES } from './default-sources'

export type PipelineResult = {
  runId: string
  status: 'SUCCEEDED' | 'PARTIAL' | 'FAILED'
  observationsWritten: number
  errorSummary?: string
}

/**
 * Crée un run, exécute les étapes synchrones disponibles, finalise le run.
 * Aujourd’hui : **aucune collecte réseau** — point d’accroche pour connecteurs.
 */
export async function runEnrichmentPipelineStub(args: {
  trigger?: string
}): Promise<PipelineResult> {
  const trigger = args.trigger ?? 'manual'
  const run = await prisma.enrichmentRun.create({
    data: { status: 'RUNNING', trigger },
  })

  let observationsWritten = 0
  let errorSummary: string | undefined

  try {
    // Phase suivante : await runCollectors(run.id) — World Bank, etc.
    await prisma.enrichmentRun.update({
      where: { id: run.id },
      data: {
        status: 'SUCCEEDED',
        finishedAt: new Date(),
        statsJson: JSON.stringify({
          observationsWritten,
          note: 'stub: no network collectors wired; use observations API or batch importers',
        }),
      },
    })
    return { runId: run.id, status: 'SUCCEEDED', observationsWritten }
  } catch (e) {
    errorSummary = e instanceof Error ? e.message : String(e)
    await prisma.enrichmentRun.update({
      where: { id: run.id },
      data: {
        status: 'FAILED',
        finishedAt: new Date(),
        errorSummary,
        statsJson: JSON.stringify({ observationsWritten }),
      },
    })
    return { runId: run.id, status: 'FAILED', observationsWritten, errorSummary }
  }
}

export async function seedIntelligenceSources(): Promise<number> {
  let n = 0
  for (const s of DEFAULT_INTELLIGENCE_SOURCES) {
    await prisma.intelligenceSource.upsert({
      where: { slug: s.slug },
      create: {
        slug: s.slug,
        name: s.name,
        tier: s.tier,
        baseUrl: s.baseUrl,
        licenseNote: s.licenseNote,
      },
      update: {
        name: s.name,
        tier: s.tier,
        baseUrl: s.baseUrl,
        licenseNote: s.licenseNote,
      },
    })
    n += 1
  }
  return n
}
