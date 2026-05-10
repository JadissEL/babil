'use client'

import { ChevronRight, Settings, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  dashboardNav,
  explorerNav,
  hrefDashboardActive,
  normalizeDashboardPath,
  type DashboardNavItem,
} from '@/components/layout/dashboard-nav-config'
import { cn } from '@/lib/utils'

function NavLinkRow({
  item,
  active,
  onNavigate,
  variant,
}: {
  item: DashboardNavItem
  active: boolean
  onNavigate?: () => void
  variant: 'dashboard' | 'explorer'
}) {
  const isOverview = item.href === '/overview'
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        'group flex items-center justify-between rounded-2xl px-4 py-3 font-bold transition-all',
        variant === 'dashboard'
          ? active
            ? 'bg-primary text-white shadow-soft'
            : 'text-muted hover:bg-primary-soft hover:text-primary'
          : active
            ? 'bg-primary-soft text-primary ring-1 ring-primary/20'
            : 'text-muted hover:bg-primary-soft hover:text-primary',
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <item.icon
          className={cn(
            'h-5 w-5 shrink-0',
            variant === 'dashboard'
              ? active
                ? 'text-white'
                : 'text-muted group-hover:text-primary'
              : active
                ? 'text-primary'
                : 'text-muted group-hover:text-primary',
          )}
        />
        <span className="truncate">{item.label}</span>
      </div>
      {!isOverview && (
        <ChevronRight
          className={cn(
            'h-4 w-4 shrink-0 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 -translate-x-2',
            active && 'translate-x-0 opacity-100',
          )}
        />
      )}
    </Link>
  )
}

function NavSections({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex flex-col gap-8">
      <nav className="flex flex-col gap-2" aria-label="Espace tableau de bord">
        <div className="mb-2 px-4 text-[10px] font-black uppercase tracking-widest text-muted">Compte</div>
        {dashboardNav.map((item) => (
          <NavLinkRow
            key={item.href}
            item={item}
            active={hrefDashboardActive(pathname, item)}
            onNavigate={onNavigate}
            variant="dashboard"
          />
        ))}
      </nav>

      <nav className="flex flex-col gap-2" aria-label="Outils mobilité">
        <div className="mb-2 px-4 text-[10px] font-black uppercase tracking-widest text-muted">Mobilité</div>
        {explorerNav.map((item) => (
          <NavLinkRow
            key={item.href}
            item={item}
            active={hrefDashboardActive(pathname, item)}
            onNavigate={onNavigate}
            variant="explorer"
          />
        ))}
      </nav>
    </div>
  )
}

function SettingsStub() {
  return (
    <div className="mt-auto border-t border-line pt-8">
      <button
        type="button"
        className="group flex w-full cursor-not-allowed items-center gap-3 rounded-2xl px-4 py-3 font-bold text-muted opacity-75"
        aria-disabled
      >
        <Settings className="h-5 w-5 text-muted" />
        Paramètres
      </button>
    </div>
  )
}

function BrandBlock({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link href="/" onClick={onNavigate} className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-black text-white shadow-soft">
        V
      </div>
      <div className="truncate text-xl font-black tracking-tight text-text lg:text-2xl">VisaFlow</div>
    </Link>
  )
}

type DashboardSidebarProps = {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function DashboardSidebar({ mobileOpen = false, onMobileClose }: DashboardSidebarProps) {
  const pathname = normalizeDashboardPath(usePathname() || '')
  const close = () => onMobileClose?.()

  return (
    <>
      {/* Mobile overlay + drawer */}
      <button
        type="button"
        aria-label="Fermer le menu"
        className={cn(
          'fixed inset-0 z-[90] bg-text/45 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={close}
      />
      <aside
        id="dashboard-mobile-nav"
        className={cn(
          'fixed inset-y-0 left-0 z-[100] flex w-[min(22rem,92vw)] flex-col gap-8 overflow-y-auto overscroll-contain border-r border-line bg-surface p-6 pb-8 shadow-2xl transition-transform duration-300 ease-out lg:hidden',
          mobileOpen ? 'translate-x-0' : 'pointer-events-none -translate-x-full',
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="flex items-center justify-between gap-3">
          <BrandBlock onNavigate={close} />
          <button
            type="button"
            className="shrink-0 rounded-xl border border-line p-2 text-muted transition-colors hover:bg-primary-soft hover:text-primary"
            onClick={close}
            aria-label="Fermer la navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <NavSections pathname={pathname} onNavigate={close} />
        <SettingsStub />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col gap-10 border-r border-line bg-surface p-6 lg:flex lg:p-8">
        <BrandBlock />
        <NavSections pathname={pathname} />
        <SettingsStub />
      </aside>
    </>
  )
}
