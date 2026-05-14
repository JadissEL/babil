import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Voyage — Conduire à l’étranger : Droits et Formalités',
  description:
    'Intelligence mobilité pour votre permis marocain : matrice comparative des droits de conduite (IDP, validité, échange, délais) pour vos road trips internationaux — VisaFlow.',
}

export default function PermisLayout({ children }: { children: ReactNode }) {
  return children
}
