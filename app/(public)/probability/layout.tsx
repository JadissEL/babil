import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Probabilités',
  description:
    'Estimation et comparaison des chances par destination à partir de votre profil : visa, objectifs et signaux de friction.',
}

export default function ProbabilityLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-10 lg:px-8">{children}</div>
}
