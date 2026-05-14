'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { AppToaster } from '@/components/AppToaster';
import { SiteFooter, SiteHeader } from '@/components/layout/SiteHeader';
import { SiteObjectiveDock } from '@/components/layout/SiteObjectiveDock';
import { SitePrimaryNavColumn, useSitePrimaryNavState } from '@/components/layout/SitePrimaryNav';

const STANDALONE_PATH_PREFIXES = ['/sign-in', '/sign-up'];

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen, closeMobile } = useSitePrimaryNavState();

  const isStandalone = STANDALONE_PATH_PREFIXES.some((prefix) =>
    pathname?.startsWith(prefix),
  );

  if (isStandalone) {
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
          className="min-w-0 flex-1 px-4 py-5 pb-[calc(var(--vf-objective-dock-height,5.5rem)+1rem)] focus:outline-none sm:px-6 lg:px-8 lg:py-6"
        >
          {children}
        </main>
      </div>
      <SiteObjectiveDock />
      <SiteFooter />
    </div>
  );
}
