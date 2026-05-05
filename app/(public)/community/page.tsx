import Link from 'next/link'
import { Globe, MessageSquare, Sparkles } from 'lucide-react'

import PageContainer from '@/components/layout/PageContainer'

export const metadata = {
  title: 'Communauté | VisaFlow',
  description: 'Partagez vos retours d’expérience et explorez les avis publiés sur les fiches pays.',
}

export default function CommunityPage() {
  return (
    <PageContainer className="py-12">
      <section className="rounded-2xl border border-white/10 bg-[#111827] p-8 md:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-300">
          <MessageSquare className="h-3.5 w-3.5 text-violet-400" /> Communauté
        </div>
        <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-white md:text-4xl">
          Retours terrain & discussion par destination
        </h1>
        <p className="mt-4 max-w-2xl text-sm font-medium text-slate-400 md:text-base">
          VisaFlow agrège les signaux officiels avec des données structurées. Les{' '}
          <strong className="text-slate-200">commentaires publiés</strong> sur chaque fiche pays permettent de
          compléter le tableau avec du vécu réel (modération humaine après connexion).
        </p>

        <ul className="mt-8 space-y-4 text-sm font-medium text-slate-300">
          <li className="flex gap-3 rounded-xl border border-white/10 bg-[#0B0F19] p-4">
            <Globe className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" aria-hidden />
            <span>
              Ouvrez un pays depuis l&apos;{' '}
              <Link href="/explorer" className="font-black text-blue-400 hover:text-blue-300">
                Explorer
              </Link>{' '}
              puis faites défiler jusqu&apos;à la section commentaires lorsque vous êtes connecté.
            </span>
          </li>
          <li className="flex gap-3 rounded-xl border border-white/10 bg-[#0B0F19] p-4">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden />
            <span>
              Les admins peuvent modérer via le{' '}
              <Link href="/moderation" className="font-black text-blue-400 hover:text-blue-300">
                tableau de modération
              </Link>{' '}
              (accès après connexion).
            </span>
          </li>
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/explorer"
            className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-500"
          >
            Parcourir les pays
          </Link>
          <Link
            href="/recommendations"
            className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-100 hover:bg-white/10"
          >
            Recommandations personnalisées
          </Link>
        </div>
      </section>
    </PageContainer>
  )
}
