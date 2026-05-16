import Link from 'next/link';
import { NEXUS_FOCUS_VISIBLE, NEXUS_TRANSITION } from '@/lib/nexus-chrome';
import { cn } from '@/lib/utils';

export default function AvertissementPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-black tracking-tight text-[#0D1B3E]">
        Avertissement — information et non-conseil juridique
      </h1>
      <p className="mt-4 font-serif text-base font-medium leading-relaxed text-[#0D1B3E]/80">
        VisaFlow rassemble des <strong>repères</strong> pour les personnes qui préparent un
        déplacement, des études ou une installation <strong>depuis le Maroc</strong> (passeport
        marocain ou résidence au Maroc, selon les fiches). Ce contenu est une{' '}
        <strong>aide à la lecture</strong> : il ne remplace pas une consultation d’avocat, ni une
        décision des autorités consulaires, ni les conditions publiées sur les portails officiels
        (État hôte, TLScontact, VFS Global, etc.).
      </p>
      <h2 className="mt-10 font-serif text-xl font-black text-[#0D1B3E]">Fraîcheur des données</h2>
      <p className="mt-3 font-serif text-base font-medium leading-relaxed text-[#0D1B3E]/80">
        Les règles de visa et les délais changent souvent. Chaque fiche peut indiquer une{' '}
        <strong>dernière passe agent</strong> ou des dates de matérialisation pour certains blocs
        statistiques. Rapprochez-vous toujours de la <strong>version la plus récente</strong> du
        site officiel compétent avant de payer des frais ou de voyager.
      </p>
      <h2 className="mt-10 font-serif text-xl font-black text-[#0D1B3E]">Scores et barres</h2>
      <p className="mt-3 font-serif text-base font-medium leading-relaxed text-[#0D1B3E]/80">
        Les scores (visa, friction, etc.) sont des <strong>comparatifs internes VisaFlow</strong>{' '}
        sur des échelles affichées dans l’interface. Ils ne préjugent pas d’une acceptation ou d’un
        refus de dossier pour un cas individuel.
      </p>
      <h2 className="mt-10 font-serif text-xl font-black text-[#0D1B3E]">
        Représentations marocaines à l’étranger
      </h2>
      <p className="mt-3 font-serif text-base font-medium leading-relaxed text-[#0D1B3E]/80">
        Pour les démarches liées à l’état civil, la légalisation ou le soutien aux Marocains à
        l’étranger, orientez-vous vers les{' '}
        <strong>sites officiels du Ministère marocain des Affaires étrangères</strong> et les
        représentations compétentes ; cette application ne les remplace pas.
      </p>
      <p className="mt-10">
        <Link
          href="/explorer"
          className={cn(
            'font-black text-[#0D1B3E] underline underline-offset-2',
            NEXUS_TRANSITION,
            NEXUS_FOCUS_VISIBLE,
          )}
        >
          Retour à l’explorateur
        </Link>
      </p>
    </div>
  );
}
