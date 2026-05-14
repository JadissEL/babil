import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Atelier — Formations techniques & métiers',
  description:
    'Analyse pragmatique des filières professionnalisantes : voies d’accès, requis académiques et opportunités d’intégration sur les marchés de l’emploi internationaux.',
}

export default function TechnicalTrainingLayout({ children }: { children: ReactNode }) {
  return children
}
