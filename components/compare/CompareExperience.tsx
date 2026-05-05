'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Scale } from 'lucide-react'

import { CompareStickyBar } from '@/components/compare/CompareStickyBar'
import { CompareTable } from '@/components/compare/CompareTable'
import { CountryComparePicker, type CountryOption } from '@/components/compare/CountryComparePicker'
import { enrichedToCompareRow } from '@/lib/compare-rows'
import { enrichCountryApiRecord } from '@/lib/enrich-country-api'
import type { EnrichedCountryApi } from '@/lib/enrich-country-api'

const MAX = 4

export function CompareExperience() {
  const [raw, setRaw] = useState<Record<string, unknown>[]>([])
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/countries')
      .then((r) => r.json())
      .then((d) => setRaw(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [])

  const enriched = useMemo(
    () => raw.map((c) => enrichCountryApiRecord(c)),
    [raw],
  )

  const options: CountryOption[] = useMemo(
    () => enriched.map((c) => ({ id: c.id, name: c.name })).sort((a, b) => a.name.localeCompare(b.name)),
    [enriched],
  )

  const byId = useMemo(() => {
    const m = new Map<number, EnrichedCountryApi>()
    enriched.forEach((c) => m.set(c.id, c))
    return m
  }, [enriched])

  const toggle = useCallback((id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX) return prev
      return [...prev, id]
    })
  }, [])

  const rows = useMemo(() => {
    return selectedIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((c) => enrichedToCompareRow(c as EnrichedCountryApi))
  }, [selectedIds, byId])

  const winnerId = useMemo(() => {
    if (rows.length === 0) return null
    let best = rows[0]
    for (const r of rows) {
      if (r.composite > best.composite) best = r
    }
    return best.id
  }, [rows])

  const names = useMemo(
    () => selectedIds.map((id) => options.find((o) => o.id === id)?.name).filter(Boolean) as string[],
    [selectedIds, options],
  )

  const scrollToTable = () => {
    document.getElementById('compare-table-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (loading) {
    return <div className="py-20 text-center font-bold text-slate-500">Chargement des pays…</div>
  }

  return (
    <div className="space-y-10 pb-28">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-indigo-600 p-3 text-white shadow-lg shadow-indigo-900/40">
            <Scale className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">Comparer les pays</h1>
            <p className="mt-1 text-sm text-slate-400">
              Jusqu&apos;à {MAX} destinations, même grille de scores que l&apos;Explorer. La ligne « Best » suit le score composite.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
        <CountryComparePicker
          options={options}
          selectedIds={selectedIds}
          max={MAX}
          search={search}
          onSearchChange={setSearch}
          onToggle={toggle}
        />
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Tableau comparatif</h2>
          <CompareTable rows={rows} winnerId={winnerId} />
        </div>
      </div>

      <CompareStickyBar names={names} max={MAX} onClear={() => setSelectedIds([])} onScrollToTable={scrollToTable} />
    </div>
  )
}
