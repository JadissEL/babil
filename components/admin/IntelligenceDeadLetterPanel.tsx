'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type DeadLetterJob = {
  id: string;
  kind: string;
  finishedAt: string | null;
  errorSummary: string | null;
  errorClass?: string;
  canRedrive?: boolean;
};

export function IntelligenceDeadLetterPanel() {
  const [jobs, setJobs] = useState<DeadLetterJob[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/intelligence/dead-letter-jobs');
      if (!res.ok) return;
      const data = (await res.json()) as { jobs: DeadLetterJob[] };
      setJobs(data.jobs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function redrive(jobId: string) {
    const res = await fetch('/api/admin/intelligence/dead-letter-jobs/redrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    });
    if (res.ok) await load();
  }

  async function bulkRedrive() {
    const res = await fetch('/api/admin/intelligence/dead-letter-jobs/bulk-redrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 3 }),
    });
    if (res.ok) await load();
  }

  if (jobs.length === 0 && !loading) return null;

  return (
    <Card className="border-line bg-surface">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-danger">
              Dead-letter (24h)
            </p>
            <p className="text-xs text-muted">
              Jobs ayant épuisé les tentatives — redrive manuel après correction.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="text-xs"
            disabled={loading}
            onClick={() => void load()}
          >
            Rafraîchir
          </Button>
        </div>
        <ul className="max-h-48 space-y-2 overflow-auto text-xs">
          {jobs.slice(0, 12).map((j) => (
            <li key={j.id} className="rounded border border-line bg-[#fff5f5] p-2">
              <p className="font-mono font-bold text-text">
                {j.kind} · {j.id.slice(0, 10)}…
              </p>
              <p className="line-clamp-2 text-muted">{j.errorSummary}</p>
              {j.errorClass ? (
                <p className="mt-1 text-[10px] text-muted">
                  {j.errorClass}
                  {j.canRedrive ? ' · redrive OK' : ' · poison/permanent'}
                </p>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="mt-2 text-xs"
                disabled={j.canRedrive === false}
                onClick={() => void redrive(j.id)}
              >
                Redrive
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
