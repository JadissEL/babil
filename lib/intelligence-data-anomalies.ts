/**
 * B.32 — Heuristiques légères de qualité sur indicateurs économie (full_data)
 * et sauts forts entre deux observations pipeline (`CountryObservation`).
 */

export type DataQualityAnomaly = {
  code: string
  messageFr: string
}

function readFiniteNumber(v: unknown): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null
  return v
}

/**
 * Analyse le bloc `full_data.economy` déjà matérialisé (World Bank, etc.).
 */
export function analyzeEconomyIndicatorsAnomalies(
  economy: Record<string, unknown> | undefined,
): DataQualityAnomaly[] {
  const out: DataQualityAnomaly[] = []
  if (!economy || typeof economy !== 'object') return out
  if (economy.gdp_wb_series_unavailable === true) return out

  const pop = readFiniteNumber(economy.population_wb)
  const gdp = readFiniteNumber(economy.gdp_usd)
  const cap = readFiniteNumber(economy.gdp_per_capita_usd)

  if (pop != null && pop > 0 && pop < 5_000) {
    out.push({
      code: 'economy_tiny_population_wb',
      messageFr:
        'Population World Bank très faible (< 5 000 habitants) — vérifier micro-État, erreur de série ou unité.',
    })
  }

  if (pop != null && pop >= 10_000 && gdp != null && gdp > 0 && cap != null && cap > 0) {
    const implied = gdp / pop
    const denom = Math.max(implied, cap, 1)
    const relErr = Math.abs(implied - cap) / denom
    if (relErr > 0.35) {
      out.push({
        code: 'economy_gdp_pop_capita_mismatch',
        messageFr:
          'Écart notable entre PIB/habitant déclaré et PIB ÷ population (World Bank) — contrôler cohérence des trois séries.',
      })
    }
  }

  if (cap != null && (cap < 250 || cap > 220_000)) {
    out.push({
      code: 'economy_extreme_gdp_per_capita_wb',
      messageFr:
        'PIB par habitant hors plage large usuelle — possible outlier, devise ou année de référence à vérifier.',
    })
  }

  if (gdp != null && gdp > 0 && gdp < 5_000_000 && pop != null && pop > 500_000) {
    out.push({
      code: 'economy_very_low_gdp_for_population',
      messageFr:
        'PIB nominal très faible pour une population déclarée importante — vérifier unité (USD courants) ou qualité de la série.',
    })
  }

  return out
}

export function parseDataQualityAnomaliesPayload(v: unknown): DataQualityAnomaly[] {
  if (!Array.isArray(v)) return []
  const out: DataQualityAnomaly[] = []
  for (const item of v) {
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const code = typeof o.code === 'string' && o.code.trim() ? o.code.trim() : null
    const messageFr =
      typeof o.messageFr === 'string' && o.messageFr.trim() ? o.messageFr.trim() : null
    if (code && messageFr) out.push({ code, messageFr })
  }
  return out
}

/** Ratio min entre deux valeurs strictement positives pour déclarer un saut. */
const DEFAULT_JUMP_RATIO = 2.4

function numericFromObservation(row: {
  valueNumeric: number | null
  valueJson: string
}): number | null {
  if (row.valueNumeric != null && Number.isFinite(row.valueNumeric)) return row.valueNumeric
  try {
    const j = JSON.parse(row.valueJson) as { value?: number }
    if (typeof j.value === 'number' && Number.isFinite(j.value)) return j.value
  } catch {
    /* ignore */
  }
  return null
}

export function detectSharpNumericJump(
  newer: number,
  older: number,
  ratioThreshold = DEFAULT_JUMP_RATIO,
): boolean {
  if (!Number.isFinite(newer) || !Number.isFinite(older) || older <= 0 || newer <= 0) return false
  const r = newer >= older ? newer / older : older / newer
  return r >= ratioThreshold
}

/**
 * Compare les deux observations les plus récentes pour un `fieldPath`.
 * Retourne une anomalie si saut multiplicatif ≥ `ratioThreshold`.
 */
export function observationPairToJumpAnomaly(
  fieldPath: string,
  labelFr: string,
  rows: { valueNumeric: number | null; valueJson: string }[],
  ratioThreshold = DEFAULT_JUMP_RATIO,
): DataQualityAnomaly | null {
  if (rows.length < 2) return null
  const a = numericFromObservation(rows[0]!)
  const b = numericFromObservation(rows[1]!)
  if (a == null || b == null) return null
  if (!detectSharpNumericJump(a, b, ratioThreshold)) return null
  const code = `observation_jump_${fieldPath.replace(/\./g, '_')}`
  return {
    code,
    messageFr: `Variation forte entre deux collectes pipeline sur « ${labelFr} » — vérifier source ou révision de série.`,
  }
}
