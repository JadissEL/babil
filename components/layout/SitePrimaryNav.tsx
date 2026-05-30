'use client';

import { useUser } from '@clerk/nextjs';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider';
import { showConsultantMarketplaceNav } from '@/lib/consultant-nav';
import { compareHrefForGuest, ctaCompareHref, ctaExploreHref, signInRedirectHref } from '@/lib/cta-hrefs';
import { navContextStraplineForSlug } from '@/lib/nav-context-copy';
import {
  SITE_BACKDROP_TRANSITION,
  SITE_FOCUS_VISIBLE,
  SITE_FOCUS_VISIBLE_SOFT,
  SITE_INTERACTION_TRANSITION,
  SITE_RAIL_TRANSITION,
} from '@/lib/site-chrome-tokens';
import {
  isNavHrefActionable,
  perspectiveContractFromDefinition,
} from '@/lib/user-objectives/perspective-contract';
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

type NavLinkItem = {
  href: string;
  label: string;
  actionable: boolean;
  title?: string;
  guestAccountBadge?: boolean;
};

type NavSection = {
  title: string;
  items: NavLinkItem[];
};

export function SiteHeaderMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-text hover:border-primary/35 hover:bg-primary-soft hover:text-primary lg:hidden',
        SITE_INTERACTION_TRANSITION,
        SITE_FOCUS_VISIBLE_SOFT,
      )}
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
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const isGuest = userLoaded && !isSignedIn;
  const { preference } = useObjectivePreference();
  const explorerHref = useMemo(() => ctaExploreHref(preference.primarySlug), [preference.primarySlug]);
  const compareProductHref = useMemo(
    () => ctaCompareHref(preference.primarySlug),
    [preference.primarySlug],
  );
  const compareNavHref = useMemo(
    () => compareHrefForGuest(isGuest, preference.primarySlug),
    [isGuest, preference.primarySlug],
  );
  const schengenNavHref = useMemo(
    () => (isGuest ? signInRedirectHref('/schengen') : '/schengen'),
    [isGuest],
  );
  const primaryDef = useMemo(
    () => getObjectiveBySlug(preference.primarySlug),
    [preference.primarySlug],
  );
  const contract = useMemo(
    () => perspectiveContractFromDefinition(primaryDef),
    [primaryDef],
  );
  const contextStrapline = useMemo(
    () => navContextStraplineForSlug(preference.primarySlug),
    [preference.primarySlug],
  );

  const sections = useMemo((): NavSection[] => {
    const showExperts = showConsultantMarketplaceNav(primaryDef);
    const decider: NavLinkItem[] = [
      { href: explorerHref, label: 'Explorer', actionable: true },
      {
        href: compareNavHref,
        label: 'Comparer',
        actionable: true,
        title: isGuest ? 'Connexion requise pour comparer' : undefined,
        guestAccountBadge: isGuest,
      },
      {
        href: schengenNavHref,
        label: 'Schengen',
        actionable: isNavHrefActionable('/schengen', contract),
        title: isGuest ? 'Connexion requise pour le hub Schengen' : undefined,
        guestAccountBadge: isGuest,
      },
    ];
    const tools: NavLinkItem[] = [
      {
        href: '/probability',
        label: 'Probabilités',
        actionable: isNavHrefActionable('/probability', contract),
      },
      {
        href: '/recommendation-engine',
        label: 'Recommandations',
        actionable: isNavHrefActionable('/recommendation-engine', contract),
      },
    ];
    const services: NavLinkItem[] = [
      {
        href: '/services/delegated-applications',
        label: 'Assist',
        actionable: isNavHrefActionable('/services/delegated-applications', contract),
      },
    ];
    if (showExperts) {
      services.push({
        href: '/services/consultants',
        label: 'Experts',
        actionable: isNavHrefActionable('/services/consultants', contract),
      });
    }
    const community: NavLinkItem[] = [
      {
        href: '/community',
        label: 'Communauté',
        actionable: isNavHrefActionable('/community', contract),
      },
      {
        href: '/education',
        label: 'Éducation',
        actionable: isNavHrefActionable('/education', contract),
      },
      {
        href: '/business',
        label: 'Business',
        actionable: isNavHrefActionable('/business', contract),
      },
      {
        href: '/permis',
        label: 'Permis',
        actionable: isNavHrefActionable('/permis', contract),
      },
      {
        href: '/investment',
        label: 'Investissement',
        actionable: isNavHrefActionable('/investment', contract),
      },
    ];
    return [
      { title: 'Décider', items: decider },
      { title: 'Outils', items: tools },
      { title: 'Services', items: services },
      { title: 'Communauté & hubs', items: community },
    ];
  }, [compareNavHref, contract, explorerHref, isGuest, primaryDef, schengenNavHref]);

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
    <nav className="flex flex-col gap-4 px-2 py-3" aria-label="Navigation principale">
      {contextStrapline ? (
        <p className="hidden px-2 text-[10px] font-medium leading-snug text-muted lg:block">
          {contextStrapline}
        </p>
      ) : null}
      {sections.map((section) => (
        <div key={section.title}>
          <p className="px-2 pb-1 text-[9px] font-black uppercase tracking-[0.2em] text-muted/80">
            {section.title}
          </p>
          <div className="flex flex-col gap-0.5">
            {section.items.map(({ href, label, actionable, title, guestAccountBadge }) => {
              const active = isActivePath(pathname, href, explorerHref, compareProductHref);
              return (
                <Link
                  key={`${section.title}-${label}-${href}`}
                  href={href}
                  title={title}
                  onClick={closeIfNavigated}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-black tracking-tight text-text',
                    SITE_INTERACTION_TRANSITION,
                    SITE_FOCUS_VISIBLE,
                    active
                      ? 'bg-primary-soft text-primary ring-1 ring-primary/25'
                      : actionable
                        ? 'text-muted hover:bg-primary-soft/70 hover:text-primary'
                        : 'text-muted/70 hover:bg-primary-soft/40 hover:text-primary/80',
                  )}
                >
                  <span>{label}</span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {guestAccountBadge ? (
                      <span className="rounded-md border border-amber-200/90 bg-amber-50 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-amber-900">
                        Compte
                      </span>
                    ) : null}
                    {!actionable ? (
                      <span className="text-[9px] font-black uppercase tracking-wider text-muted/80">
                        Hors objectif
                      </span>
                    ) : null}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <button
        type="button"
        aria-hidden={!mobileOpen}
        className={cn(
          'fixed inset-0 z-[55] bg-text/40 backdrop-blur-[1px] lg:hidden',
          SITE_BACKDROP_TRANSITION,
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onMobileClose}
      />
      <aside
        id="site-primary-nav"
        className={cn(
          'z-[56] flex flex-col border-line bg-[#fdf8ef]/95 shadow-[4px_0_24px_rgba(20,26,36,0.08)] backdrop-blur-sm',
          SITE_RAIL_TRANSITION,
          'fixed inset-y-0 left-0 w-[min(19rem,88vw)] border-r lg:sticky lg:top-16 lg:z-0 lg:h-[calc(100dvh-4rem)] lg:w-56 lg:max-w-none lg:translate-x-0 lg:self-start lg:shadow-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        aria-hidden={false}
      >
        <div className="flex items-center justify-between border-b border-line/80 px-3 py-3 lg:hidden">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted">Menu</span>
          <button
            type="button"
            className={cn(
              'rounded-xl border border-line bg-surface p-2 text-muted hover:bg-primary-soft hover:text-primary',
              SITE_INTERACTION_TRANSITION,
              SITE_FOCUS_VISIBLE_SOFT,
            )}
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
