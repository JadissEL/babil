import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getAdminUser } from '@/lib/admin-auth';

export const metadata: Metadata = {
  title: 'Quay — Primary navigation system sheet',
  description:
    "Fiche technique Stitch du rail de navigation principal VisaFlow : rail sticky desktop, header mobile fermé, drawer mobile ouvert.",
  robots: { index: false, follow: false },
};

export default async function QuayLayout({ children }: { children: ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) redirect('/');
  return children;
}
