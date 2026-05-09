import type { Metadata } from 'next'

import RecommendationEnginePage from '@/components/recommendation/RecommendationEnginePage'

export const metadata: Metadata = {
  title: 'Moteur de recommandation',
  description:
    'Paramétrez un profil synthétique, lancez le scoring déterministe, visualisez le radar des piliers et le classement des destinations.',
}

export default function Page() {
  return <RecommendationEnginePage />
}
