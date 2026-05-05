import { Suspense } from 'react'
import type { Metadata } from 'next'

import DelegatedApplicationApplyClient from './DelegatedApplicationApplyClient'

export const metadata: Metadata = {
  title: 'Demande Assist candidatures | VisaFlow',
  description: 'Formulaire connecté pour activer votre forfait emploi ou université avec garantie résultats.',
}

function ApplyFallback() {
  return (
    <div className="flex justify-center py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

export default function DelegatedApplicationApplyPage() {
  return (
    <Suspense fallback={<ApplyFallback />}>
      <DelegatedApplicationApplyClient />
    </Suspense>
  )
}
