'use client';

import { useAuth } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import DashboardLayoutClient from '@/components/layout/DashboardLayoutClient';

function NexusShellSkeleton() {
  return (
    <div
      className="flex min-h-screen animate-pulse bg-[#FAF7EE] motion-reduce:animate-none"
      aria-busy="true"
      aria-label="Chargement de l'espace connecte"
    >
      <div className="hidden w-64 shrink-0 border-r border-[#0D1B3E]/10 bg-[#F5F0E3] lg:block" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-16 shrink-0 border-b border-[#0D1B3E]/10 bg-[#FAF7EE]/95" />
        <div className="flex-1 p-8">
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="h-8 w-48 rounded-lg bg-[#0D1B3E]/10" />
            <div className="h-32 rounded-2xl bg-[#0D1B3E]/[0.06]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function NexusShellGate({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname() ?? '/';
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || isSignedIn) return;
    const redirect = encodeURIComponent(pathname);
    router.replace(`/sign-in?redirect_url=${redirect}`);
  }, [isLoaded, isSignedIn, pathname, router]);

  if (!isLoaded) return <NexusShellSkeleton />;
  if (!isSignedIn) return <NexusShellSkeleton />;

  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
