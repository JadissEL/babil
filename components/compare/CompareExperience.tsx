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
    return (
      <div className="py-16 text-center text-sm font-bold text-muted sm:py-20 sm:text-base">
        Chargement des pays…
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-8 pb-[max(9rem,calc(7.5rem+env(safe-area-inset-bottom,0px)))] sm:space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
          <div className="rounded-2xl bg-primary p-2.5 text-white shadow-soft sm:p-3">
            <Scale className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight text-text sm:text-3xl md:text-4xl">
              Comparer les pays
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-muted sm:text-[15px]">
              Jusqu&apos;à {MAX} destinations, même grille de scores que l&apos;Explorer. La ligne « Meilleur » suit le
              score composite.
            </p>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-8">
        <CountryComparePicker
          options={options}
          selectedIds={selectedIds}
          max={MAX}
          search={search}
          onSearchChange={setSearch}
          onToggle={toggle}
        />
        <div className="min-w-0 space-y-3 sm:space-y-4">
          <h2 className="text-base font-bold text-text sm:text-lg">Tableau comparatif</h2>
          <CompareTable rows={rows} winnerId={winnerId} />
        </div>
      </div>

      <CompareStickyBar names={names} max={MAX} onClear={() => setSelectedIds([])} onScrollToTable={scrollToTable} />
    </div>
  )
}
