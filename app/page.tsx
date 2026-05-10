import { HomeExperience } from '@/components/home/HomeExperience';
import { buildHomeHeroSlides } from '@/lib/home-hero-slides';
import { resolveHomeShowcaseCountries } from '@/lib/home-showcase-countries';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VisaFlow — Mobilité internationale pour profils marocains',
  description:
    'Explorez les destinations : scores visa, friction, études et business. Filtres par objectif, budget et risque — puis approfondissez chaque pays.',
};

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [topCountries, heroSlides] = await Promise.all([
    resolveHomeShowcaseCountries(),
    buildHomeHeroSlides(),
  ]);

  return <HomeExperience topCountries={topCountries} heroSlides={heroSlides} />;
}
