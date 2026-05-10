/**
 * Last-line validation before `Country.full_data` JSON persist from the agent runner (H.97).
 */

export function agentFullDataJsonMaxBytes(): number {
  const raw = process.env.AGENT_FULL_DATA_JSON_MAX_BYTES;
  if (raw === undefined || raw === '') return 12_000_000;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 64) return 12_000_000;
  return Math.min(32 * 1024 * 1024, n);
}

export type PersistGuardResult = { ok: true } | { ok: false; reason: string };

/**
 * Ensures payload is JSON-serializable, within size budget, and core agent surfaces keep expected kinds.
 */
export function validateAgentFullDataForPersist(
  fullData: Record<string, unknown>,
): PersistGuardResult {
  let json: string;
  try {
    json = JSON.stringify(fullData);
  } catch {
    return { ok: false, reason: 'full_data_not_json_serializable' };
  }

  const maxBytes = agentFullDataJsonMaxBytes();
  const bytes = Buffer.byteLength(json, 'utf8');
  if (bytes > maxBytes) {
    return {
      ok: false,
      reason: `full_data_json_too_large:${bytes}>${maxBytes}`,
    };
  }

  const agent = fullData._agent;
  if (
    agent !== undefined &&
    agent !== null &&
    (typeof agent !== 'object' || Array.isArray(agent))
  ) {
    return { ok: false, reason: '_agent_must_be_object' };
  }

  const tr = fullData.travel_reasons;
  if (tr !== undefined && !Array.isArray(tr)) {
    return { ok: false, reason: 'travel_reasons_must_be_array' };
  }

  const tq = fullData.traveler_quotes;
  if (tq !== undefined && !Array.isArray(tq)) {
    return { ok: false, reason: 'traveler_quotes_must_be_array' };
  }

  return { ok: true };
}
