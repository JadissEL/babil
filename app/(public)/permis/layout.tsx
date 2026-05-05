import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Permis de conduire à l’étranger',
  description:
    'Validité du permis marocain, durées, conversions et restrictions par pays — repères issus des fiches pays VisaFlow.',
}

export default function PermisLayout({ children }: { children: ReactNode }) {
  return children
}
