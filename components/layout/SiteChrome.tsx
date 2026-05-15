'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { AppToaster } from '@/components/AppToaster';
import { CookieConsentBanner } from '@/components/cookies/CookieConsentBanner';
import { SiteFooter, SiteHeader } from '@/components/layout/SiteHeader';
import { SitePrimaryNavColumn, useSitePrimaryNavState } from '@/components/layout/SitePrimaryNav';

const STANDALONE_PATH_PREFIXES = [
  '/sign-in',
  '/sign-up',
  '/overview',
  '/history',
  '/profile',
  '/admin',
  '/design-system',
  '/moderation',
];

/**
 * Routes exactes qui fournissent leur **propre chrome marketing complet** (header + footer)
 * et n'attendent du `SiteChrome` que les utilitaires runtime transverses
 * (AppToaster, CookieConsentBanner). L’objectif principal est dans {@link MeridianHomeHeader}.
 *
 * PAGE 01 (MERIDIAN) — `/` rend son propre `MeridianHomeHeader` / `MeridianHomeFooter`
 * et n'a pas besoin du rail latéral `SitePrimaryNavColumn`.
 */
const MERIDIAN_HOME_PATHS = ['/'];

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen, closeMobile } = useSitePrimaryNavState();

  const isStandalone = STANDALONE_PATH_PREFIXES.some((prefix) =>
    pathname?.startsWith(prefix),
  );

  const isMeridianHome = pathname != null && MERIDIAN_HOME_PATHS.includes(pathname);

  if (isStandalone) {
    return (
      <div className="flex min-h-screen flex-1 flex-col">
        <AppToaster />
        {children}
      </div>
    );
  }

  if (isMeridianHome) {
    /**
     * Shell home : pas de SiteHeader / SitePrimaryNavColumn / SiteFooter globaux —
     * `HomeExperience` rend son propre chrome MERIDIAN (header + main + footer).
     * On garde toutes les utilités runtime (toasts, consent cookies). L’objectif est dans le header MERIDIAN.
     */
    return (
      <div className="flex min-h-screen flex-1 flex-col bg-[#FDF8EF]">
        <AppToaster />
        {children}
        <CookieConsentBanner />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[60] focus-visible:rounded-lg focus-visible:bg-[#0D1B3E] focus-visible:px-4 focus-visible:py-2 focus-visible:text-xs focus-visible:font-black focus-visible:uppercase focus-visible:tracking-[0.22em] focus-visible:text-white focus-visible:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3E]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7EE]"
      >
        Aller au contenu
      </a>
      <SiteHeader onPrimaryNavOpen={() => setMobileOpen(true)} />
      <AppToaster />
      <div className="flex min-h-0 min-w-0 flex-1">
        <SitePrimaryNavColumn mobileOpen={mobileOpen} onMobileClose={closeMobile} />
        <main
          id="main-content"
          tabIndex={-1}
          className="min-w-0 flex-1 px-4 py-5 pb-8 focus:outline-none sm:px-6 lg:px-8 lg:py-6"
        >
          {children}
        </main>
      </div>
      <SiteFooter />
      <CookieConsentBanner />
    </div>
  );
}
