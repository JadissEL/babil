import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Hub éducation & formation',
  description:
    'Campus VisaFlow : langues, parcours techniques, programmes courts et repères par pays (prérequis, coûts, visa).',
}

export default function EducationHubLayout({ children }: { children: ReactNode }) {
  return children
}
