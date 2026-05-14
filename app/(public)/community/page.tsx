import { ArrowRight, Compass, MessageSquare, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { ObjectiveAwareExplorerLink } from '@/components/nav/ObjectiveAwareNavLinks'

export const metadata = {
  title: 'Communauté — Partagez l’expérience | VisaFlow',
  description:
    'La sagesse collective VisaFlow : échos modérés depuis les fiches pays, explorer par objectif et portail de modération éditoriale.',
}

type CommunityEcho = {
  destination: string
  quote: string
  authorInitial: string
  authorName: string
  authorBio: string
}

const COMMUNITY_ECHOES: ReadonlyArray<CommunityEcho> = [
  {
    destination: 'Espagne',
    quote:
      'Mon installation à Madrid a été simplifiée grâce aux retours de la communauté. Les conseils sur les délais réels du NIE m’ont évité des mois d’attente.',
    authorInitial: 'J',
    authorName: 'Julien D.',
    authorBio: 'Chercheur, 28 ans',
  },
  {
    destination: 'Japon',
    quote:
      'Le niveau de détail partagé ici sur le Certificate of Eligibility est exceptionnel. J’ai pu anticiper les demandes de documents supplémentaires sans stress.',
    authorInitial: 'C',
    authorName: 'Camille S.',
    authorBio: 'Architecte, 34 ans',
  },
  {
    destination: 'Canada',
    quote:
      'Trouver des informations fiables sur le bassin PVT était chaotique avant VisaFlow. Les récits structurés ici donnent une vraie perspective.',
    authorInitial: 'M',
    authorName: 'Marc L.',
    authorBio: 'Ingénieur, 31 ans',
  },
]

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF4]">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 sm:px-8">
        <section aria-labelledby="community-hero" className="mb-16 text-center">
          <p className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-[#0D1B3E]/15 bg-white px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/75">
            <MessageSquare className="h-3.5 w-3.5" aria-hidden /> Communauté
          </p>
          <h1
            id="community-hero"
            className="mx-auto max-w-2xl font-serif text-4xl font-black leading-[1.05] tracking-tight text-[#0D1B3E] sm:text-5xl md:text-[3.25rem]"
          >
            Partagez l&apos;expérience, maîtrisez le voyage.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-serif text-base font-medium leading-relaxed text-[#0D1B3E]/75 sm:text-[17px]">
            La sagesse collective est notre atout le plus précieux. Bien que les discussions soient
            regroupées de manière contextuelle sur les pages de chaque pays pour une pertinence
            maximale, cet espace vous offre une vue d&apos;ensemble de l&apos;écosystème
            communautaire de VisaFlow. Tous les échanges sont méticuleusement modérés pour garantir
            la sécurité, la clarté et l&apos;excellence.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <ObjectiveAwareExplorerLink className="inline-flex items-center gap-2 rounded-xl bg-[#0D1B3E] px-6 py-3 text-sm font-black text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md">
              Parcourir les pays
            </ObjectiveAwareExplorerLink>
            <Link
              href="/recommendations"
              className="inline-flex items-center gap-2 rounded-xl border border-[#0D1B3E]/25 bg-white px-6 py-3 text-sm font-black text-[#0D1B3E] transition-transform hover:-translate-y-0.5"
            >
              Recommandations personnalisées
            </Link>
          </div>
        </section>

        <section
          aria-label="Espaces de la communauté"
          className="mb-20 grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <article className="group rounded-2xl border border-[#0D1B3E]/10 bg-white p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-8">
            <div className="mb-6 flex items-start justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                Navigation
              </p>
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#0D1B3E]/12 text-[#0D1B3E]"
                aria-hidden
              >
                <Compass className="h-4 w-4" />
              </span>
            </div>
            <h2 className="font-serif text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">
              Explorer par objectif
            </h2>
            <p className="mt-4 font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/70 sm:text-[15px]">
              Accédez aux retours d&apos;expérience filtrés par statut (étudiant, travailleur
              qualifié, nomade numérique) et découvrez les trajectoires qui résonnent avec vos
              ambitions.
            </p>
            <ObjectiveAwareExplorerLink className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] transition-transform group-hover:translate-x-0.5">
              Ouvrir l&apos;explorateur <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </ObjectiveAwareExplorerLink>
          </article>

          <article className="group rounded-2xl border border-[#0D1B3E]/10 bg-white p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-8">
            <div className="mb-6 flex items-start justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                Administration
              </p>
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#0D1B3E]/12 text-[#0D1B3E]"
                aria-hidden
              >
                <ShieldAlert className="h-4 w-4" />
              </span>
            </div>
            <h2 className="font-serif text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">
              Portail de Modération
            </h2>
            <p className="mt-4 font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/70 sm:text-[15px]">
              Accès restreint. Gestion des signalements, vérification des témoignages et maintien
              des standards de qualité éditoriale du réseau VisaFlow.
            </p>
            <Link
              href="/moderation"
              className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] transition-transform group-hover:translate-x-0.5"
            >
              Ouvrir la modération <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </article>
        </section>

        <section aria-labelledby="community-echoes" className="mb-8">
          <h2
            id="community-echoes"
            className="mb-10 text-center font-serif text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl"
          >
            Échos de la communauté
          </h2>
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {COMMUNITY_ECHOES.map((echo) => (
              <li
                key={echo.destination + echo.authorName}
                className="flex flex-col rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm sm:p-7"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                  Destination : {echo.destination}
                </p>
                <blockquote className="mt-4 flex-1 font-serif text-[15px] font-medium italic leading-relaxed text-[#0D1B3E]">
                  &laquo;&nbsp;{echo.quote}&nbsp;&raquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-[#0D1B3E]/10 pt-5">
                  <span
                    aria-hidden
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#0D1B3E]/15 bg-[#FDFBF4] font-serif text-base font-black text-[#0D1B3E]"
                  >
                    {echo.authorInitial}
                  </span>
                  <div>
                    <p className="font-serif text-sm font-black text-[#0D1B3E]">
                      {echo.authorName}
                    </p>
                    <p className="font-serif text-xs font-medium text-[#0D1B3E]/65">
                      {echo.authorBio}
                    </p>
                  </div>
                </figcaption>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
