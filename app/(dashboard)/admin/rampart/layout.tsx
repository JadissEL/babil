import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Rampart — Edge Auth Firewall',
  description:
    'Tableau de bord interne du middleware Clerk : table des routes protégées, pipeline request-id, flags environnement et stream de logs.',
  robots: { index: false, follow: false },
};

export default function RampartLayout({ children }: { children: ReactNode }) {
  return children;
}
