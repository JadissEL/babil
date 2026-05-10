import { NextResponse } from 'next/server';
import { isDbUnavailable } from '@/lib/db-resilience';
import { BABIL_ENGINE_VERSION } from '@/lib/engine-version';
import prisma from '@/lib/prisma';

/**
 * Lightweight **public** liveness/readiness probe (G.96).
 * No auth — intended for load balancers and uptime checks. Avoid PII in responses.
 *
 * Deep agent / DB metrics: `GET /api/admin/agents/health` (admin only) — see docs/healthcheck-g96.md
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        ok: true,
        service: 'babil',
        engineVersion: BABIL_ENGINE_VERSION,
        checks: { database: 'up' as const },
      },
      {
        status: 200,
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
