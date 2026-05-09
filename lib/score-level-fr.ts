/**
 * Libellés FR pour les niveaux de score renvoyés en anglais par les APIs (reco, probabilité).
 */
const EN_TO_FR: Record<string, string> = {
  'Very High': 'Très élevée',
  High: 'Élevée',
  Medium: 'Moyenne',
  Low: 'Faible',
  'Very Low': 'Très faible',
}

export function englishScoreLevelToFr(level: string | undefined | null): string | undefined {
  if (level == null || level === '') return undefined
  return EN_TO_FR[level] ?? level
}
