import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Sprint — Formations courtes & Bootcamps',
  description:
    'Upskilling rapide à l’étranger : micro-certificats, sprints académiques et bootcamps pro de 2 semaines à 6 mois pour un ROI temps maximal.',
}

export default function ShortCoursesLayout({ children }: { children: ReactNode }) {
  return children
}
