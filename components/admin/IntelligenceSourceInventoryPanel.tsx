'use client'

import { useCallback, useState } from 'react'

type InventoryResponse = {
  source: {
    id: string
    slug: string
    name: string
    discoveryStatus: string
    pageIndexTotal?: number
  }
  inventory: { status: string; pageCount: number } | null
  pages: { url: string; pageType: string }[]
}

export function IntelligenceSourceInventoryPanel() {
  const [sourceId, setSourceId] = useState('')
  const [data, setData] = useState<InventoryResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!sourceId.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/intelligence/source-inventory/${encodeURIComponent(sourceId.trim())}`)
      if (!res.ok) {
        const j = (await res.json()) as { error?: string }
        throw new Error(j.error ?? res.statusText)
      }
      setData((await res.json()) as InventoryResponse)
    } catch (e) {
      setData(null)
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [sourceId])

  return (
    <section className="rounded-lg border border-border bg-card p-4 space-y-3">
      <h3 className="text-sm font-semibold">Inventaire source (découverte)</h3>
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
          {loading ? 'Chargement…' : 'Charger'}
        </button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {data ? (
        <div className="text-sm space-y-1">
          <p>
            <strong>{data.source.name}</strong> — {data.source.discoveryStatus} (
            {data.inventory?.pageCount ?? 0} pages indexées)
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
  )
}
