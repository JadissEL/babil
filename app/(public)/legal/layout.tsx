import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Mentions Légales & Confidentialité — VisaFlow',
  description:
    'Mentions légales, politique de confidentialité, gestion des cookies et conditions générales d’utilisation de VisaFlow Intelligence.',
};

export default function LegalLayout({ children }: { children: ReactNode }) {
  return children;
}
