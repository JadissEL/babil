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
