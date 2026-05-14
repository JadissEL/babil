import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getAdminUser } from '@/lib/admin-auth';

export const metadata: Metadata = {
  title: 'Azimuth — Mobility Objective System',
  description:
    "Fiche technique Stitch des trois états du système d'objectif global VisaFlow : wizard premier passage, dock fermé, listbox étendue.",
  robots: { index: false, follow: false },
};

export default async function AzimuthLayout({ children }: { children: ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) redirect('/');
  return children;
}
