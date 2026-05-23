import { NextRequest, NextResponse } from 'next/server';
import { buildIntelligenceSloReport } from '@/lib/intelligence-pipeline/slo-report';
import { circuitBreakerSnapshot } from '@/lib/intelligence-pipeline/fetch-circuit-breaker';

/**
 * Prometheus-style text metrics for intelligence pipeline (ops / Grafana).
 * Auth: `Authorization: Bearer <CRON_SECRET>` or `?secret=`.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return new NextResponse('# CRON_SECRET not configured\n', { status: 503 });
  }

  const auth = req.headers.get('authorization');
  const q = req.nextUrl.searchParams.get('secret');
  if (auth !== `Bearer ${secret}` && q !== secret) {
    return new NextResponse('# unauthorized\n', { status: 401 });
  }

  try {
    const slo = await buildIntelligenceSloReport();
    const cb = circuitBreakerSnapshot();
    const lines = [
      '# HELP babil_intelligence_queue_pending Pending pipeline jobs',
      '# TYPE babil_intelligence_queue_pending gauge',
      `babil_intelligence_queue_pending ${slo.queue.pending}`,
      '# HELP babil_intelligence_queue_running Running pipeline jobs',
      '# TYPE babil_intelligence_queue_running gauge',
      `babil_intelligence_queue_running ${slo.queue.running}`,
      '# HELP babil_intelligence_queue_running_stale Running jobs older than threshold',
      '# TYPE babil_intelligence_queue_running_stale gauge',
      `babil_intelligence_queue_running_stale ${slo.queue.runningStale}`,
      '# HELP babil_intelligence_jobs_created_24h Jobs created in last 24h',
      '# TYPE babil_intelligence_jobs_created_24h gauge',
      `babil_intelligence_jobs_created_24h ${slo.queue.jobsCreatedLast24h}`,
      '# HELP babil_intelligence_dead_letter_24h Dead-letter jobs last 24h',
      '# TYPE babil_intelligence_dead_letter_24h gauge',
      `babil_intelligence_dead_letter_24h ${slo.deadLetterLast24h}`,
      '# HELP babil_intelligence_observations_disputed Disputed observations',
      '# TYPE babil_intelligence_observations_disputed gauge',
      `babil_intelligence_observations_disputed ${slo.observations.disputed}`,
      '# HELP babil_intelligence_materialized_fresh_ratio Materialization freshness ratio',
      '# TYPE babil_intelligence_materialized_fresh_ratio gauge',
      `babil_intelligence_materialized_fresh_ratio ${slo.freshness.materializedFreshRatio}`,
      '# HELP babil_intelligence_circuit_breaker_open_hosts Open circuit-breaker hosts',
      '# TYPE babil_intelligence_circuit_breaker_open_hosts gauge',
      `babil_intelligence_circuit_breaker_open_hosts ${cb.openHosts.length}`,
      '# HELP babil_intelligence_alert_level Alert level (0=ok 1=warning 2=critical)',
      '# TYPE babil_intelligence_alert_level gauge',
      `babil_intelligence_alert_level ${slo.alertLevel === 'critical' ? 2 : slo.alertLevel === 'warning' ? 1 : 0}`,
      '# HELP babil_intelligence_job_p95_duration_ms Job duration P95 (24h sample)',
      '# TYPE babil_intelligence_job_p95_duration_ms gauge',
      `babil_intelligence_job_p95_duration_ms ${slo.latency.p95DurationMs ?? 0}`,
      '# HELP babil_intelligence_job_budget_utilization Daily job budget utilization (0-1)',
      '# TYPE babil_intelligence_job_budget_utilization gauge',
      `babil_intelligence_job_budget_utilization ${slo.saturation.jobBudgetUtilization}`,
      '# HELP babil_intelligence_contract_violation_rate Sampled observation contract violation rate',
      '# TYPE babil_intelligence_contract_violation_rate gauge',
      `babil_intelligence_contract_violation_rate ${slo.contract.violationRate}`,
    ];
    return new NextResponse(`${lines.join('\n')}\n`, {
      headers: { 'Content-Type': 'text/plain; version=0.0.4' },
    });
  } catch {
    return new NextResponse('# intelligence metrics unavailable\n', { status: 503 });
  }
}
