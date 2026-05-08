import type { IntelligenceSourceTier } from '@prisma/client'

/** Lower = higher trust for resolution precedence. */
export function tierRank(tier: IntelligenceSourceTier): number {
  switch (tier) {
    case 'TIER_A_OFFICIAL':
      return 0
    case 'TIER_B_MULTILATERAL':
      return 1
    case 'TIER_C_CURATED':
      return 2
    default:
      return 9
  }
}

export type ObservationForMerge = {
  fieldPath: string
  valueJson: string
  confidence: number
  observedAt: Date
  tier: IntelligenceSourceTier
}

/**
 * Sort key: trusted tier first, then freshest observation, then higher confidence.
 * Returns negative if `a` should be ordered before `b` (i.e. `a` wins over `b`).
 */
export function compareObservationPrecedence(a: ObservationForMerge, b: ObservationForMerge): number {
  const tr = tierRank(a.tier) - tierRank(b.tier)
  if (tr !== 0) return tr
  const time = b.observedAt.getTime() - a.observedAt.getTime()
  if (time !== 0) return time
  if (a.confidence !== b.confidence) return b.confidence - a.confidence
  return a.fieldPath.localeCompare(b.fieldPath)
}

/** For each fieldPath, keep the winning observation’s JSON string (first after sort). */
export function pickWinningValueJsonByPath(observations: ObservationForMerge[]): Map<string, string> {
  const sorted = [...observations].sort(compareObservationPrecedence)
  const winners = new Map<string, string>()
  for (const o of sorted) {
    if (!winners.has(o.fieldPath)) winners.set(o.fieldPath, o.valueJson)
  }
  return winners
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

/** Sets `obj.a.b = value` creating plain objects along the path. Mutates `obj`. */
export function setDeep(obj: Record<string, unknown>, path: string, value: unknown): void {
  const segments = path.split('.').filter(Boolean)
  if (segments.length === 0) return
  let cur: Record<string, unknown> = obj
  for (let i = 0; i < segments.length - 1; i++) {
    const k = segments[i]
    const next = cur[k]
    if (!isPlainObject(next)) {
      const fresh: Record<string, unknown> = {}
      cur[k] = fresh
      cur = fresh
    } else {
      cur = next
    }
  }
  cur[segments[segments.length - 1]] = value as unknown
}

/** Build nested object from dotted paths; parses each winning value as JSON. */
export function nestedObjectFromWinners(winners: Map<string, string>): Record<string, unknown> {
  const root: Record<string, unknown> = {}
  winners.forEach((json, path) => {
    try {
      const value = JSON.parse(json) as unknown
      setDeep(root, path, value)
    } catch {
      setDeep(root, path, json)
    }
  })
  return root
}
