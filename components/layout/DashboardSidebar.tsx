'use client'

import { LifeBuoy, Plus, Settings, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import {
  dashboardNav,
  explorerNav,
  hrefDashboardActive,
  normalizeDashboardPath,
  type DashboardNavItem,
} from '@/components/layout/dashboard-nav-config'
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider'
import { ctaCompareHref, ctaExploreHref } from '@/lib/cta-hrefs'
import { cn } from '@/lib/utils'

const INK_10 = 'rgba(13,27,62,0.10)'

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
        'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] transition-colors',
        active
          ? 'bg-white font-semibold text-[#0D1B3E] shadow-[inset_3px_0_0_0_#0D1B3E]'
          : 'font-medium text-[#0D1B3E]/65 hover:bg-white/60 hover:text-[#0D1B3E]',
      )}
    >
      <item.icon
        className={cn(
          'h-4 w-4 shrink-0',
          active ? 'text-[#0D1B3E]' : 'text-[#0D1B3E]/55',
        )}
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
      <p className="px-3 font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/45">
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
      className="block"
      aria-label="Mobility Intel — retour à l'accueil"
    >
      <p className="font-serif text-[22px] font-black leading-tight tracking-tight text-[#0D1B3E]">
        Mobility
        <br />
        Intel
      </p>
      <p className="mt-1 font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/55">
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
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D1B3E] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0D1B3E]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3E]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7EE]"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Nouvelle exploration
      </Link>
      <div className="space-y-1">
        <Link
          href="/profile"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65 transition-colors hover:text-[#0D1B3E]"
        >
          <Settings className="h-3.5 w-3.5" aria-hidden />
          Settings
        </Link>
        <a
          href="mailto:support@visaflow.com?subject=Support%20VisaFlow"
          className="flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65 transition-colors hover:text-[#0D1B3E]"
        >
          <LifeBuoy className="h-3.5 w-3.5" aria-hidden />
          Support
        </a>
      </div>
    </div>
  )
}

type DashboardSidebarProps = {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function DashboardSidebar({ mobileOpen = false, onMobileClose }: DashboardSidebarProps) {
  const pathname = normalizeDashboardPath(usePathname() || '')
  const close = () => onMobileClose?.()
  const { preference } = useObjectivePreference()
  const explorerHref = useMemo(
    () => ctaExploreHref(preference.primarySlug),
    [preference.primarySlug],
  )
  const compareHref = useMemo(
    () => ctaCompareHref(preference.primarySlug),
    [preference.primarySlug],
  )
  const explorerItems = useMemo(
    () =>
      explorerNav.map((item) => {
        if (item.href === '/explorer') return { ...item, href: explorerHref }
        if (item.href === '/compare') return { ...item, href: compareHref }
        return item
      }),
    [compareHref, explorerHref],
  )

  return (
    <>
      <button
        type="button"
        aria-label="Fermer le menu"
        className={cn(
          'fixed inset-0 z-[90] bg-[#0D1B3E]/45 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={close}
      />
      <aside
        id="dashboard-mobile-nav"
        role="navigation"
        aria-label="Navigation espace connecté"
        className={cn(
          'fixed inset-y-0 left-0 z-[100] flex w-[min(20rem,92vw)] flex-col gap-7 overflow-y-auto overscroll-contain border-r bg-white pl-[max(1.5rem,calc(1.25rem+env(safe-area-inset-left,0px)))] pr-5 pb-[max(2rem,calc(1.25rem+env(safe-area-inset-bottom,0px)))] pt-[max(1.5rem,calc(1rem+env(safe-area-inset-top,0px)))] shadow-2xl transition-transform duration-300 ease-out lg:hidden',
          mobileOpen ? 'translate-x-0' : 'pointer-events-none -translate-x-full',
        )}
        style={{ borderColor: INK_10 }}
        aria-hidden={!mobileOpen}
      >
        <div className="flex items-start justify-between gap-3">
          <BrandBlock onNavigate={close} />
          <button
            type="button"
            className="shrink-0 rounded-lg border p-2 text-[#0D1B3E]/55 transition-colors hover:bg-[#0D1B3E]/[0.04] hover:text-[#0D1B3E]"
            style={{ borderColor: INK_10 }}
            onClick={close}
            aria-label="Fermer la navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <NavGroup label="Workspace" items={dashboardNav} pathname={pathname} onNavigate={close} />
        <NavGroup
          label="Data & Analysis"
          items={explorerItems}
          pathname={pathname}
          onNavigate={close}
        />
        <SidebarFooter exploreHref={explorerHref} onNavigate={close} />
      </aside>

      <aside
        role="navigation"
        aria-label="Navigation espace connecté"
        className="hidden w-64 shrink-0 flex-col gap-7 border-r bg-[#F5F0E3] px-5 pb-6 pt-7 lg:flex"
        style={{ borderColor: INK_10 }}
      >
        <BrandBlock />
        <NavGroup label="Workspace" items={dashboardNav} pathname={pathname} />
        <NavGroup label="Data & Analysis" items={explorerItems} pathname={pathname} />
        <SidebarFooter exploreHref={explorerHref} />
      </aside>
    </>
  )
}
