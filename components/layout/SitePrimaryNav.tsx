'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider';
import { ctaCompareHref, ctaExploreHref } from '@/lib/cta-hrefs';
import { isExplorerNavHrefInPerspective } from '@/lib/user-objectives/perspective-nav';
import { getObjectiveBySlug } from '@/lib/user-objectives/registry';
import { cn } from '@/lib/utils';

function pathMatchesExplorer(path: string, explorerHref: string) {
  const p = path.split('?')[0] ?? '';
  const h = explorerHref.split('?')[0] ?? '';
  return p === h || p.startsWith(`${h}/`);
}

function pathMatchesCompare(path: string, compareHref: string) {
  const p = path.split('?')[0] ?? '';
  const h = compareHref.split('?')[0] ?? '';
  return p === h || p.startsWith(`${h}/`);
}

function isActivePath(pathname: string, href: string, explorerHref: string, compareHref: string) {
  if (href === explorerHref) return pathMatchesExplorer(pathname, explorerHref);
  if (href === compareHref) return pathMatchesCompare(pathname, compareHref);
  const p = pathname.split('?')[0] ?? '';
  const h = href.split('?')[0] ?? '';
  return p === h || p.startsWith(`${h}/`);
}

const STATIC_LINKS: { href: string; label: string }[] = [
  { href: '/schengen', label: 'Schengen' },
  { href: '/recommendations', label: 'Moteur visa' },
  { href: '/recommendation-engine', label: 'Labo reco' },
  { href: '/services/delegated-applications', label: 'Assist' },
  { href: '/education', label: 'Éducation' },
  { href: '/community', label: 'Communauté' },
  { href: '/business', label: 'Business' },
  { href: '/permis', label: 'Permis' },
  { href: '/investment', label: 'Investissement' },
];

export function SiteHeaderMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-text transition-colors hover:border-primary/35 hover:bg-primary-soft hover:text-primary lg:hidden"
      aria-label="Ouvrir le menu de navigation"
      onClick={onClick}
    >
      <Menu className="h-5 w-5" aria-hidden />
    </button>
  );
}

type SitePrimaryNavColumnProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export function SitePrimaryNavColumn({ mobileOpen, onMobileClose }: SitePrimaryNavColumnProps) {
  const pathname = usePathname() ?? '';
  const { preference } = useObjectivePreference();
  const explorerHref = useMemo(() => ctaExploreHref(preference.primarySlug), [preference.primarySlug]);
  const compareHref = useMemo(() => ctaCompareHref(preference.primarySlug), [preference.primarySlug]);
  const primaryDef = useMemo(
    () => getObjectiveBySlug(preference.primarySlug),
    [preference.primarySlug],
  );

  const links = useMemo(() => {
    const staticFiltered = STATIC_LINKS.filter((link) =>
      isExplorerNavHrefInPerspective(link.href, primaryDef),
    );
    return [
      { href: explorerHref, label: 'Explorer' },
      { href: '/schengen', label: 'Schengen' },
      { href: compareHref, label: 'Comparer' },
      ...staticFiltered.slice(1),
    ];
  }, [compareHref, explorerHref, primaryDef]);

  const closeIfNavigated = useCallback(() => {
    onMobileClose();
  }, [onMobileClose]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [mobileOpen]);

  const navBody = (
    <nav className="flex flex-col gap-0.5 px-2 py-3" aria-label="Navigation principale">
      {links.map(({ href, label }) => {
        const active = isActivePath(pathname, href, explorerHref, compareHref);
        return (
          <Link
            key={`${label}-${href}`}
            href={href}
            onClick={closeIfNavigated}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-xl px-3 py-2.5 text-sm font-black tracking-tight text-text transition-colors',
              active
                ? 'bg-primary-soft text-primary ring-1 ring-primary/25'
                : 'text-muted hover:bg-primary-soft/70 hover:text-primary',
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <button
        type="button"
        aria-hidden={!mobileOpen}
        className={cn(
          'fixed inset-0 z-[55] bg-text/40 backdrop-blur-[1px] transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onMobileClose}
      />
      <aside
        id="site-primary-nav"
        className={cn(
          'z-[56] flex flex-col border-line bg-[#fdf8ef]/95 shadow-[4px_0_24px_rgba(20,26,36,0.08)] backdrop-blur-sm transition-transform duration-200 ease-out',
          'fixed inset-y-0 left-0 w-[min(19rem,88vw)] border-r lg:sticky lg:top-16 lg:z-0 lg:h-[calc(100dvh-4rem)] lg:w-56 lg:max-w-none lg:translate-x-0 lg:self-start lg:shadow-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        aria-hidden={false}
      >
        <div className="flex items-center justify-between border-b border-line/80 px-3 py-3 lg:hidden">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted">Menu</span>
          <button
            type="button"
            className="rounded-xl border border-line bg-surface p-2 text-muted transition-colors hover:bg-primary-soft hover:text-primary"
            aria-label="Fermer le menu"
            onClick={onMobileClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain lg:pt-2">{navBody}</div>
      </aside>
    </>
  );
}

/** État menu mobile partagé avec le header (bouton menu). */
export function useSitePrimaryNavState() {
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return { mobileOpen, setMobileOpen, closeMobile: () => setMobileOpen(false) };
}
