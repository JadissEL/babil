/**
 * C.50 — Limite la taille persistée de `CountryObservation.rawPayload` (JSON API brut).
 * Au-delà du plafond, on enregistre un objet de remplacement explicite (pas de troncature silencieuse).
 */

export const OBSERVATION_RAW_PAYLOAD_MAX_BYTES = 14_000

export function capObservationRawPayloadJson(input: string | null | undefined): string | null {
  if (input == null || input === '') return null
  const bytes = new TextEncoder().encode(input).length
  if (bytes <= OBSERVATION_RAW_PAYLOAD_MAX_BYTES) return input
  return JSON.stringify({
    _truncated: true,
    originalBytes: bytes,
    maxBytes: OBSERVATION_RAW_PAYLOAD_MAX_BYTES,
    note: 'rawPayload exceeded cap; store external blob if full trace is required.',
  })
}
