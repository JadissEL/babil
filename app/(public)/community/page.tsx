import { Globe, MessageSquare, Sparkles } from 'lucide-react'
import Link from 'next/link'
import PageContainer from '@/components/layout/PageContainer'

export const metadata = {
  title: 'Communauté | VisaFlow',
  description: 'Partagez vos retours d’expérience et explorez les avis publiés sur les fiches pays.',
}

export default function CommunityPage() {
  return (
    <PageContainer className="py-12">
      <section className="rounded-2xl border border-line bg-surface p-8 md:p-10 shadow-card">
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-[#f8f2e8] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted">
          <MessageSquare className="h-3.5 w-3.5 text-primary" /> Communauté
        </div>
        <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-text md:text-4xl">
          Retours terrain & discussion par destination
        </h1>
        <p className="mt-4 max-w-2xl text-sm font-medium text-muted md:text-base">
          VisaFlow agrège les signaux officiels avec des données structurées. Les{' '}
          <strong className="text-text">commentaires publiés</strong> sur chaque fiche pays permettent de
          compléter le tableau avec du vécu réel (modération humaine après connexion).
        </p>

        <ul className="mt-8 space-y-4 text-sm font-medium text-muted">
          <li className="flex gap-3 rounded-xl border border-line bg-[#f8f2e8] p-4">
            <Globe className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <span>
              Ouvrez un pays depuis l&apos;{' '}
              <Link href="/explorer" className="font-black text-primary hover:text-primary-hover">
                Explorer
              </Link>{' '}
              puis faites défiler jusqu&apos;à la section commentaires lorsque vous êtes connecté.
            </span>
          </li>
          <li className="flex gap-3 rounded-xl border border-line bg-[#f8f2e8] p-4">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
            <span>
              Les admins peuvent modérer via le{' '}
              <Link href="/moderation" className="font-black text-primary hover:text-primary-hover">
                tableau de modération
              </Link>{' '}
              (accès après connexion).
            </span>
          </li>
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/explorer"
            className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-primary-hover"
          >
            Parcourir les pays
          </Link>
          <Link
            href="/recommendations"
            className="inline-flex items-center rounded-xl border border-line bg-[#f8f2e8] px-5 py-3 text-xs font-black uppercase tracking-widest text-text hover:bg-primary-soft"
          >
            Recommandations personnalisées
          </Link>
        </div>
      </section>
    </PageContainer>
  )
}
