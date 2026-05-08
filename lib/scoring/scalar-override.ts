const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v))

/**
 * When the DB scalar (1–10) is only a few points away from the model, trust the model
 * (avoids “flat 7.5” seed values flattening differentiation). When an editor or agent
 * sets a clearly different scalar, blend toward it.
 */
export function mergeModelWithDbScalar01to100(
  model100: number,
  scalar01to10: unknown,
  /** Min gap on 0–100 scale before we blend in the scalar */
  gapThreshold = 12,
): number {
  const s = Number(scalar01to10)
  if (!Number.isFinite(s)) return clamp(model100)
  const s100 = clamp(s * 10)
  if (Math.abs(s100 - model100) < gapThreshold) return clamp(model100)
  return clamp(model100 * 0.5 + s100 * 0.5)
}
