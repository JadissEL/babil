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
      <SiteHeader onPrimaryNavOpen={() => setMobileOpen(true)} />
      <AppToaster />
      <div className="flex min-h-0 min-w-0 flex-1">
        <SitePrimaryNavColumn mobileOpen={mobileOpen} onMobileClose={closeMobile} />
        <main className="min-w-0 flex-1 px-4 py-5 pb-[calc(var(--vf-objective-dock-height,5.5rem)+1rem)] sm:px-6 lg:px-8 lg:py-6">
          {children}
        </main>
      </div>
      <SiteObjectiveDock />
      <SiteFooter />
    </div>
  );
}
