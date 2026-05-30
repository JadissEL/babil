'use client';

import { useCallback, useEffect, useState } from 'react';

type GatedSource = {
  id: string;
  slug: string;
  name: string;
  baseUrl: string | null;
  discoveryStatus: string;
  siteInventory: { status: string; pageCount: number } | null;
};

type InventoryResponse = {
  source: {
    id: string;
    slug: string;
    name: string;
    discoveryStatus: string;
  };
  inventory: { status: string; pageCount: number } | null;
  pages: { url: string; pageType: string }[];
  pageIndexTotal?: number;
};

export function IntelligenceSourceInventoryPanel() {
  const [gatedSources, setGatedSources] = useState<GatedSource[]>([]);
  const [sourceId, setSourceId] = useState('');
  const [data, setData] = useState<InventoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [enqueueMsg, setEnqueueMsg] = useState<string | null>(null);

  const loadGated = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/intelligence/gated-sources');
      if (!res.ok) return;
      const j = (await res.json()) as { sources: GatedSource[] };
      setGatedSources(j.sources ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void loadGated();
  }, [loadGated]);

  const loadDetail = useCallback(
    async (id?: string) => {
      const target = (id ?? sourceId).trim();
      if (!target) return;
      if (id) setSourceId(id);
      setLoading(true);
      setError(null);
      setEnqueueMsg(null);
      try {
        const res = await fetch(
          `/api/admin/intelligence/source-inventory/${encodeURIComponent(target)}`,
        );
        if (!res.ok) {
          const j = (await res.json()) as { error?: string };
          throw new Error(j.error ?? res.statusText);
        }
        setData((await res.json()) as InventoryResponse);
      } catch (e) {
        setData(null);
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [sourceId],
  );

  const load = useCallback(() => loadDetail(), [loadDetail]);

  const enqueueDiscovery = useCallback(
    async (id: string) => {
      setEnqueueMsg(null);
      setError(null);
      try {
        const res = await fetch('/api/admin/intelligence/source-discovery/enqueue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sourceId: id }),
        });
        const j = (await res.json()) as {
          enqueue?: { created: boolean; reason?: string };
          error?: string;
        };
        if (!res.ok) throw new Error(j.error ?? res.statusText);
        if (j.enqueue?.created) {
          setEnqueueMsg('Job discovery en file.');
        } else {
          setEnqueueMsg(`Non créé : ${j.enqueue?.reason ?? 'unknown'}`);
        }
        void loadGated();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [loadGated],
  );

  return (
    <section className="rounded-lg border border-border bg-card p-4 space-y-4">
      <h3 className="text-sm font-semibold">Inventaire source (découverte)</h3>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Sources avec gate ({gatedSources.length}) — cartographie bornée (sitemap, max 200 pages)
        </p>
        <div className="max-h-48 overflow-auto rounded border border-border text-xs">
          <table className="w-full">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="text-left p-2">Nom</th>
                <th className="text-left p-2">Statut</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {gatedSources.slice(0, 50).map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="p-2">
                    <button
                      type="button"
                      className="text-left hover:underline"
                      onClick={() => void loadDetail(s.id)}
                    >
                      {s.name}
                    </button>
                    {!s.baseUrl ? <span className="ml-1 text-amber-600">(sans URL)</span> : null}
                  </td>
                  <td className="p-2">{s.discoveryStatus}</td>
                  <td className="p-2">
                    <button
                      type="button"
                      className="rounded bg-primary/90 px-2 py-0.5 text-primary-foreground disabled:opacity-40"
                      disabled={!s.baseUrl}
                      title={s.baseUrl ? 'Lancer discovery' : 'baseUrl requis'}
                      onClick={() => void enqueueDiscovery(s.id)}
                    >
                      Discovery
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          className="flex-1 min-w-[200px] rounded border border-input bg-background px-2 py-1 text-sm"
          placeholder="ID source (cuid)"
          value={sourceId}
          onChange={(e) => setSourceId(e.target.value)}
        />
        <button
          type="button"
          className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground disabled:opacity-50"
          disabled={loading || !sourceId.trim()}
          onClick={() => void load()}
        >
          {loading ? 'Chargement…' : 'Détail'}
        </button>
      </div>
      {enqueueMsg ? <p className="text-sm text-emerald-700">{enqueueMsg}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {data ? (
        <div className="text-sm space-y-1">
          <p>
            <strong>{data.source.name}</strong> — {data.source.discoveryStatus} (
            {data.inventory?.pageCount ?? data.pageIndexTotal ?? 0} pages indexées)
          </p>
          <ul className="max-h-40 overflow-auto text-muted-foreground list-disc pl-4">
            {data.pages.slice(0, 12).map((p) => (
              <li key={p.url}>
                [{p.pageType}] {p.url}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
