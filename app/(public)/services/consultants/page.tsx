import { Suspense } from 'react';
import ConsultantsMarketplaceClient from '@/components/consultants/ConsultantsMarketplaceClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Experts mobilité — réserver une séance | VisaFlow',
  description:
    'Consultants spécialisés études, travail et business : filtres, agenda, séances 30 ou 60 minutes, paiement sécurisé.',
};

function MarketplaceFallback() {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="font-serif text-sm text-[#0D1B3E]/55">Chargement du catalogue…</p>
    </div>
  );
}

export default function ConsultantsMarketplacePage() {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<MarketplaceFallback />}>
        <ConsultantsMarketplaceClient />
      </Suspense>
    </div>
  );
}
