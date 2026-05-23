/**
 * Country Intelligence pipeline — orchestration entrypoints.
 */

import { logPipelineExternalBudgetWarnings } from '@/lib/pipeline-external-budget';
import prisma from '@/lib/prisma';
import { allIntelligenceSourceSeeds } from '@/lib/intelligence-manifest-source-bridge';
import { materializeEconomyObservationsForAllCountries } from './materialize-economy-observations';
import { runStubMultilateralCollectors } from './stub-multilateral-collectors';
import { runWorldBankCollector } from './world-bank-collector';
import type { StubCollectorResult } from './stub-multilateral-collectors';
import type { WorldBankCollectorResult } from './world-bank-collector';

export type PipelineResult = {
  runId: string;
  status: 'SUCCEEDED' | 'PARTIAL' | 'FAILED';
  observationsWritten: number;
  materializedCountries?: number;
  worldBank?: WorldBankCollectorResult;
  /** C.44 — stubs UN / OECD / IMF (aucune observation tant que les APIs ne sont pas branchées). */
  stubCollectors?: StubCollectorResult[];
  errorSummary?: string;
};

export async function runEnrichmentPipeline(args: {
  trigger?: string;
  worldBank?: boolean;
  materializeEconomy?: boolean;
  worldBankLimit?: number;
  /** C.44 — exécute les enregistrements placeholder pour un_data, oecd, imf_data. */
  stubMultilateralCollectors?: boolean;
}): Promise<PipelineResult> {
  const trigger = args.trigger ?? 'manual';
  const run = await prisma.enrichmentRun.create({
    data: { status: 'RUNNING', trigger },
  });

  let observationsWritten = 0;
  let errorSummary: string | undefined;
  let worldBank: WorldBankCollectorResult | undefined;
  let materializedCountries: number | undefined;
  let stubCollectors: StubCollectorResult[] | undefined;

  try {
    if (args.worldBank) {
      worldBank = await runWorldBankCollector(run.id, { limit: args.worldBankLimit });
      observationsWritten += worldBank.observationsWritten;
    }

    if (args.stubMultilateralCollectors) {
      stubCollectors = await runStubMultilateralCollectors(run.id);
    }

    if (args.materializeEconomy) {
      const m = await materializeEconomyObservationsForAllCountries();
      materializedCountries = m.updated;
    }

    const partial = worldBank != null && !worldBank.skippedByConfig && worldBank.errors > 0;

    await prisma.enrichmentRun.update({
      where: { id: run.id },
      data: {
        status: partial ? 'PARTIAL' : 'SUCCEEDED',
        finishedAt: new Date(),
        statsJson: JSON.stringify({
          observationsWritten,
          materializedCountries,
          worldBank,
          stubCollectors,
          worldBankOnly: args.worldBank && !args.materializeEconomy,
        }),
      },
    });

    const result: PipelineResult = {
      runId: run.id,
      status: partial ? 'PARTIAL' : 'SUCCEEDED',
      observationsWritten,
      materializedCountries,
      worldBank,
      stubCollectors,
    };
    logPipelineExternalBudgetWarnings({
      runId: result.runId,
      status: result.status,
      worldBank: result.worldBank,
    });
    return result;
  } catch (e) {
    errorSummary = e instanceof Error ? e.message : String(e);
    await prisma.enrichmentRun.update({
      where: { id: run.id },
      data: {
        status: 'FAILED',
        finishedAt: new Date(),
        errorSummary,
        statsJson: JSON.stringify({
          observationsWritten,
          materializedCountries,
          worldBank,
          stubCollectors,
        }),
      },
    });
    const result: PipelineResult = {
      runId: run.id,
      status: 'FAILED',
      observationsWritten,
      materializedCountries,
      worldBank,
      stubCollectors,
      errorSummary,
    };
    logPipelineExternalBudgetWarnings({
      runId: result.runId,
      status: result.status,
      worldBank: result.worldBank,
    });
    return result;
  }
}

/** @deprecated Utiliser `runEnrichmentPipeline({})` — conservé pour compat scripts. */
export async function runEnrichmentPipelineStub(args: {
  trigger?: string;
}): Promise<PipelineResult> {
  return runEnrichmentPipeline({ trigger: args.trigger });
}

export async function seedIntelligenceSources(): Promise<number> {
  let n = 0;
  for (const s of allIntelligenceSourceSeeds()) {
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
    });
    n += 1;
  }
  return n;
}
