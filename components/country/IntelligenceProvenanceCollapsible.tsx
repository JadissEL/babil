'use client'

import { useCallback, useId, useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react'

type ProvenanceRow = {
  fieldPath: string
  observedAt: string
  confidence: number
  source: { slug: string; name: string; tier: string }
}

/** Chargement paresseux : `GET /api/countries/[id]?intelligence=1` */
export function IntelligenceProvenanceCollapsible({ countryId }: { countryId: string }) {
  const panelId = useId()
  const headingId = useId()
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<ProvenanceRow[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggle = useCallback(async () => {
    const next = !open
    if (next && rows === null) {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/countries/${encodeURIComponent(countryId)}?intelligence=1`)
        const data = (await res.json()) as { intelligence_provenance?: unknown }
        const raw = data?.intelligence_provenance
        if (!Array.isArray(raw)) {
          setRows([])
        } else {
          setRows(
            raw.map((r) => {
              const o = r as ProvenanceRow
              return {
                fieldPath: String(o.fieldPath ?? ''),
                observedAt: typeof o.observedAt === 'string' ? o.observedAt : String(o.observedAt ?? ''),
                confidence: Number(o.confidence ?? 0),
                source: {
                  slug: String(o.source?.slug ?? ''),
                  name: String(o.source?.name ?? ''),
                  tier: String(o.source?.tier ?? ''),
                },
              }
            }),
          )
        }
      } catch {
        setError('Impossible de charger les sources pour le moment.')
        setRows([])
      } finally {
        setLoading(false)
      }
    }
    setOpen(next)
  }, [open, rows, countryId])

  return (
    <div className="mt-6 rounded-2xl border border-line bg-inset/80 p-4 sm:p-5">
      <button
        type="button"
        id={headingId}
        onClick={() => void toggle()}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <span className="flex items-center gap-2 text-sm font-black text-text">
          <BookOpen className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          Sources des données intelligence
        </span>
        {open ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-muted" aria-hidden />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-muted" aria-hidden />
        )}
      </button>
      <p className="mt-2 text-[11px] font-medium leading-relaxed text-muted">
        Champs issus du pipeline (ex. Banque mondiale) : traçabilité par observation, sans valeur brute complète.
      </p>

      <div
        id={panelId}
        role="region"
        aria-labelledby={headingId}
        hidden={!open}
        className="mt-4 border-t border-line pt-4"
      >
        {loading ? (
          <p className="text-sm font-medium text-muted">Chargement…</p>
        ) : error ? (
          <p className="text-sm font-bold text-danger">{error}</p>
        ) : !rows?.length ? (
          <p className="text-sm font-medium text-muted">
            Aucune observation enregistrée pour ce pays. Lancez le pipeline intelligence ou attendez le prochain
            enrichissement.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-xs">
              <thead>
                <tr className="border-b border-line text-[10px] font-black uppercase tracking-wider text-muted">
                  <th className="pb-2 pr-3">Champ</th>
                  <th className="pb-2 pr-3">Source</th>
                  <th className="pb-2 pr-3">Niveau</th>
                  <th className="pb-2 pr-3">Observé</th>
                  <th className="pb-2">Confiance</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={`${r.fieldPath}-${i}`} className="border-b border-line/80 font-medium text-text">
                    <td className="py-2 pr-3 font-mono text-[10px] text-muted">{r.fieldPath}</td>
                    <td className="py-2 pr-3">{r.source.name || r.source.slug}</td>
                    <td className="py-2 pr-3 text-muted">{r.source.tier}</td>
                    <td className="py-2 pr-3 text-muted">
                      {r.observedAt
                        ? new Date(r.observedAt).toLocaleString('fr-FR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </td>
                    <td className="py-2">{Math.round(r.confidence * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
