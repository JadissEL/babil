import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Permis de conduire à l’étranger',
  description:
    'Intelligence structurée pour titulaires du permis marocain : éligibilité, IDP, durées par statut de résidence, conversion, assurance, location et comparaison entre pays — VisaFlow.',
}

export default function PermisLayout({ children }: { children: ReactNode }) {
  return children
}
