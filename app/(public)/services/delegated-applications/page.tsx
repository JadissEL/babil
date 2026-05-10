import { DelegatedServiceCatalog } from '@/components/services/DelegatedServiceCatalog'
import type { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'Assist candidatures — emploi & universités | VisaFlow',
  description:
    'Déléguez vos candidatures : optimisation CV, lettres de motivation et dépôts. Forfaits progressifs avec garantie 50 % remboursés si absence de résultats éligibles.',
}

export default function DelegatedApplicationsServicePage() {
  return <DelegatedServiceCatalog />
}
