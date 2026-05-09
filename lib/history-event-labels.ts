/** Libellés FR pour les types d’événements connus (le code API reste inchangé). */
const TYPE_FR: Record<string, string> = {
  VIEW_COUNTRY: 'Consultation fiche pays',
}

export function historyEventTypeLabelFr(type: string | undefined | null): string {
  const t = String(type ?? '').trim()
  if (!t) return '—'
  return TYPE_FR[t] ?? t
}
