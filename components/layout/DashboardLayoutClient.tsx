'use client'

import { UserButton } from '@clerk/nextjs'
import { Bell, Download, Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { getDashboardNavTitle } from '@/components/layout/dashboard-nav-config'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { ObjectiveDockInline } from '@/components/layout/SiteObjectiveDock'
import { GlobalCountrySearch } from '@/components/nav/GlobalCountrySearch'
import {
  isNexusReadingWidthPath,
  NEXUS_BORDER,
  NEXUS_FOCUS_VISIBLE,
  NEXUS_READING_INNER_CLASS,
  NEXUS_TOOLBAR_H_CLASS,
  NEXUS_TOOLBAR_ICON_W_CLASS,
  NEXUS_TRANSITION,
  NEXUS_TRANSITION_UNDERLINE,
  NEXUS_TW,
} from '@/lib/nexus-chrome'
import { appToast } from '@/lib/toast-store'
import { cn } from '@/lib/utils'

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
        'group relative rounded-md px-2 py-1.5 text-[13px] motion-reduce:transition-none',
        NEXUS_TRANSITION,
        NEXUS_FOCUS_VISIBLE,
        active ? cn('font-semibold', NEXUS_TW.ink) : cn('font-medium', NEXUS_TW.ink65, 'hover:text-[#0D1B3E]'),
      )}
    >
      <span className="relative z-10">{children}</span>
      <span
        className={cn(
          'pointer-events-none absolute bottom-0 left-2 right-2 h-0.5 origin-left rounded-full',
          NEXUS_TRANSITION_UNDERLINE,
          active
            ? cn('scale-x-100', NEXUS_TW.underlineActive)
            : cn('scale-x-0', NEXUS_TW.underlineMuted, 'group-hover:scale-x-100'),
        )}
        aria-hidden
      />
    </Link>
  )
}

