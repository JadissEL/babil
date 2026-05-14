'use client'

import { UserButton } from '@clerk/nextjs'
import { Bell, Download, Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { getDashboardNavTitle } from '@/components/layout/dashboard-nav-config'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { appToast } from '@/lib/toast-store'
import { cn } from '@/lib/utils'

const INK_10 = 'rgba(13,27,62,0.10)'

function TopNavLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        'rounded-md px-2 py-1 text-[13px] transition-colors',
        active
          ? 'font-semibold text-[#0D1B3E]'
          : 'font-medium text-[#0D1B3E]/65 hover:text-[#0D1B3E]',
      )}
    >
      {children}
    </Link>
  )
}

function DashboardTopBar({
  pathname,
  onMenuOpen,
  title,
}: {
  pathname: string
  onMenuOpen: () => void
  title: string
}) {
  const onExplorerActive = pathname === '/explorer' || pathname.startsWith('/explorer/')
  const onCommunityActive = pathname === '/community'

  return (
    <header
      className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b bg-[#FAF7EE]/95 px-4 backdrop-blur-md sm:px-6"
      style={{ borderColor: INK_10 }}
    >
      <button
        type="button"
        onClick={onMenuOpen}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-[#0D1B3E]/65 transition-colors hover:bg-[#0D1B3E]/[0.04] hover:text-[#0D1B3E] lg:hidden"
        style={{ borderColor: INK_10 }}
        aria-expanded={false}
        aria-controls="dashboard-mobile-nav"
        aria-label="Ouvrir le menu de navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <span className="hidden font-mono text-[11px] font-black uppercase tracking-[0.28em] text-[#0D1B3E] lg:inline">
        Espace connecté
      </span>

      <h1 className="min-w-0 flex-1 truncate font-serif text-base font-semibold text-[#0D1B3E] lg:hidden">
        {title}
      </h1>

      <nav
        aria-label="Navigation secondaire"
        className="ml-8 hidden items-center gap-2 lg:flex"
      >
        <TopNavLink href="/explorer" active={onExplorerActive}>
          Tendances mondiales
        </TopNavLink>
        <TopNavLink href="/community" active={onCommunityActive}>
          Mises à jour de politique
        </TopNavLink>
      </nav>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Link
          href="/profile"
          className="hidden items-center gap-2 rounded-lg border bg-white px-3 py-2 text-[12px] font-semibold text-[#0D1B3E] transition-colors hover:bg-[#0D1B3E]/[0.04] sm:inline-flex"
          style={{ borderColor: INK_10 }}
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          Export Data
        </Link>
        <button
          type="button"
          onClick={() => appToast.info('Aucune notification pour l’instant.')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#0D1B3E]/65 transition-colors hover:bg-[#0D1B3E]/[0.06] hover:text-[#0D1B3E]"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: 'h-9 w-9',
            },
          }}
        />
      </div>
    </header>
  )
}

export default function DashboardLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/'
  const [mobileOpen, setMobileOpen] = useState(false)
  const title = getDashboardNavTitle(pathname)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const html = document.documentElement
    const prevHtml = html.style.overflow
    const prevBody = document.body.style.overflow
    html.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      html.style.overflow = prevHtml
      document.body.style.overflow = prevBody
    }
  }, [mobileOpen])

  return (
    <div className="flex min-h-screen bg-[#FAF7EE] text-[#0D1B3E]">
      <DashboardSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopBar
          pathname={pathname}
          onMenuOpen={() => setMobileOpen(true)}
          title={title}
        />
        <main id="dashboard-content" className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  )
}
