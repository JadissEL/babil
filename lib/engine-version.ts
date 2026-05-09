/**
 * Version sémantique des moteurs exposés en API (audits, régressions, docs).
 * Incrémenter lors d’un changement de formules ou de contrat de réponse.
 */
export const BABIL_ENGINE_VERSION = '2026.02.0'

export type BabilEngineKind = 'recommendation' | 'probability'

export function engineVersionHeaders(kind: BabilEngineKind): Record<string, string> {
  return {
    'X-Babil-Engine-Version': BABIL_ENGINE_VERSION,
    'X-Babil-Engine-Kind': kind,
  }
}
