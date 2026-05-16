import { Suspense } from 'react';
import { ConsultantProfileBookingClient } from '@/components/consultants/ConsultantProfileBookingClient';
import type { Metadata } from 'next';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Expert ${slug} — réservation | VisaFlow`,
    description: 'Profil consultant, créneaux disponibles et paiement sécurisé.',
  };
}

export default async function ConsultantProfilePage({ params }: Params) {
  const { slug } = await params;
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<p className="text-sm text-[#0D1B3E]/60">Chargement…</p>}>
        <ConsultantProfileBookingClient slug={slug} />
      </Suspense>
    </div>
  );
}
