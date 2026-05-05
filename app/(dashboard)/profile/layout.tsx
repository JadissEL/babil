import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Profil',
  description:
    'Objectifs, budget, situation familiale et préférences : renseignez votre profil pour affiner probabilités et recommandations.',
}

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return children
}
