'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type SloReport = {
  generatedAt: string;
  alertLevel: 'ok' | 'warning' | 'critical';
  deadLetterLast24h: number;
  sloHints: string[];
  queue: {
    pending: number;
    running: number;
    failedLast24h: number;
    succeededLast24h: number;
    oldestPendingAgeMinutes: number | null;
    retrySaturationRatio: number;
    deadLetterLast24h: number;
  };
  observations: { total: number; verified: number; disputed: number; pending: number };
  jobsLast24h: { succeeded: number; failed: number; pending: number; running: number };
  freshness?: {
    materializedFreshRatio: number;
    materializedFreshCount: number;
    materializedStaleCount: number;
    staleMaterializeDays: number;
  };
  freshnessAlertLevel?: 'ok' | 'warning' | 'critical';
  volume?: {
    observationsCreated: number;
    observationsPerHour: number;
    pipelineJobs: { failRate: number };
  };
  volumeAlertLevel?: 'ok' | 'warning' | 'critical';
  latency?: {
    sampleCount: number;
    p95DurationMs: number | null;
    p95WarnThresholdMs: number;
  };
  latencyAlertLevel?: 'ok' | 'warning' | 'critical';
  saturation?: {
    jobsCreatedToday: number;
    maxJobsPerDay: number;
    jobBudgetUtilization: number;
  };
  saturationAlertLevel?: 'ok' | 'warning' | 'critical';
  contract?: {
    sampleSize: number;
    violationRate: number;
    violationCount: number;
    topViolationCodes: { code: string; count: number }[];
  };
  contractAlertLevel?: 'ok' | 'warning' | 'critical';
};

const alertClass: Record<SloReport['alertLevel'], string> = {
  ok: 'border-[#e8f4ff] bg-[#f8fcff]',
  warning: 'border-[#fff8e8] bg-[#fffbf0]',
  critical: 'border-[#ffe8e8] bg-[#fff5f5]',
};

export function IntelligenceSloPanel() {
  const [data, setData] = useState<SloReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/intelligence/metrics');
      if (!res.ok) throw new Error('Metrics unavailable');
      setData((await res.json()) as SloReport);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !data) {
    return (
      <Card className="border-dashed border-line">
        <CardContent className="p-4 text-sm text-muted">SLO pipeline…</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-line">
        <CardContent className="flex items-center justify-between gap-2 p-4">
          <p className="text-sm text-danger">{error}</p>
          <Button type="button" variant="outline" className="text-xs" onClick={() => void load()}>
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className={`border ${alertClass[data.alertLevel]}`}>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-black uppercase tracking-wider text-muted">
            SLO pipeline · {data.alertLevel}
          </p>
          <Button type="button" variant="outline" className="text-xs" onClick={() => void load()}>
            Actualiser
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div>
            <p className="text-[10px] text-muted">Pending jobs</p>
            <p className="font-black text-text">{data.queue.pending}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted">DLQ 24h</p>
            <p className="font-black text-text">{data.deadLetterLast24h}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted">Fail rate 24h</p>
            <p className="font-black text-text">
              {data.jobsLast24h.succeeded + data.jobsLast24h.failed > 0
                ? Math.round(
                    (data.jobsLast24h.failed /
                      (data.jobsLast24h.succeeded + data.jobsLast24h.failed)) *
                      100,
                  )
                : 0}
              %
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted">Obs. disputed</p>
            <p className="font-black text-danger">{data.observations.disputed}</p>
          </div>
          {data.volume ? (
            <div>
              <p className="text-[10px] text-muted">Ingest 24h</p>
              <p className="font-black text-text">
                {data.volume.observationsCreated} obs · {data.volume.observationsPerHour}/h
                {data.volume.pipelineJobs.failRate > 0.15
                  ? ` · fail ${Math.round(data.volume.pipelineJobs.failRate * 100)}%`
                  : ''}
              </p>
            </div>
          ) : null}
          {data.latency?.p95DurationMs != null ? (
            <div>
              <p className="text-[10px] text-muted">Job P95 (24h)</p>
              <p className="font-black text-text">
                {Math.round(data.latency.p95DurationMs / 1000)}s
                {data.latencyAlertLevel && data.latencyAlertLevel !== 'ok'
                  ? ` · ${data.latencyAlertLevel}`
                  : ''}
              </p>
            </div>
          ) : null}
          {data.saturation ? (
            <div>
              <p className="text-[10px] text-muted">Budget jour</p>
              <p className="font-black text-text">
                {data.saturation.jobsCreatedToday}/{data.saturation.maxJobsPerDay} (
                {Math.round(data.saturation.jobBudgetUtilization * 100)}%)
                {data.saturationAlertLevel && data.saturationAlertLevel !== 'ok'
                  ? ` · ${data.saturationAlertLevel}`
                  : ''}
              </p>
            </div>
          ) : null}
          {data.contract && data.contract.sampleSize > 0 ? (
            <div className="col-span-2">
              <p className="text-[10px] text-muted">Contrat données (échantillon)</p>
              <p className="font-black text-text">
                {Math.round(data.contract.violationRate * 100)}% violations (
                {data.contract.violationCount}/{data.contract.sampleSize})
                {data.contractAlertLevel && data.contractAlertLevel !== 'ok'
                  ? ` · ${data.contractAlertLevel}`
                  : ''}
              </p>
            </div>
          ) : null}
          {data.freshness ? (
            <div className="col-span-2 sm:col-span-4">
              <p className="text-[10px] text-muted">
                Matérialisation fraîche (&lt;{data.freshness.staleMaterializeDays}j)
              </p>
              <p className="font-black text-text">
                {Math.round(data.freshness.materializedFreshRatio * 100)}% ·{' '}
                {data.freshness.materializedFreshCount} frais /{' '}
                {data.freshness.materializedStaleCount} stale
                {data.freshnessAlertLevel && data.freshnessAlertLevel !== 'ok'
                  ? ` · ${data.freshnessAlertLevel}`
                  : ''}
              </p>
            </div>
          ) : null}
        </div>
        {data.sloHints.length > 0 ? (
          <ul className="list-inside list-disc text-[11px] text-muted">
            {data.sloHints.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        ) : (
          <p className="text-[11px] text-muted">Aucun signal SLO hors norme.</p>
        )}
        <p className="text-[10px] text-muted">
          Généré {new Date(data.generatedAt).toLocaleString('fr-FR')}
        </p>
      </CardContent>
    </Card>
  );
}
