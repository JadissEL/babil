/**
 * Parsed `full_data` plus friction coalescence — **no Prisma**, safe for client bundles.
 * Prefer `augmentCountryDetailPayload` / `buildMergedCountriesList` on the server when possible;
 * use `materializePublicFullData` everywhere `full_data` is consumed so nested-only friction
 * scores still resolve.
 */

import { parseCountryFullData } from '@/lib/country-full-data-json'

function frictionTopLevelWeak(v: unknown): boolean {
  if (v === undefined || v === null) return true
  if (typeof v === 'number') return Number.isNaN(v)
  return false
}

/** Promote `friction_analysis.friction_score` to top-level `friction_score` when missing. */
export function normalizeFullDataFriction(full: Record<string, unknown>): Record<string, unknown> {
  if (!frictionTopLevelWeak(full.friction_score)) return full
  const fa = full.friction_analysis
  if (!fa || typeof fa !== 'object' || Array.isArray(fa)) return full
  const nested = (fa as Record<string, unknown>).friction_score
  if (typeof nested !== 'number' || !Number.isFinite(nested)) return full
  return { ...full, friction_score: nested }
}

/**
 * Parse stored `full_data` (JSON string or plain object) and normalize fields used across UI/API.
 */
export function materializePublicFullData(raw: unknown): Record<string, unknown> {
  return normalizeFullDataFriction(parseCountryFullData(raw))
}
