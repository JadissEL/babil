/**
 * Profil de démonstration stable pour visiteurs non connectés (SEO / découverte).
 * Les routes POST recommendation & probability ignorent tout profil client lorsque `auth().userId` est absent
 * et utilisent exclusivement cet objet — évite l’injection et garde un rendu cohérent.
 */
export const PUBLIC_READ_ONLY_DEMO_PROFILE = {
  age: 30,
  marital_status: 'single',
  profession: 'salaried',
  income: 12000,
  savings: 80000,
  CNSS_status: true,
  family_in_europe: false,
  family_details: '',
  goal_type: 'tourism',
} as const

export type PublicReadOnlyDemoProfile = typeof PUBLIC_READ_ONLY_DEMO_PROFILE
