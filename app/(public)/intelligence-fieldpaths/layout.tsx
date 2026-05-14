import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Glossaire des Données — VisaFlow',
  description:
    'Signification des chemins logiques (fieldPath) utilisés par le pipeline intelligence et la provenance des données pays.',
}

export default function IntelligenceFieldPathsLayout({ children }: { children: ReactNode }) {
  return children
}
