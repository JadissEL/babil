import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getAdminUser } from '@/lib/admin-auth';

export const metadata: Metadata = {
  title: 'Runway — Post-signup onboarding checklist sheet',
  description:
    "Fiche technique Stitch de la checklist Premiers pas sur VisaFlow : implémentation, états 0/3, 2/3 et masqué.",
  robots: { index: false, follow: false },
};

export default async function RunwayLayout({ children }: { children: ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) redirect('/');
  return children;
}
