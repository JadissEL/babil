import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Espace Schengen',
  description:
    'Vue Schengen pour profils marocains : pays membres, filtres et indicateurs visa / friction agrégés dans VisaFlow.',
}

export default function SchengenLayout({ children }: { children: ReactNode }) {
  return children
}
