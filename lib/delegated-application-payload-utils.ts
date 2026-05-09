/** Extrait infos d’affichage sans rejouer toute la validation métier */
export type DelegatedPayloadPreview = {
  packageName?: string
  priceMad?: number
  contactEmail?: string
}

export function previewDelegatedPayload(payloadJson: string): DelegatedPayloadPreview {
  try {
    const raw = JSON.parse(payloadJson) as Record<string, unknown>
    const snap =
      raw.packageSnapshot &&
      typeof raw.packageSnapshot === 'object' &&
      !Array.isArray(raw.packageSnapshot)
        ? (raw.packageSnapshot as Record<string, unknown>)
        : undefined
    const contact =
      raw.contact && typeof raw.contact === 'object' && !Array.isArray(raw.contact)
        ? (raw.contact as Record<string, unknown>)
        : undefined
    const name = typeof snap?.name === 'string' ? snap.name : undefined
    const priceMad = typeof snap?.priceMad === 'number' ? snap.priceMad : undefined
    const contactEmail = typeof contact?.email === 'string' ? contact.email : undefined
    return { packageName: name, priceMad, contactEmail }
  } catch {
    return {}
  }
}

// --- B.36 — Masquage partiel (UI admin, journaux, partage d’écran) ---

/** Aperçu minimal pour logs / événements (aucune chaîne utilisateur brute). */
export function delegatedRequestLogContext(request: {
  id: number
  category: string
  packageId: string
  userId?: string
}): Record<string, unknown> {
  return {
    delegatedRequestId: request.id,
    category: request.category,
    packageId: request.packageId,
    ...(request.userId ? { userId: request.userId } : {}),
  }
}

export function maskEmailForAdminList(email: string): string {
  const t = email.trim()
  const at = t.indexOf('@')
  if (at <= 0 || at === t.length - 1) return '***'
  const local = t.slice(0, at)
  const domain = t.slice(at + 1)
  const head = local.slice(0, 1) || '*'
  return `${head}***@${domain}`
}

export function maskPhoneForAdmin(phone: string): string {
  const d = phone.replace(/\s+/g, '')
  if (d.length < 4) return '****'
  return `****${d.slice(-2)}`
}

export function maskPersonNameForAdmin(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '***'
  return parts.map((p) => (p.length ? `${p[0]!}***` : '***')).join(' ')
}

function isPreservedPackageSnapshotField(path: readonly string[], key: string): boolean {
  return path[path.length - 1] === 'packageSnapshot' && ['id', 'name', 'priceMad', 'tierLabel'].includes(key)
}

type LeafRedact = 'email' | 'phone' | 'personName' | 'identity' | 'freeform'

function redactModeForKey(key: string, path: readonly string[]): LeafRedact | null {
  if (isPreservedPackageSnapshotField(path, key)) return null
  const k = key.toLowerCase()
  if (k === 'email' || k.endsWith('email')) return 'email'
  if (k.includes('phone') || k.includes('mobile') || k === 'tel' || k === 'telephone') return 'phone'
  if (
    ['fullname', 'firstname', 'lastname', 'first_name', 'last_name', 'nom', 'prenom'].includes(k)
  ) {
    return 'personName'
  }
  if (
    /passport|nationalid|national_id|cin|iban|ssn|bankaccount|bank_account|cardnumber|card_number|cvv/i.test(
      key,
    )
  ) {
    return 'identity'
  }
  if (/(^notes$|^motivation|^coverletter|^cover_letter|^details$|^additional|^comment|^message|^story|^bio$|^address|^street|^adresse|^linkedin)/i.test(k)) {
    return 'freeform'
  }
  return null
}

function applyLeafRedact(mode: LeafRedact, value: string): string {
  switch (mode) {
    case 'email':
      return maskEmailForAdminList(value)
    case 'phone':
      return maskPhoneForAdmin(value)
    case 'personName':
      return maskPersonNameForAdmin(value)
    case 'identity':
      return '****'
    case 'freeform':
      return value.trim() ? '[contenu masqué]' : value
    default:
      return value
  }
}

/**
 * Copie profonde du JSON demande déléguée avec champs sensibles masqués (affichage admin par défaut).
 */
export function redactDelegatedPayloadDeep(value: unknown, path: string[] = []): unknown {
  if (value === null || value === undefined) return value
  if (typeof value === 'string') {
    const key = path[path.length - 1] ?? ''
    const parentPath = path.slice(0, -1)
    const mode = redactModeForKey(key, parentPath)
    return mode ? applyLeafRedact(mode, value) : value
  }
  if (Array.isArray(value)) {
    return value.map((item, i) => redactDelegatedPayloadDeep(item, [...path, String(i)]))
  }
  if (typeof value === 'object') {
    const o = value as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(o)) {
      if (isPreservedPackageSnapshotField(path, k)) {
        out[k] = v
        continue
      }
      const childPath = [...path, k]
      if (v === null || v === undefined) {
        out[k] = v
        continue
      }
      if (typeof v === 'string') {
        const mode = redactModeForKey(k, path)
        out[k] = mode ? applyLeafRedact(mode, v) : v
        continue
      }
      out[k] = redactDelegatedPayloadDeep(v, childPath)
    }
    return out
  }
  return value
}

export function redactDelegatedPayloadJsonString(payloadJson: string): string {
  try {
    const parsed = JSON.parse(payloadJson) as unknown
    return JSON.stringify(redactDelegatedPayloadDeep(parsed), null, 2)
  } catch {
    return '{"_redactionError":true}'
  }
}
