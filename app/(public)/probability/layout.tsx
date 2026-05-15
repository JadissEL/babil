import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Probabilités',
  description:
    'Estimation et comparaison des chances par destination à partir de votre profil : visa, objectifs et signaux de friction.',
}

export default function ProbabilityLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl">{children}</div>
}
