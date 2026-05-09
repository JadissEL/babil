/**
 * B.31 — Agrégat des `CountryObservation.confidence` (0–1 en base) pour un pays.
 * Complète la « confiance données » de la fiche (`full_data.confidence_score`, 0–100).
 */

export type ObservationConfidenceAggregatePayload = {
  count: number
  /** Moyenne arithmétique des confidences (0–1). */
  mean: number
  min: number
  max: number
  /** `mean` arrondi en pourcentage 0–100 pour l’UI. */
  meanPercent: number
}

export type PrismaObservationConfidenceAggregateRow = {
  _count: { _all: number }
  _avg: { confidence: number | null }
  _min: { confidence: number | null }
  _max: { confidence: number | null }
}

export function mapPrismaObservationConfidenceAggregate(
  row: PrismaObservationConfidenceAggregateRow,
): ObservationConfidenceAggregatePayload | null {
  const count = row._count._all
  if (count === 0) return null
  const mean = row._avg.confidence
  if (mean == null || !Number.isFinite(mean)) return null
  const minRaw = row._min.confidence
  const maxRaw = row._max.confidence
  const min = minRaw != null && Number.isFinite(minRaw) ? minRaw : mean
  const max = maxRaw != null && Number.isFinite(maxRaw) ? maxRaw : mean
  return {
    count,
    mean,
    min,
    max,
    meanPercent: Math.round(mean * 100),
  }
}

export function parseObservationConfidenceAggregatePayload(
  v: unknown,
): ObservationConfidenceAggregatePayload | null {
  if (!v || typeof v !== 'object') return null
  const o = v as Record<string, unknown>
  const count = typeof o.count === 'number' && Number.isFinite(o.count) && o.count > 0 ? Math.floor(o.count) : null
  if (count === null) return null
  const mean = typeof o.mean === 'number' && Number.isFinite(o.mean) ? o.mean : null
  const min = typeof o.min === 'number' && Number.isFinite(o.min) ? o.min : null
  const max = typeof o.max === 'number' && Number.isFinite(o.max) ? o.max : null
  const meanPercent =
    typeof o.meanPercent === 'number' && Number.isFinite(o.meanPercent) ? Math.round(o.meanPercent) : null
  if (mean === null || min === null || max === null || meanPercent === null) return null
  return { count, mean, min, max, meanPercent }
}

/** Ligne courte sous la tuile « Confiance » (fiche pays). */
export function formatObservationConfidenceSidebarFr(
  a: ObservationConfidenceAggregatePayload,
): string {
  const lo = Math.round(a.min * 100)
  const hi = Math.round(a.max * 100)
  const n = a.count
  const obs = n > 1 ? 'observations' : 'observation'
  return `Pipeline (${n} ${obs}) : ${a.meanPercent}% moy. · plage ${lo}–${hi}%`
}

/** Phrase pour la vue imprimable. */
export function formatObservationConfidencePrintFr(a: ObservationConfidenceAggregatePayload): string {
  const lo = Math.round(a.min * 100)
  const hi = Math.round(a.max * 100)
  const n = a.count
  const obs = n > 1 ? 'observations' : 'observation'
  return `Confiance moyenne (pipeline, ${n} ${obs}) : ${a.meanPercent}% — min–max ${lo}–${hi}%.`
}
