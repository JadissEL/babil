import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getAdminUser } from '@/lib/admin-auth';

export const metadata: Metadata = {
  title: 'Waypoint — Global country search system sheet',
  description:
    "Fiche technique Stitch de la palette de recherche pays VisaFlow : déclencheurs header desktop/mobile, command palette ouverte, overlay mobile et états système.",
  robots: { index: false, follow: false },
};

export default async function WaypointLayout({ children }: { children: ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) redirect('/');
  return children;
}
