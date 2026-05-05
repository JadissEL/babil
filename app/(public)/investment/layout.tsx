import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Investissement & résidence',
  description:
    'Vue d’ensemble par pays : barrières, capitaux et contexte pour les porteurs de projet marocains (données indicatives, à croiser avec des conseils juridiques).',
}

export default function InvestmentLayout({ children }: { children: ReactNode }) {
  return children
}
