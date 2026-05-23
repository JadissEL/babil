'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type ReviewItem = {
  id: string;
  reviewReason: 'disputed' | 'medium_confidence';
  claim: {
    fieldPath: string;
    summary: string;
    sourceUrl: string | null;
    verificationStatus: string;
    confidence: number;
  };
  countryName: string;
  region: string | null;
};

type ReviewQueueResponse = {
  needsReview: ReviewItem[];
  counts: { disputed: number; pending: number; needsReview: number };
};

export function IntelligenceReviewQueuePanel() {
  const [data, setData] = useState<ReviewQueueResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/intelligence/review-queue');
      if (!res.ok) throw new Error('Review queue unavailable');
      const raw = (await res.json()) as ReviewQueueResponse;
      setData(raw);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function resolve(observationId: string, action: 'verify' | 'dispute' | 'pending') {
    const res = await fetch('/api/admin/intelligence/review-queue/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ observationId, action }),
    });
    if (!res.ok) return;
    await load();
  }

  const items = data?.needsReview ?? [];

  return (
    <Card className="border-line bg-surface">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-muted">
              File de revue (HITL)
            </p>
            <p className="text-sm text-muted">
              Litiges et confiance moyenne (une source) — triage avant promotion golden record.
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

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        {data ? (
          <p className="text-xs text-muted">
            {data.counts.needsReview} à revoir · {data.counts.disputed} disputed ·{' '}
            {data.counts.pending} pending
          </p>
        ) : null}

        <ul className="max-h-80 space-y-3 overflow-auto text-sm">
          {items.slice(0, 25).map((row) => (
            <li key={row.id} className="rounded-lg border border-line bg-[#faf7ee] p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase ${
                    row.reviewReason === 'disputed'
                      ? 'bg-[#ffe8e8] text-danger'
                      : 'bg-[#fff8e8] text-amber-800'
                  }`}
                >
                  {row.reviewReason === 'disputed' ? 'Litige' : 'Confiance moyenne'}
                </span>
                <p className="font-bold text-text">
                  {row.countryName}
                  {row.region ? ` · ${row.region}` : ''}
                </p>
              </div>
              <p className="font-mono text-[11px] text-muted">{row.claim.fieldPath}</p>
              <p className="mt-1 line-clamp-2 text-xs">
                {row.claim.summary} · {Math.round(row.claim.confidence * 100)}%
              </p>
              {row.claim.sourceUrl ? (
                <a
                  href={row.claim.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block truncate text-xs text-primary underline"
                >
                  {row.claim.sourceUrl}
                </a>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  type="button"
                  className="text-xs"
                  variant="outline"
                  onClick={() => void resolve(row.id, 'verify')}
                >
                  Vérifier
                </Button>
                <Button
                  type="button"
                  className="text-xs"
                  variant="outline"
                  onClick={() => void resolve(row.id, 'dispute')}
                >
                  Litige
                </Button>
                <Button
                  type="button"
                  className="text-xs"
                  variant="outline"
                  onClick={() => void resolve(row.id, 'pending')}
                >
                  En attente
                </Button>
              </div>
            </li>
          ))}
        </ul>

        {items.length === 0 && !loading ? (
          <p className="text-sm text-muted">Aucun élément en file — consensus OK.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
