/**
 * Keeps Prisma `street_food_business_access` and optional top-level `full_data.street_food_business_access`
 * aligned with `full_data.street_food.opportunity` (same convention as seed).
 */

export function deriveStreetFoodBusinessAccessFromFullData(
  fullData: Record<string, unknown>,
): string | undefined {
  const top = fullData.street_food_business_access
  if (typeof top === 'string') {
    const t = top.trim()
    if (t) return t
  }
  const sf = fullData.street_food
  if (sf && typeof sf === 'object' && !Array.isArray(sf)) {
    const opp = (sf as Record<string, unknown>).opportunity
    if (typeof opp === 'string') {
      const o = opp.trim()
      if (o) return o
    }
  }
  return undefined
}

/** When top-level access string is missing, copy from `street_food.opportunity` for scoring paths that read the scalar. */
export function ensureStreetFoodBusinessAccessOnFullData(
  fullData: Record<string, unknown>,
): Record<string, unknown> {
  const top = fullData.street_food_business_access
  if (typeof top === 'string' && top.trim()) return fullData
  const derived = deriveStreetFoodBusinessAccessFromFullData(fullData)
  if (!derived) return fullData
  return { ...fullData, street_food_business_access: derived }
}
