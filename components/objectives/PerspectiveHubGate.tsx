'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider';
import { ctaCompareHref, ctaExploreHref } from '@/lib/cta-hrefs';
import {
  hubGateForPath,
  perspectiveContractFromDefinition,
  type PerspectiveHubGateInfo,
} from '@/lib/user-objectives/perspective-contract';

export function PerspectiveHubGatePanel({ info }: { info: PerspectiveHubGateInfo }) {
  const { preference } = useObjectivePreference();
  const exploreHref = useMemo(
    () => ctaExploreHref(preference.primarySlug),
    [preference.primarySlug],
  );
  const compareHref = useMemo(
    () => ctaCompareHref(preference.primarySlug),
    [preference.primarySlug],
  );

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-[#0D1B3E]/12 bg-white p-8 shadow-lg">
      <p className="text-[10px] font-black uppercase tracking-widest text-[#0D1B3E]/55">
        Hors parcours · {info.hubLabel}
      </p>
      <h2 className="mt-3 text-xl font-black text-[#0D1B3E]">Contenu non aligné sur votre intérêt</h2>
      <p className="mt-3 text-sm font-medium leading-relaxed text-[#0D1B3E]/75">{info.message}</p>
      <p className="mt-4 text-sm text-[#0D1B3E]/65">
        Vous gardez l’accès à tout le site ; seuls les modules en phase avec{' '}
        <strong>{info.primaryLabel}</strong> sont présentés en détail ici.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={exploreHref}
          className="inline-flex items-center justify-center rounded-xl bg-[#0D1B3E] px-5 py-2.5 text-sm font-bold text-white"
        >
          Explorer mon parcours
        </Link>
        <Link
          href={compareHref}
          className="inline-flex items-center justify-center rounded-xl border border-[#0D1B3E]/20 bg-white px-5 py-2.5 text-sm font-bold text-[#0D1B3E]"
        >
          Comparer des pays
        </Link>
      </div>
      <p className="mt-6 text-xs text-[#0D1B3E]/55">
        Pour parcourir « {info.hubLabel} », changez d’objectif principal via le menu en bas de
        l’écran.
      </p>
    </div>
  );
}

export function PerspectiveHubPageGate({
  hubPath,
  children,
}: {
  hubPath: string;
  children: React.ReactNode;
}) {
  const { ready, primaryDefinition } = useObjectivePreference();
  const contract = useMemo(
    () => perspectiveContractFromDefinition(primaryDefinition),
    [primaryDefinition],
  );
  const gate = useMemo(() => {
    if (!ready || !contract) return null;
    return hubGateForPath(hubPath, contract);
  }, [ready, contract, hubPath]);

  if (gate) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 py-16">
        <PerspectiveHubGatePanel info={gate} />
      </div>
    );
  }

  return <>{children}</>;
}
