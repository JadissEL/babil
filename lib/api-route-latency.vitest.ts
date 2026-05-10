import { NextResponse } from 'next/server';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { API_ROUTE_LATENCY_KEYS, withApiRouteLatency } from '@/lib/api-route-latency';

describe('withApiRouteLatency', () => {
  const envSnapshot = { ...process.env };
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    process.env = { ...envSnapshot };
  });

  it('emits api_route_latency JSON when BABIL_API_ROUTE_LATENCY_LOG=1', async () => {
    process.env.BABIL_API_ROUTE_LATENCY_LOG = '1';
    delete process.env.VERCEL;

    const req = new Request('https://example.com/api/countries', {
      headers: { 'x-babil-request-id': 'rid-test' },
    });
    const res = await withApiRouteLatency(req, API_ROUTE_LATENCY_KEYS.countriesList, async () =>
      NextResponse.json({ ok: true }),
    );

    expect(res.status).toBe(200);
    expect(logSpy).toHaveBeenCalledTimes(1);
    const line = JSON.parse(String(logSpy.mock.calls[0][0])) as Record<string, unknown>;
    expect(line.msg).toBe('api_route_latency');
    expect(line.routeKey).toBe('api_countries_list');
    expect(line.status).toBe(200);
    expect(line.requestId).toBe('rid-test');
    expect(typeof line.durationMs).toBe('number');
    expect(line.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('does not log when BABIL_API_ROUTE_LATENCY_LOG=0', async () => {
    process.env.BABIL_API_ROUTE_LATENCY_LOG = '0';
    process.env.VERCEL = '1';

    const req = new Request('https://example.com/api/countries');
    await withApiRouteLatency(req, API_ROUTE_LATENCY_KEYS.countriesList, async () =>
      NextResponse.json({ ok: true }),
    );

    expect(logSpy).not.toHaveBeenCalled();
  });
});
