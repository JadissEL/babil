'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider';
import { ctaCompareHref, ctaExploreHref } from '@/lib/cta-hrefs';
import type { ComponentProps } from 'react';

export type ObjectiveAwareExplorerLinkProps = Omit<ComponentProps<typeof Link>, 'href'>;
export type ObjectiveAwareCompareLinkProps = Omit<ComponentProps<typeof Link>, 'href'>;

/** Explorer avec `?goal=` (ou `/explorer`) selon l’objectif principal stocké / local. */
export function ObjectiveAwareExplorerLink(props: ObjectiveAwareExplorerLinkProps) {
  const { preference } = useObjectivePreference();
  const href = useMemo(() => ctaExploreHref(preference.primarySlug), [preference.primarySlug]);
  return <Link href={href} {...props} />;
}

/** Comparer avec `?objective=` aligné sur le slug d’objectif. */
export function ObjectiveAwareCompareLink(props: ObjectiveAwareCompareLinkProps) {
  const { preference } = useObjectivePreference();
  const href = useMemo(() => ctaCompareHref(preference.primarySlug), [preference.primarySlug]);
  return <Link href={href} {...props} />;
}
