import type { Metadata } from 'next'

import OverviewPageClient from './OverviewPageClient'

export const metadata: Metadata = {
  title: 'Tableau de bord',
  description:
    "Hub connecté VisaFlow : accès rapide au moteur de probabilité, comparaison de pays, recommandations et outils d'exploration.",
}

export default function OverviewPage() {
  return <OverviewPageClient />
}
