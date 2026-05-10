import { slogRequest } from '@/lib/structured-log';

/** Stable keys for dashboards / p95 queries (G.92). */
export const API_ROUTE_LATENCY_KEYS = {
  countriesList: 'api_countries_list',
  countriesDetail: 'api_countries_detail',
  recommendationPost: 'api_recommendation_post',
  probabilityPost: 'api_probability_post',
} as const;

export type ApiRouteLatencyKey =
  (typeof API_ROUTE_LATENCY_KEYS)[keyof typeof API_ROUTE_LATENCY_KEYS];

/** Same defaults as G.91 access log: on on Vercel unless disabled. */
export function shouldLogApiRouteLatency(): boolean {
  if (process.env.BABIL_API_ROUTE_LATENCY_LOG === '0') return false;
  if (process.env.BABIL_API_ROUTE_LATENCY_LOG === '1') return true;
  return process.env.VERCEL === '1';
}

function roundDurationMs(start: number): number {
  return Math.max(0, Math.round(performance.now() - start));
}

/**
 * Measures handler wall time and emits one JSON line (`msg: api_route_latency`) for observability.
 * p95 is computed in your log platform from `durationMs` + `routeKey`.
 */
export async function withApiRouteLatency<T extends Response>(
  req: Request,
  routeKey: ApiRouteLatencyKey,
  handler: () => Promise<T>,
): Promise<T> {
  const t0 = performance.now();
  try {
    const res = await handler();
    if (shouldLogApiRouteLatency()) {
      slogRequest('info', 'api_route_latency', req, {
        routeKey,
        method: req.method,
        status: res.status,
        durationMs: roundDurationMs(t0),
      });
    }
    return res;
  } catch (err) {
    if (shouldLogApiRouteLatency()) {
      slogRequest('error', 'api_route_latency', req, {
        routeKey,
        method: req.method,
        status: 500,
        durationMs: roundDurationMs(t0),
      });
    }
    throw err;
  }
}
