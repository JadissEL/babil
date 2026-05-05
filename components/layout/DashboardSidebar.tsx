'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideProps } from 'lucide-react'
import type { ComponentType } from 'react'
import {
  LayoutDashboard,
  Brain,
  Map,
  User,
  Briefcase,
  GraduationCap,
  Car,
  Globe,
  CreditCard,
  Settings,
  ChevronRight,
  MessageSquare,
  MessagesSquare,
  ShieldCheck,
  Activity,
  Scale,
  Shield,
  SwatchBook,
} from 'lucide-react'

import { cn } from '@/lib/utils'

type NavItem = { label: string; href: string; icon: ComponentType<LucideProps>; match?: 'exact' | 'prefix' }

const dashboardNav: NavItem[] = [
  { label: 'Aperçu', href: '/overview', icon: LayoutDashboard },
  { label: 'Probability Engine', href: '/probability', icon: Brain },
  { label: 'Moteur reco (pro)', href: '/recommendation-engine', icon: Activity },
  { label: 'Mes Recommandations', href: '/recommendations', icon: Map },
  { label: 'Mon Profil', href: '/profile', icon: User },
  { label: 'Administration', href: '/admin', icon: Shield },
  { label: 'Design System', href: '/design-system', icon: SwatchBook },
]

const explorerNav: NavItem[] = [
  { label: 'Global Explorer', href: '/explorer', icon: Globe, match: 'prefix' },
  { label: 'Schengen Dashboard', href: '/schengen', icon: ShieldCheck },
  { label: 'Comparer pays', href: '/compare', icon: Scale },
  { label: 'Communauté', href: '/community', icon: MessagesSquare },
  { label: 'Business & Invest', href: '/business', icon: Briefcase },
  { label: 'Investment / CBI', href: '/investment', icon: CreditCard },
  { label: 'Éducation & Formation', href: '/education', icon: GraduationCap, match: 'prefix' },
  { label: 'Permis International', href: '/permis', icon: Car },
  { label: 'Modération', href: '/moderation', icon: MessageSquare },
]

function normalizePath(p: string) {
  if (p.length > 1 && p.endsWith('/')) return p.slice(0, -1)
  return p || '/'
}

function hrefActive(normalizedPathname: string, item: NavItem): boolean {
  const h = item.href
  if (item.match === 'prefix') {
    return normalizedPathname === h || normalizedPathname.startsWith(`${h}/`)
  }
  /** Correspondance exacte par défaut (évite /profile vs /profile/… ) */
  return normalizedPathname === h
}

export function DashboardSidebar() {
  const pathname = normalizePath(usePathname() || '')

  return (
    <aside className="flex w-72 flex-col gap-10 border-r border-line bg-surface p-8">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-xl font-black text-white shadow-soft">
          V
        </div>
        <div className="text-2xl font-black tracking-tight text-text">VisaFlow</div>
      </Link>

      <div className="flex flex-col gap-8">
        <nav className="flex flex-col gap-2" aria-label="Espace tableau de bord">
          <div className="mb-2 px-4 text-[10px] font-black uppercase tracking-widest text-muted">
            Dashboard
          </div>
          {dashboardNav.map((item) => {
            const active = hrefActive(pathname, item)
            const isOverview = item.href === '/overview'
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center justify-between rounded-2xl px-4 py-3 font-bold transition-all',
                  active
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-muted hover:bg-primary-soft hover:text-primary',
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      'h-5 w-5',
                      active ? 'text-white' : 'text-muted group-hover:text-primary',
                    )}
                  />
                  {item.label}
                </div>
                {!isOverview && (
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 -translate-x-2',
                      active && 'opacity-100 translate-x-0',
                    )}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        <nav className="flex flex-col gap-2" aria-label="Outils mobilité">
          <div className="mb-2 px-4 text-[10px] font-black uppercase tracking-widest text-muted">
            Mobilité
          </div>
          {explorerNav.map((item) => {
            const active = hrefActive(pathname, item)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center justify-between rounded-2xl px-4 py-3 font-bold transition-all',
                  active
                    ? 'bg-primary-soft text-primary ring-1 ring-primary/20'
                    : 'text-muted hover:bg-primary-soft hover:text-primary',
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      'h-5 w-5',
                      active ? 'text-primary' : 'text-muted group-hover:text-primary',
                    )}
                  />
                  {item.label}
                </div>
                <ChevronRight
                  className={cn(
                    'h-4 w-4 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 -translate-x-2',
                    active && 'opacity-100 translate-x-0',
                  )}
                />
              </Link>
            )
          })}
        </nav>
      </div>

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
    </aside>
  )
}
