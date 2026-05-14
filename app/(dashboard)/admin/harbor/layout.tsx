import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getAdminUser } from '@/lib/admin-auth';

export const metadata: Metadata = {
  title: 'Harbor — Site chrome reference (header & footer)',
  description:
    "Fiche technique Stitch du chrome marketing : SiteHeader (Signed Out / Signed In) et SiteFooter avec clearance dock objectif.",
  robots: { index: false, follow: false },
};

export default async function HarborLayout({ children }: { children: ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) redirect('/');
  return children;
}
