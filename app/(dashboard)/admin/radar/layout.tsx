import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getAdminUser } from '@/lib/admin-auth';

export const metadata: Metadata = {
  title: 'Radar — Client Observability & Sentry-Clerk Sync',
  description:
    "Fiche technique Stitch de l'observabilité client VisaFlow : pipeline d'anonymisation Sentry, mapping contexte Clerk et trace technique de référence.",
  robots: { index: false, follow: false },
};

export default async function RadarLayout({ children }: { children: ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) redirect('/');
  return children;
}
