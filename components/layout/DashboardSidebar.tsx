'use client'

import { LifeBuoy, Plus, Settings, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  dashboardNav,
  explorerNav,
  filterNavItemsByRole,
  hrefDashboardActive,
  normalizeDashboardPath,
  type DashboardNavItem,
} from '@/components/layout/dashboard-nav-config'
import { ObjectiveDockInline } from '@/components/layout/SiteObjectiveDock'
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider'
import { ctaCompareHref, ctaExploreHref } from '@/lib/cta-hrefs'
import {
  NEXUS_BACKDROP_TRANSITION,
  NEXUS_BORDER,
  NEXUS_DRAWER_SURFACE_TRANSITION,
  NEXUS_FOCUS_VISIBLE,
  NEXUS_FOCUS_VISIBLE_ON_DARK,
  NEXUS_TRANSITION,
  NEXUS_TW,
} from '@/lib/nexus-chrome'
import { isExplorerNavHrefInPerspective } from '@/lib/user-objectives/perspective-nav'
import { getObjectiveBySlug } from '@/lib/user-objectives/registry'
import { cn } from '@/lib/utils'

function NavLinkRow({
  item,
  active,
  onNavigate,
}: {
  item: DashboardNavItem
  active: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px]',
        NEXUS_TRANSITION,
        NEXUS_FOCUS_VISIBLE,
        active
          ? cn('bg-white font-semibold', NEXUS_TW.ink, NEXUS_TW.navRowActiveShadow)
          : cn('font-medium', NEXUS_TW.ink65, 'hover:bg-white/60 hover:text-[#0D1B3E]'),
      )}
    >
      <item.icon
        className={cn('h-4 w-4 shrink-0', active ? NEXUS_TW.ink : NEXUS_TW.ink55)}
        aria-hidden
      />
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

function NavGroup({
  label,
  items,
  pathname,
  onNavigate,
}: {
  label: string
  items: DashboardNavItem[]
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <div className="space-y-2">
      <p className={cn('px-3 font-mono text-[10px] font-black uppercase tracking-[0.28em]', NEXUS_TW.ink45)}>
        {label}
      </p>
      <nav aria-label={label} className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLinkRow
            key={`${label}-${item.href}-${item.label}`}
            item={item}
            active={hrefDashboardActive(pathname, item)}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </div>
  )
}

function BrandBlock({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className={cn('block rounded-md', NEXUS_FOCUS_VISIBLE)}
      aria-label="Mobility Intel — retour à l'accueil"
    >
      <p className={cn('font-serif text-[22px] font-black leading-tight tracking-tight', NEXUS_TW.ink)}>
        Mobility
        <br />
        Intel
      </p>
      <p className={cn('mt-1 font-mono text-[10px] font-black uppercase tracking-[0.28em]', NEXUS_TW.ink55)}>
        Premium Access
      </p>
    </Link>
  )
}

function SidebarFooter({
  exploreHref,
  onNavigate,
}: {
  exploreHref: string
  onNavigate?: () => void
}) {
  return (
    <div className="mt-auto space-y-3 pt-6">
      <Link
        href={exploreHref}
        onClick={onNavigate}
        className={cn(
          NEXUS_TRANSITION,
          NEXUS_FOCUS_VISIBLE_ON_DARK,
          'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D1B3E] px-4 py-3 text-sm font-bold text-white hover:bg-[#0D1B3E]/90',
        )}
      >
        <Plus className="h-4 w-4" aria-hidden />
        Nouvelle exploration
      </Link>
      <div className="space-y-1">
        <Link
          href="/profile"
          onClick={onNavigate}
          className={cn(
            NEXUS_TRANSITION,
            NEXUS_FOCUS_VISIBLE,
            'flex items-center gap-2 rounded-md px-3 py-2 font-mono text-[11px] font-black uppercase tracking-[0.22em]',
            NEXUS_TW.ink65,
            'hover:text-[#0D1B3E]',
          )}
        >
          <Settings className="h-3.5 w-3.5" aria-hidden />
          Settings
        </Link>
        <a
          href="mailto:support@visaflow.com?subject=Support%20VisaFlow"
          className={cn(
            NEXUS_TRANSITION,
            NEXUS_FOCUS_VISIBLE,
            'flex items-center gap-2 rounded-md px-3 py-2 font-mono text-[11px] font-black uppercase tracking-[0.22em]',
            NEXUS_TW.ink65,
            'hover:text-[#0D1B3E]',
          )}
        >
          <LifeBuoy className="h-3.5 w-3.5" aria-hidden />
          Support
        </a>
      </div>
    </div>
  )
}

