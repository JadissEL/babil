'use client'

import {
  ArrowDown,
  ArrowLeft,
  Copy,
  Cpu,
  ExternalLink,
  Globe,
  Info,
  Landmark,
  Search,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { ObjectiveAwareExplorerLink } from '@/components/nav/ObjectiveAwareNavLinks'
import {
  listIntelligenceFieldPathGlossaryEntries,
  type FieldPathGlossaryEntry,
  type FieldPathSourceKind,
} from '@/lib/intelligence-fieldpath-glossary'
import { NEXUS_FOCUS_VISIBLE, NEXUS_TRANSITION } from '@/lib/nexus-chrome'
import { appToast } from '@/lib/toast-store'
import { cn } from '@/lib/utils'

const SHELL = '#FAF7EE'
const INK_10 = 'rgba(13,27,62,0.10)'

const SOURCE_ICON: Record<FieldPathSourceKind, ComponentType<{ className?: string }>> = {
  publique: Globe,
  institutionnelle: Landmark,
  agent: Cpu,
}

const SOURCE_LABEL: Record<FieldPathSourceKind, string> = {
  publique: 'Publique',
  institutionnelle: 'Institutionnelle',
  agent: 'Agent IA',
}

function MonoChip({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="rounded bg-[#0D1B3E]/8 px-1.5 py-0.5 font-mono text-[12px] font-medium text-[#0D1B3E]"
    >
      {children}
    </code>
  )
}

export default function IntelligenceFieldPathsPage() {
  const [query, setQuery] = useState('')
  const [enabled, setEnabled] = useState<Record<FieldPathSourceKind, boolean>>({
    publique: true,
    institutionnelle: true,
    agent: true,
  })
  const [copiedPath, setCopiedPath] = useState<string | null>(null)
  const [eco, setEco] = useState<{
    taxonomyVersion?: string
    dataContractVersion?: string
    glossaryEntryCount?: number
    manifest?: { fetchable?: number; total?: number }
  } | null>(null)

  useEffect(() => {
    if (!copiedPath) return
    const t = setTimeout(() => setCopiedPath(null), 1600)
    return () => clearTimeout(t)
  }, [copiedPath])

  useEffect(() => {
    void fetch('/api/intelligence/ecosystem-status')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setEco(j))
      .catch(() => setEco(null))
  }, [])

  const allRows = useMemo(() => listIntelligenceFieldPathGlossaryEntries(), [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allRows.filter((row) => {
      const kind = row.sourceKind ?? 'institutionnelle'
      if (!enabled[kind]) return false
      if (!q) return true
      const blob = `${row.fieldPath}\n${row.labelFr}\n${row.descriptionFr}\n${row.sourceLabelFr ?? ''}`.toLowerCase()
      return blob.includes(q)
    })
  }, [query, enabled, allRows])

  const toggleKind = (kind: FieldPathSourceKind) => {
    setEnabled((prev) => ({ ...prev, [kind]: !prev[kind] }))
  }

  const copyFieldPath = async (path: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(path)
        setCopiedPath(path)
        appToast.success('Identifiant copié')
      }
    } catch {
      appToast.error('Copie indisponible — sélectionnez le texte manuellement.')
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: SHELL }}>
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:px-10">
        <header className="max-w-3xl">
          <p className="font-mono text-[11px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/65">
            Documentation Technique
          </p>
          <h1
            className="mt-3 font-serif font-black tracking-tight text-[#0D1B3E]"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', lineHeight: 1.05 }}
          >
            Glossaire des Données
          </h1>
          <p className="mt-5 font-serif text-[15px] font-medium leading-[1.7] text-[#0D1B3E]/65 sm:text-[16px]">
            Ce glossaire détaille la structure des objets <MonoChip>fieldPath</MonoChip>,{' '}
            <MonoChip>CountryObservation</MonoChip> et <MonoChip>full_data</MonoChip> utilisés par
            nos agents d’intelligence. Ces définitions garantissent la transparence et la
            traçabilité des métriques d’immigration.
          </p>
          {eco ? (
            <p className="mt-4 font-mono text-[11px] font-medium text-[#0D1B3E]/55">
              Taxonomie {eco.taxonomyVersion ?? '—'} · Contrat {eco.dataContractVersion ?? '—'} ·{' '}
              {eco.glossaryEntryCount ?? filtered.length} entrées glossaire · Manifeste{' '}
              {eco.manifest?.fetchable ?? '—'}/{eco.manifest?.total ?? '—'} fetchable
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-medium text-[#0D1B3E]/65">
            <ObjectiveAwareExplorerLink
              className={cn(
                'inline-flex items-center gap-2 hover:text-[#0D1B3E]',
                NEXUS_TRANSITION,
                NEXUS_FOCUS_VISIBLE,
              )}
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Retour à l’explorateur
            </ObjectiveAwareExplorerLink>
            <Link
              href="/countries/1#provenance"
              className={cn(
                'inline-flex items-center gap-2 hover:text-[#0D1B3E]',
                NEXUS_TRANSITION,
                NEXUS_FOCUS_VISIBLE,
              )}
            >
              <Info className="h-3.5 w-3.5" aria-hidden />
              Comprendre la provenance sur un profil
            </Link>
          </div>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <main className="min-w-0">
            <div
              className="flex flex-col gap-3 rounded-2xl border bg-white px-4 py-3 sm:flex-row sm:items-center sm:px-5"
              style={{ borderColor: INK_10 }}
            >
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0D1B3E]/45"
                  aria-hidden
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher par fieldPath ou description…"
                  aria-label="Rechercher dans le glossaire"
                  className={cn(
                    'w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-sm font-medium text-[#0D1B3E] placeholder:text-[#0D1B3E]/40 focus-visible:border-[#0D1B3E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3E]/15',
                    NEXUS_TRANSITION,
                  )}
                  style={{ borderColor: INK_10 }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(['publique', 'institutionnelle', 'agent'] as FieldPathSourceKind[]).map(
                  (kind) => {
                    const Icon = SOURCE_ICON[kind]
                    const active = enabled[kind]
                    return (
                      <button
                        key={kind}
                        type="button"
                        onClick={() => toggleKind(kind)}
                        aria-pressed={active}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium',
                          NEXUS_TRANSITION,
                          NEXUS_FOCUS_VISIBLE,
                          active
                            ? 'border-[#0D1B3E]/20 bg-[#0D1B3E]/[0.04] text-[#0D1B3E]'
                            : 'border-transparent bg-white text-[#0D1B3E]/40 hover:text-[#0D1B3E]/65',
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden />
                        {SOURCE_LABEL[kind]}
                      </button>
                    )
                  },
                )}
              </div>
            </div>

            <div
              className="mt-6 overflow-x-auto rounded-2xl border bg-white"
              style={{ borderColor: INK_10 }}
            >
              <table className="w-full min-w-[820px] text-left text-sm">
                <caption className="sr-only">
                  Glossaire des fieldPath utilisés par l’intelligence pays.
                </caption>
                <thead
                  className="sticky top-0 backdrop-blur"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.85)',
                    borderColor: INK_10,
                  }}
                >
                  <tr
                    className="border-b font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55"
                    style={{ borderColor: INK_10 }}
                  >
                    <th className="px-4 py-3" scope="col">
                      Src
                    </th>
                    <th className="px-4 py-3" scope="col">
                      FieldPath
                    </th>
                    <th className="px-4 py-3" scope="col">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right" scope="col">
                      Exemple
                    </th>
                    <th className="px-4 py-3" scope="col">
                      Source
                    </th>
                    <th className="px-4 py-3" scope="col">
                      Mise à jour
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center font-serif text-sm text-[#0D1B3E]/55"
                      >
                        Aucun champ — élargir la recherche.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row, idx) => (
                      <GlossaryRow
                        key={row.fieldPath}
                        row={row}
                        zebra={idx % 2 === 1}
                        copied={copiedPath === row.fieldPath}
                        onCopy={() => void copyFieldPath(row.fieldPath)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </main>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div
              className="rounded-2xl border bg-white p-6"
              style={{ borderColor: INK_10 }}
            >
              <p className="font-mono text-[11px] font-black uppercase tracking-[0.26em] text-[#0D1B3E]/55">
                Architecture
              </p>
              <h2 className="mt-2 font-serif text-[19px] font-black leading-tight tracking-tight text-[#0D1B3E]">
                Relation avec la provenance UI
              </h2>
              <p className="mt-3 font-serif text-[13.5px] font-medium leading-[1.6] text-[#0D1B3E]/65">
                Chaque <MonoChip>fieldPath</MonoChip> de ce glossaire est mappé directement aux
                composants de provenance visibles sur les profils pays.
              </p>

              <div className="mt-5 space-y-2">
                <div
                  className="rounded-lg border bg-[#FAF7EE] px-3.5 py-3 text-[12px]"
                  style={{ borderColor: INK_10 }}
                >
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                    UI (Page 16)
                  </p>
                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    <span className="font-serif text-[13px] font-medium text-[#0D1B3E]">
                      Taux d’acceptation
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0D1B3E]/55">
                      <ExternalLink className="h-3 w-3" aria-hidden />
                      Source
                    </span>
                  </div>
                </div>
                <div className="flex justify-center" aria-hidden>
                  <ArrowDown className="h-4 w-4 text-[#0D1B3E]/35" />
                </div>
                <div
                  className="rounded-lg border bg-[#10121B] px-3.5 py-3 text-[12px]"
                  style={{ borderColor: '#1B1E27' }}
                >
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-white/55">
                    Data Pipeline
                  </p>
                  <code className="mt-1.5 block whitespace-pre-wrap break-words font-mono text-[11.5px] leading-relaxed text-emerald-100">
                    SELECT value FROM full_data WHERE path = &apos;visa.accept_rate&apos;
                  </code>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function GlossaryRow({
  row,
  zebra,
  copied,
  onCopy,
}: {
  row: FieldPathGlossaryEntry
  zebra: boolean
  copied: boolean
  onCopy: () => void
}) {
  const kind = row.sourceKind ?? 'institutionnelle'
  const Icon = SOURCE_ICON[kind]
  return (
    <tr
          className={cn(
            'border-b align-top hover:bg-[#0D1B3E]/[0.03]',
            NEXUS_TRANSITION,
          )}
      style={{
        borderColor: INK_10,
        backgroundColor: zebra ? 'rgba(13,27,62,0.02)' : 'transparent',
      }}
    >
      <td className="px-4 py-4">
        <span
          aria-label={SOURCE_LABEL[kind]}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border bg-white text-[#0D1B3E]/65"
          style={{ borderColor: INK_10 }}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
        </span>
      </td>
      <td className="px-4 py-4">
        <button
          type="button"
          onClick={onCopy}
          title="Copier l’identifiant"
          aria-label={`Copier ${row.fieldPath}`}
          className={cn(
            'group inline-flex items-center gap-2 rounded font-mono text-[12.5px] font-medium text-[#0D1B3E] hover:text-[#0D1B3E]/80',
            NEXUS_TRANSITION,
            NEXUS_FOCUS_VISIBLE,
          )}
        >
          <span className="break-all">{row.fieldPath}</span>
          <Copy
            className={`h-3 w-3 shrink-0 transition-opacity ${
              copied ? 'opacity-100 text-emerald-600' : 'opacity-0 group-hover:opacity-60'
            }`}
            aria-hidden
          />
        </button>
        <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#0D1B3E]/45">
          {row.labelFr}
        </p>
      </td>
      <td className="px-4 py-4 font-serif text-[13.5px] font-medium leading-[1.55] text-[#0D1B3E]/75">
        {row.descriptionFr}
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-right font-mono text-[12.5px] font-medium text-[#0D1B3E]">
        {row.exampleFr ?? '—'}
      </td>
      <td className="px-4 py-4 text-[12.5px]">
        {row.sourceLabelFr ? (
          <span className="font-medium leading-tight text-[#0D1B3E]">{row.sourceLabelFr}</span>
        ) : (
          <span className="text-[#0D1B3E]/45">—</span>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-4 font-mono text-[11.5px] font-medium text-[#0D1B3E]/65">
        {row.updatedAtFr ?? '—'}
      </td>
    </tr>
  )
}
