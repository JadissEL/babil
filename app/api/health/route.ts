import { NextResponse } from 'next/server';
import { isDbUnavailable } from '@/lib/db-resilience';
import { BABIL_ENGINE_VERSION } from '@/lib/engine-version';
import { circuitBreakerSnapshot } from '@/lib/intelligence-pipeline/fetch-circuit-breaker';
import {
  collectIntelligenceFreshnessSli,
  evaluateFreshnessAlertLevel,
} from '@/lib/intelligence-pipeline/freshness-sli';
import {
  collectIntelligenceQueueMetrics,
  evaluateQueueAlertLevel,
} from '@/lib/intelligence-pipeline/queue-metrics';
import {
  collectIntelligenceSaturationSli,
  evaluateSaturationAlertLevel,
} from '@/lib/intelligence-pipeline/saturation-sli';
import prisma from '@/lib/prisma';

/**
 * Lightweight **public** liveness/readiness probe (G.96).
 * No auth — intended for load balancers and uptime checks. Avoid PII in responses.
 *
 * Deep agent / DB metrics: `GET /api/admin/agents/health` (admin only) — see docs/healthcheck-g96.md
 */
export async function GET(req: Request) {
  const includeIntelligence = new URL(req.url).searchParams.get('intelligence') === '1';

  try {
    await prisma.$queryRaw`SELECT 1`;

    let intelligence:
      | {
          alertLevel: string;
          pending: number;
          running: number;
          runningStale: number;
          deadLetterLast24h: number;
          jobsCreatedLast24h: number;
          materializedFreshRatio?: number;
          jobBudgetUtilization?: number;
          circuitBreaker?: { openHosts: string[] };
        }
      | undefined;

    if (includeIntelligence) {
      const [metrics, freshness, saturation] = await Promise.all([
        collectIntelligenceQueueMetrics(),
        collectIntelligenceFreshnessSli({ countryLimit: 80 }),
        collectIntelligenceSaturationSli(),
      ]);
      const queueAlert = evaluateQueueAlertLevel(metrics);
      const freshnessAlert = evaluateFreshnessAlertLevel(freshness);
      const saturationAlert = evaluateSaturationAlertLevel(saturation);
      const alertLevel =
        queueAlert === 'critical' || freshnessAlert === 'critical' || saturationAlert === 'critical'
          ? 'critical'
          : queueAlert === 'warning' ||
              freshnessAlert === 'warning' ||
              saturationAlert === 'warning'
            ? 'warning'
            : 'ok';
      intelligence = {
        alertLevel,
        pending: metrics.pending,
        running: metrics.running,
        runningStale: metrics.runningStale,
        deadLetterLast24h: metrics.deadLetterLast24h,
        jobsCreatedLast24h: metrics.jobsCreatedLast24h,
        materializedFreshRatio: freshness.materializedFreshRatio,
        jobBudgetUtilization: saturation.jobBudgetUtilization,
        circuitBreaker: circuitBreakerSnapshot(),
      };
    }

    const intelOk = !intelligence || intelligence.alertLevel === 'ok';

    return NextResponse.json(
      {
        ok: intelOk,
        service: 'babil',
        engineVersion: BABIL_ENGINE_VERSION,
        checks: { database: 'up' as const },
        ...(intelligence ? { intelligence } : {}),
      },
      {
        status: intelOk ? 200 : 503,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  } catch (error: unknown) {
    if (isDbUnavailable(error)) {
      return NextResponse.json(
        {
          ok: false,
          service: 'babil',
          engineVersion: BABIL_ENGINE_VERSION,
          checks: { database: 'down' as const },
        },
        { status: 503, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    return NextResponse.json(
      { ok: false, service: 'babil', checks: { database: 'error' as const } },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
