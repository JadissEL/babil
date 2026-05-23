/**
 * Maps specialized IntelligencePipelineJob kinds to concrete collectors (tier-scoped manifest fetch, WB).
 */

import { INTELLIGENCE_JOB_KINDS, type IntelligenceJobPayload } from './job-kinds';
import { runManifestFetchJobForCountry } from './manifest-fetch-runner';
import { runWorldBankCollector } from './world-bank-collector';
import {
  materializeApprovedObservations,
  runIntelligenceValidation,
} from '@/lib/intelligence-validation';
import { validateAndMaybeMaterializeCountry } from './post-fetch-pipeline';
import { checkPromotionLaunchGateSample } from '@/lib/intelligence-validation/promotion-safety';
import prisma from '@/lib/prisma';

/** Category ids from agent-research-sources — scoped fetches per job kind. */
export const SPECIALIZED_JOB_CATEGORY_IDS: Record<string, readonly string[]> = {
  [INTELLIGENCE_JOB_KINDS.visa_friction]: [
    'visa_immigration',
    'ma_visa_corridor_services',
    'official_global',
    'ma_embassies_in_morocco',
  ],
  [INTELLIGENCE_JOB_KINDS.education]: ['study_universities', 'ma_education_corridor'],
  [INTELLIGENCE_JOB_KINDS.travel_signals]: ['flights_transport', 'ma_air_transport'],
  [INTELLIGENCE_JOB_KINDS.news_trends]: [
    'finance_economics_news',
    'statistics_data',
    'health_quality_of_life',
  ],
};

export function categoryIdsForSpecializedKind(kind: string): readonly string[] | undefined {
  return SPECIALIZED_JOB_CATEGORY_IDS[kind];
}

export async function runWorldBankMaterializeJob(
  payload: IntelligenceJobPayload,
  runId: string,
): Promise<{ status: 'SUCCEEDED' | 'FAILED'; result: unknown; errorSummary?: string }> {
  try {
    const wb = await runWorldBankCollector(runId, { limit: payload.worldBankLimit });
    let validation = null;
    let materialize = null;
    let promotionSafety = null;

    if (payload.materializeEconomy !== false) {
      validation = await runIntelligenceValidation({
        countryIds: payload.countryIds,
        limit: payload.worldBankLimit,
      });
      const mat = await materializeApprovedObservations({
        countryIds: payload.countryIds,
        limit: payload.worldBankLimit,
      });
      materialize = mat;
      promotionSafety = await checkPromotionLaunchGateSample({ sampleSize: 12 });
      if (!promotionSafety.pass) {
        return {
          status: 'FAILED',
          result: { wb, validation, materialize, promotionSafety },
          errorSummary: `launch_gate_sample_failed:${promotionSafety.failed.length}`,
        };
      }
    }

    return { status: 'SUCCEEDED', result: { wb, validation, materialize, promotionSafety } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { status: 'FAILED', result: null, errorSummary: msg };
  }
}

export async function runSpecializedManifestJob(
  kind: string,
  payload: IntelligenceJobPayload,
): Promise<{ status: 'SUCCEEDED' | 'FAILED'; result: unknown; errorSummary?: string }> {
  const countryId = payload.countryId;
  if (countryId == null) {
    return {
      status: 'FAILED',
      result: null,
      errorSummary: `${kind} requires payload.countryId`,
    };
  }

  const categoryIds = categoryIdsForSpecializedKind(kind);
  const run = await prisma.enrichmentRun.create({
    data: { status: 'RUNNING', trigger: payload.trigger ?? `job:${kind}` },
  });

  try {
    const mf = await runManifestFetchJobForCountry({
      countryId,
      manifestBatchSize: payload.manifestBatchSize ?? 16,
      runId: run.id,
      categoryIds: categoryIds ? [...categoryIds] : undefined,
    });
    const { validated, materialized } = await validateAndMaybeMaterializeCountry(countryId);

    await prisma.enrichmentRun.update({
      where: { id: run.id },
      data: {
        status: 'SUCCEEDED',
        finishedAt: new Date(),
        statsJson: JSON.stringify({ kind, categoryIds, ...mf, validated, materialized }),
      },
    });
    return { status: 'SUCCEEDED', result: { kind, categoryIds, ...mf, validated, materialized } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await prisma.enrichmentRun.update({
      where: { id: run.id },
      data: { status: 'FAILED', finishedAt: new Date(), errorSummary: msg },
    });
    return { status: 'FAILED', result: null, errorSummary: msg };
  }
}
