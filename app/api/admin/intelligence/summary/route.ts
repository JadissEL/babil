import { NextResponse } from 'next/server';

import { publicApiErrorMessage } from '@/lib/api-public-error';
import { getAdminUser } from '@/lib/admin-auth';
import {
  computeEnrichmentRunAlertLevel,
  FAILED_ENRICHMENT_LOOKBACK_MS,
  STALE_ENRICHMENT_RUN_MS,
} from '@/lib/enrichment-run-alerts';
import prisma from '@/lib/prisma';

function parseStatsJson(raw: string | null | undefined): unknown {
  if (!raw || raw.trim() === '') return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

/** Résumé admin (C.41–C.45) : volumes, alertes runs, file jobs pipeline. */
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const staleCutoff = new Date(Date.now() - STALE_ENRICHMENT_RUN_MS);
    const failedLookbackStart = new Date(Date.now() - FAILED_ENRICHMENT_LOOKBACK_MS);

    const [
      lastRun,
      staleRuns,
      recentFailedOrPartialRuns,
      sourceCount,
      observationCount,
      observationsWithoutRun,
      observationsByField,
      observationsBySourceId,
      observationsByCountryId,
      recentRuns,
      pendingPipelineJobs,
      runningPipelineJobs,
    ] = await Promise.all([
      prisma.enrichmentRun.findFirst({ orderBy: { startedAt: 'desc' } }),
      prisma.enrichmentRun.findMany({
        where: {
          finishedAt: null,
          status: { in: ['PENDING', 'RUNNING'] },
          startedAt: { lt: staleCutoff },
        },
        orderBy: { startedAt: 'asc' },
        take: 20,
        select: { id: true, startedAt: true, status: true, trigger: true, errorSummary: true },
      }),
      prisma.enrichmentRun.findMany({
        where: {
          status: { in: ['FAILED', 'PARTIAL'] },
          startedAt: { gte: failedLookbackStart },
        },
        orderBy: { startedAt: 'desc' },
        take: 15,
        select: {
          id: true,
          startedAt: true,
          finishedAt: true,
          status: true,
          trigger: true,
          errorSummary: true,
        },
      }),
      prisma.intelligenceSource.count(),
      prisma.countryObservation.count(),
      prisma.countryObservation.count({ where: { runId: null } }),
      prisma.countryObservation.groupBy({
        by: ['fieldPath'],
        _count: { fieldPath: true },
        orderBy: { _count: { fieldPath: 'desc' } },
        take: 24,
      }),
      prisma.countryObservation.groupBy({
        by: ['sourceId'],
        _count: { sourceId: true },
        orderBy: { _count: { sourceId: 'desc' } },
      }),
      prisma.countryObservation.groupBy({
        by: ['countryId'],
        _count: { countryId: true },
        orderBy: { _count: { countryId: 'desc' } },
        take: 40,
      }),
      prisma.enrichmentRun.findMany({
        orderBy: { startedAt: 'desc' },
        take: 25,
        select: {
          id: true,
          startedAt: true,
          finishedAt: true,
          status: true,
          trigger: true,
          errorSummary: true,
          statsJson: true,
          _count: { select: { observations: true } },
        },
      }),
      prisma.intelligencePipelineJob.count({ where: { status: 'PENDING' } }),
      prisma.intelligencePipelineJob.count({ where: { status: 'RUNNING' } }),
    ]);

    const fieldPathBreakdown = observationsByField.map((r) => ({
      fieldPath: r.fieldPath,
      count: r._count.fieldPath,
    }));

    const sourceIds = observationsBySourceId.map((r) => r.sourceId);
    const sources = await prisma.intelligenceSource.findMany({
      where: { id: { in: sourceIds } },
      select: { id: true, slug: true, name: true, tier: true },
    });
    const sourceMap = new Map(sources.map((s) => [s.id, s]));
    const observationsBySource = observationsBySourceId.map((r) => {
      const meta = sourceMap.get(r.sourceId);
      return {
        sourceId: r.sourceId,
        slug: meta?.slug ?? 'unknown',
        name: meta?.name ?? 'Source inconnue',
        tier: meta?.tier ?? null,
        count: r._count.sourceId,
      };
    });

    const countryIds = observationsByCountryId.map((r) => r.countryId);
    const countries = await prisma.country.findMany({
      where: { id: { in: countryIds } },
      select: { id: true, name: true, region: true },
    });
    const countryMap = new Map(countries.map((c) => [c.id, c]));
    const observationsByCountry = observationsByCountryId.map((r) => {
      const meta = countryMap.get(r.countryId);
      return {
        countryId: r.countryId,
        name: meta?.name ?? `#${r.countryId}`,
        region: meta?.region ?? null,
        count: r._count.countryId,
      };
    });

    const lastRunParsed = lastRun
      ? {
          ...lastRun,
          stats: parseStatsJson(lastRun.statsJson),
        }
      : null;

    const runsWithStats = recentRuns.map((run) => ({
      id: run.id,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      status: run.status,
      trigger: run.trigger,
      errorSummary: run.errorSummary,
      observationCount: run._count.observations,
      stats: parseStatsJson(run.statsJson),
    }));

    const runAlerts = {
      level: computeEnrichmentRunAlertLevel({
        staleRunCount: staleRuns.length,
        recentFailedOrPartialCount: recentFailedOrPartialRuns.length,
        lastRunStatus: lastRun?.status ?? null,
      }),
      staleThresholdHours: STALE_ENRICHMENT_RUN_MS / 3_600_000,
      failedLookbackDays: FAILED_ENRICHMENT_LOOKBACK_MS / 86_400_000,
      staleRuns: staleRuns.map((r) => ({
        id: r.id,
        startedAt: r.startedAt.toISOString(),
        status: r.status,
        trigger: r.trigger,
        errorSummary: r.errorSummary,
      })),
      recentFailedOrPartial: recentFailedOrPartialRuns.map((r) => ({
        id: r.id,
        startedAt: r.startedAt.toISOString(),
        finishedAt: r.finishedAt ? r.finishedAt.toISOString() : null,
        status: r.status,
        trigger: r.trigger,
        errorSummary: r.errorSummary,
      })),
    };

    return NextResponse.json({
      lastRun: lastRunParsed,
      sourceCount,
      observationCount,
      observationsWithoutRun,
      fieldPathBreakdown,
      observationsBySource,
      observationsByCountry,
      recentRuns: runsWithStats,
      runAlerts,
      pipelineJobQueue: {
        pending: pendingPipelineJobs,
        running: runningPipelineJobs,
      },
    });
  } catch (e) {
    const message = publicApiErrorMessage(e, 'Intelligence summary unavailable');
    return NextResponse.json(
      { error: 'Intelligence tables unavailable', detail: message },
      { status: 503 },
    );
  }
}
