import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Formations techniques',
  description:
    'Accès aux formations techniques par pays : exigences bac, coût et indicateurs agrégés pour citoyens marocains.',
}

export default function TechnicalTrainingLayout({ children }: { children: ReactNode }) {
  return children
}
