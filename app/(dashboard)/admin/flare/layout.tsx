import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getAdminUser } from '@/lib/admin-auth';

export const metadata: Metadata = {
  title: 'Flare — 3 états',
  description:
    'Planche specimen Stitch FLARE : valider la forme, le ton et le clearance des toasts globaux (success / error / info) au-dessus du dock objectif.',
  robots: { index: false, follow: false },
};

export default async function FlareLayout({ children }: { children: ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) redirect('/');
  return children;
}
