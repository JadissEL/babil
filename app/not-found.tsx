import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page introuvable',
  description: 'La page demandée n’existe pas ou a été déplacée sur VisaFlow.',
}

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-muted">Erreur 404</p>
      <h1 className="mt-3 text-2xl font-black text-text">Page introuvable</h1>
      <p className="mt-2 text-sm text-muted">
        Vérifiez l’URL ou revenez à l’accueil pour continuer votre exploration.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-primary-hover"
      >
        Retour à l’accueil
      </Link>
    </div>
  )
}
