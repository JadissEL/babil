/**
 * Libellés FR pour les niveaux de score renvoyés en anglais par les APIs (reco, probabilité).
 */
/** Formes masculines — alignées probabilité / « niveau » / affichages courts. */
const EN_TO_FR: Record<string, string> = {
  'Very High': 'Très élevé',
  High: 'Élevé',
  Medium: 'Moyen',
  Low: 'Faible',
  'Very Low': 'Très faible',
}

export function englishScoreLevelToFr(level: string | undefined | null): string | undefined {
  if (level == null || level === '') return undefined
  return EN_TO_FR[level] ?? level
}
