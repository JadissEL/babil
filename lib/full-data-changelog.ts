/**
 * B.28 — Journal léger des écritures sur `full_data` (qui / quoi / quand).
 * Stocké en base sous `_data_changelog` ; **retiré** des payloads API publiques (voir `materializePublicFullDataForApi`).
 */

export const FULL_DATA_CHANGELOG_KEY = '_data_changelog' as const

export const DEFAULT_MAX_FULL_DATA_CHANGELOG_ENTRIES = 50

export type FullDataChangelogActor = 'admin' | 'agent' | 'pipeline' | 'system'

export type FullDataChangelogEntry = {
  at: string
  actor: FullDataChangelogActor
  /** Sémantique stable pour filtrage (ex. admin.patch, enrichment.upsert). */
  action: string
  detail?: string
  /** Identifiant opaque côté serveur (ex. Clerk user id) — jamais exposé via API publique. */
  subjectId?: string
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function coerceEntry(raw: unknown): FullDataChangelogEntry | null {
  if (!isRecord(raw)) return null
  const at = raw.at
  const actor = raw.actor
  const action = raw.action
  if (typeof at !== 'string' || typeof action !== 'string') return null
  if (
    actor !== 'admin' &&
    actor !== 'agent' &&
    actor !== 'pipeline' &&
    actor !== 'system'
  ) {
    return null
  }
  const detail = typeof raw.detail === 'string' ? raw.detail : undefined
  const subjectId = typeof raw.subjectId === 'string' ? raw.subjectId : undefined
  return { at, actor, action, detail, subjectId }
}

/**
 * Prépend une entrée et tronque la liste (FIFO par tête).
 */
export function appendFullDataChangelog(
  full: Record<string, unknown>,
  entry: Omit<FullDataChangelogEntry, 'at'> & { at?: string },
  opts?: { maxEntries?: number },
): Record<string, unknown> {
  const at = entry.at ?? new Date().toISOString()
  const max = opts?.maxEntries ?? DEFAULT_MAX_FULL_DATA_CHANGELOG_ENTRIES
  const prev = full[FULL_DATA_CHANGELOG_KEY]
  const list: FullDataChangelogEntry[] = []
  if (Array.isArray(prev)) {
    for (const item of prev) {
      const c = coerceEntry(item)
      if (c) list.push(c)
    }
  }
  const nextEntry: FullDataChangelogEntry = {
    at,
    actor: entry.actor,
    action: entry.action,
    ...(entry.detail !== undefined ? { detail: entry.detail } : {}),
    ...(entry.subjectId !== undefined ? { subjectId: entry.subjectId } : {}),
  }
  const merged = [nextEntry, ...list].slice(0, max)
  return { ...full, [FULL_DATA_CHANGELOG_KEY]: merged }
}

/** Retire le journal avant envoi au client (API / pages publiques). */
export function stripFullDataChangelog(full: Record<string, unknown>): Record<string, unknown> {
  if (!(FULL_DATA_CHANGELOG_KEY in full)) return full
  const { [FULL_DATA_CHANGELOG_KEY]: _removed, ...rest } = full
  return rest
}
