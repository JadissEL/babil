'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { AppToaster } from '@/components/AppToaster';
import { CookieConsentBanner } from '@/components/cookies/CookieConsentBanner';
import { NexusShellGate } from '@/components/layout/NexusShellGate';
import { SiteFooter, SiteHeader } from '@/components/layout/SiteHeader';
import { SitePrimaryNavColumn, useSitePrimaryNavState } from '@/components/layout/SitePrimaryNav';
import { isAuthPath, isNexusPath, isPublicMarketingPath } from '@/lib/nexus-shell-routes';

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen, closeMobile } = useSitePrimaryNavState();

  if (isAuthPath(pathname)) {
    return (
      <div className="flex min-h-screen flex-1 flex-col">
        <AppToaster />
        {children}
      </div>
    );
  }

  if (isNexusPath(pathname)) {
    return (
      <div className="flex min-h-screen flex-1 flex-col bg-[#FAF7EE]">
        <AppToaster />
        <NexusShellGate>{children}</NexusShellGate>
        <CookieConsentBanner />
      </div>
    );
  }

  if (!isPublicMarketingPath(pathname)) {
    return (
      <div className="flex min-h-screen flex-1 flex-col">
        <AppToaster />
        {children}
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
