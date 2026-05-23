'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type CompletenessRow = {
  countryId: number;
  name: string;
  region: string | null;
  score: number;
  materializedCoverage: number;
  missingPaths: string[];
  disputedFieldCount: number;
};

type CompletenessResponse = {
  sampled: number;
  averageScore: number;
  lowest: CompletenessRow[];
  highest: CompletenessRow[];
};

export function IntelligenceCompletenessPanel() {
  const [data, setData] = useState<CompletenessResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/intelligence/completeness?limit=12');
      if (!res.ok) throw new Error('Completeness unavailable');
      setData((await res.json()) as CompletenessResponse);
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
        <CardContent className="p-4 text-sm text-muted">Scores complétude…</CardContent>
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
    <Card className="border border-line bg-surface">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-black uppercase tracking-wider text-muted">
            Complétude intelligence · moyenne {data.averageScore}% ({data.sampled} pays)
          </p>
          <Button type="button" variant="outline" className="text-xs" onClick={() => void load()}>
            Actualiser
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="mb-1 text-[10px] font-black uppercase text-danger">
              Priorité enrichissement
            </p>
            <ul className="space-y-1 text-[11px]">
              {data.lowest.map((c) => (
                <li key={c.countryId} className="rounded border border-line bg-[#fff5f5] px-2 py-1">
                  <span className="font-black text-text">{c.name}</span> · {c.score}% · couv.{' '}
                  {Math.round(c.materializedCoverage * 100)}%
                  {c.missingPaths.length > 0 ? (
                    <span className="block text-muted line-clamp-1">
                      manque: {c.missingPaths.join(', ')}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-black uppercase text-muted">Meilleure couverture</p>
            <ul className="space-y-1 text-[11px]">
              {data.highest.slice(0, 6).map((c) => (
                <li key={c.countryId} className="rounded border border-line bg-[#f0fff4] px-2 py-1">
                  <span className="font-black text-text">{c.name}</span> · {c.score}%
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