function DashboardTopBar({
  pathname,
  onMenuOpen,
  title,
  menuOpen,
}: {
  pathname: string
  onMenuOpen: () => void
  title: string
  menuOpen: boolean
}) {
  const onExplorerActive = pathname === '/explorer' || pathname.startsWith('/explorer/')
  const onCommunityActive = pathname === '/community'

  return (
    <header
      className={cn(
        'relative sticky top-0 z-40 shrink-0 border-b before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-px',
        NEXUS_TW.headerBg,
        NEXUS_TW.headerHairline,
      )}
      style={{ borderColor: NEXUS_BORDER }}
    >
      <div className="flex min-h-14 w-full flex-wrap items-center gap-x-2 gap-y-2 px-4 py-2 sm:px-6 lg:flex-nowrap lg:items-center lg:gap-6 lg:py-2.5">
        {/* Left: menu + eyebrow / serif title */}
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:max-w-[min(38vw,22rem)] lg:flex-none">
          <button
            type="button"
            onClick={onMenuOpen}
            className={cn(
              NEXUS_TOOLBAR_H_CLASS,
              NEXUS_TOOLBAR_ICON_W_CLASS,
              NEXUS_TRANSITION,
              NEXUS_FOCUS_VISIBLE,
              'inline-flex shrink-0 items-center justify-center rounded-lg border',
              NEXUS_TW.ink65,
              NEXUS_TW.hoverSurface,
              NEXUS_TW.ink,
            )}
            style={{ borderColor: NEXUS_BORDER }}
            aria-expanded={menuOpen}
            aria-controls="dashboard-workspace-nav"
            aria-haspopup="dialog"
            aria-label="Ouvrir le menu Mobility Intel (workspace)"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <span
              className={cn(
                'mb-0.5 hidden font-mono text-[9px] font-black uppercase tracking-[0.26em] lg:block',
                NEXUS_TW.ink45,
              )}
            >
              Espace connecté
            </span>
            <h1 className={cn('truncate font-serif text-sm font-semibold sm:text-base', NEXUS_TW.ink)}>
              {title}
            </h1>
          </div>
        </div>

        {/* Center: secondary nav (desktop) */}
        <nav
          aria-label="Navigation secondaire"
          className="order-3 hidden w-full justify-center gap-4 lg:order-none lg:flex lg:w-auto lg:flex-1 lg:px-2"
        >
          <TopNavLink href="/explorer" active={onExplorerActive}>
            Tendances mondiales
          </TopNavLink>
          <TopNavLink href="/community" active={onCommunityActive}>
            Mises à jour de politique
          </TopNavLink>
        </nav>

        {/* Right: single utility cluster */}
        <div className="order-2 flex max-w-full flex-wrap items-center justify-end gap-2 sm:ml-auto lg:order-none lg:ml-0 lg:max-w-none lg:flex-nowrap lg:shrink-0">
          <ObjectiveDockInline
            toolbarRhythm
            className={cn(
              'hidden min-w-0 max-w-none bg-white/90 lg:flex lg:max-w-[13.5rem]',
              NEXUS_TW.borderStrong,
            )}
          />
          <GlobalCountrySearch toolbar />
          <Link
            href="/profile"
            className={cn(
              NEXUS_TOOLBAR_H_CLASS,
              NEXUS_TRANSITION,
              NEXUS_FOCUS_VISIBLE,
              'hidden items-center gap-1.5 rounded-lg border bg-white/90 px-3 text-[11px] font-medium sm:inline-flex',
              NEXUS_TW.ink85,
              NEXUS_TW.hoverSurface,
            )}
            style={{ borderColor: NEXUS_BORDER }}
          >
            <Download className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Export Data
          </Link>
          <button
            type="button"
            onClick={() => appToast.info('Aucune notification pour l’instant.')}
            className={cn(
              NEXUS_TOOLBAR_H_CLASS,
              NEXUS_TOOLBAR_ICON_W_CLASS,
              NEXUS_TRANSITION,
              NEXUS_FOCUS_VISIBLE,
              'inline-flex shrink-0 items-center justify-center rounded-lg border',
              NEXUS_TW.ink65,
              NEXUS_TW.hoverSurface,
              NEXUS_TW.ink,
            )}
            style={{ borderColor: NEXUS_BORDER }}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'h-10 w-10 rounded-lg',
              },
            }}
          />
        </div>
      </div>
    </header>
  )
}

export default function DashboardLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/'
  const [workspaceNavOpen, setWorkspaceNavOpen] = useState(false)
  const title = getDashboardNavTitle(pathname)
  const readingWidth = isNexusReadingWidthPath(pathname)

  useEffect(() => {
    setWorkspaceNavOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!workspaceNavOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setWorkspaceNavOpen(false)
    }
    window.addEventListener('keydown', onKey)

    const html = document.documentElement
    const body = document.body
    const prevHtml = html.style.overflow
    const prevBody = body.style.overflow

    const mq = window.matchMedia('(max-width: 1023px)')
    const applyScrollLock = () => {
      if (mq.matches) {
        html.style.overflow = 'hidden'
        body.style.overflow = 'hidden'
      } else {
        html.style.overflow = prevHtml
        body.style.overflow = prevBody
      }
    }
    applyScrollLock()
    mq.addEventListener('change', applyScrollLock)

    return () => {
      window.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', applyScrollLock)
      html.style.overflow = prevHtml
      body.style.overflow = prevBody
    }
  }, [workspaceNavOpen])

  return (
    <div className={cn('flex min-h-screen', NEXUS_TW.pageBg)}>
      <DashboardSidebar open={workspaceNavOpen} onClose={() => setWorkspaceNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopBar
          pathname={pathname}
          onMenuOpen={() => setWorkspaceNavOpen(true)}
          title={title}
          menuOpen={workspaceNavOpen}
        />
        <main id="dashboard-content" className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <div className={cn(readingWidth && NEXUS_READING_INNER_CLASS)}>{children}</div>
        </main>
      </div>
    </div>
  )
}
