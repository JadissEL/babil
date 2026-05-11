import type { CompareKpiColumnKey } from '@/lib/compare-objectives'
import type { CompareKpiCell } from '@/lib/compare-rows'

export const PRISM_NAVY = '#0D1B3E'
export const PRISM_CREAM = '#FDFBF4'

export type PrismTrend = 'up' | 'down' | 'flat'

const VISA_PRIORITY: CompareKpiColumnKey[] = ['visa_study', 'visa_work', 'visa_business', 'visa_tourism']

export function pickPrimaryVisaKpi(kpis: CompareKpiCell[]): CompareKpiCell | null {
  for (const k of VISA_PRIORITY) {
    const c = kpis.find((x) => x.key === k)
    if (c) return c
  }
  return null
}

export function parseVisaScorePercent(raw: string): number | null {
  const n = parseFloat(String(raw).replace(',', '.').trim())
  if (!Number.isFinite(n)) return null
  return Math.max(0, Math.min(100, Math.round(n)))
}

export function prismMedian(values: number[]): number {
  if (!values.length) return 0
  const s = [...values].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2
}

export function prismTrendForValue(v: number, values: number[], epsilon = 0.01): PrismTrend {
  if (values.length < 2) return 'flat'
  const med = prismMedian(values)
  if (Math.abs(v - med) < epsilon) return 'flat'
  return v > med ? 'up' : 'down'
}

/** Indicatif loyer studio centre-ville (EUR) — lecture comparative stable. */
export function prismRentPlaceholderEuro(countryId: number): number {
  const id = Math.abs(countryId) || 1
  return 620 + (id % 7) * 45 + ((id * 3) % 5) * 12
}

/** Score composite affiché comme sur la maquette (échelle ~0–10). */
export function prismCompositeDisplay(score01to100: number): string {
  const v = (Math.max(0, Math.min(100, score01to100)) / 10)
  return v.toFixed(1)
}