type DashboardSidebarProps = {
  open: boolean
  onClose: () => void
}

export function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const pathname = normalizeDashboardPath(usePathname() || '')
  const close = () => onClose()
  const [isAdmin, setIsAdmin] = useState(false)
  const { preference } = useObjectivePreference()

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/api/user/access')
        if (!res.ok) return
        const data: unknown = await res.json()
        if (
          cancelled ||
          typeof data !== 'object' ||
          data === null ||
          !('isAdmin' in data) ||
          typeof (data as { isAdmin: unknown }).isAdmin !== 'boolean'
        ) {
          return
        }
        setIsAdmin((data as { isAdmin: boolean }).isAdmin)
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const explorerHref = useMemo(() => ctaExploreHref(preference.primarySlug), [preference.primarySlug])
  const compareHref = useMemo(() => ctaCompareHref(preference.primarySlug), [preference.primarySlug])
  const primaryDef = useMemo(() => getObjectiveBySlug(preference.primarySlug), [preference.primarySlug])
  const visibleDashboardNav = useMemo(
    () => filterNavItemsByRole(dashboardNav, isAdmin),
    [isAdmin],
  )
  const explorerItems = useMemo(() => {
    const mapped = explorerNav
      .filter((item) => isExplorerNavHrefInPerspective(item.href, primaryDef))
      .map((item) => {
        if (item.href === '/explorer') return { ...item, href: explorerHref }
        if (item.href === '/compare') return { ...item, href: compareHref }
        return item
      })
    return filterNavItemsByRole(mapped, isAdmin)
  }, [compareHref, explorerHref, primaryDef, isAdmin])

  return (
    <>
      <button
        type="button"
        aria-label="Fermer le menu workspace"
        className={cn(
          'fixed inset-0 z-[90] backdrop-blur-[2px] lg:backdrop-blur-[1px]',
          NEXUS_BACKDROP_TRANSITION,
          NEXUS_TW.backdropInk45,
          NEXUS_TW.backdropInk30,
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={close}
      />
      <aside
        id="dashboard-workspace-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation workspace Mobility Intel"
        className={cn(
          'fixed z-[100] flex flex-col gap-7 overflow-y-auto overscroll-contain border bg-white shadow-2xl',
          NEXUS_DRAWER_SURFACE_TRANSITION,
          'max-lg:inset-y-0 max-lg:left-0 max-lg:h-full max-lg:w-[min(20rem,92vw)] max-lg:pl-[max(1.5rem,calc(1.25rem+env(safe-area-inset-left,0px)))] max-lg:pr-5 max-lg:pb-[max(2rem,calc(1.25rem+env(safe-area-inset-bottom,0px)))] max-lg:pt-[max(1.5rem,calc(1rem+env(safe-area-inset-top,0px)))]',
          open ? 'max-lg:translate-x-0' : 'max-lg:pointer-events-none max-lg:-translate-x-full',
          'lg:left-4 lg:right-auto lg:top-[4.25rem] lg:h-auto lg:max-h-[min(36rem,calc(100dvh-5.5rem))] lg:w-[22rem] lg:rounded-2xl lg:border lg:px-5 lg:pb-6 lg:pt-5',
          open ? 'lg:translate-y-0 lg:visible lg:opacity-100' : 'lg:pointer-events-none lg:invisible lg:-translate-y-2 lg:opacity-0',
        )}
        style={{ borderColor: NEXUS_BORDER }}
        aria-hidden={!open}
      >
        <div className="flex items-start justify-between gap-3">
          <BrandBlock onNavigate={close} />
          <button
            type="button"
            className={cn(
              'shrink-0 rounded-lg border p-2',
              NEXUS_TRANSITION,
              NEXUS_FOCUS_VISIBLE,
              NEXUS_TW.ink55,
              NEXUS_TW.hoverSurface,
              NEXUS_TW.ink,
            )}
            style={{ borderColor: NEXUS_BORDER }}
            onClick={close}
            aria-label="Fermer la navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <ObjectiveDockInline
          className={cn('w-full max-w-none bg-[#FAF7EE]/90', NEXUS_TW.borderStrong)}
        />
        <NavGroup label="Workspace" items={visibleDashboardNav} pathname={pathname} onNavigate={close} />
        <NavGroup label="Data & Analysis" items={explorerItems} pathname={pathname} onNavigate={close} />
        <SidebarFooter exploreHref={explorerHref} onNavigate={close} />
      </aside>
    </>
  )
}
