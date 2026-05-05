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
    <aside className="flex w-72 flex-col gap-10 border-r border-white/10 bg-[#111827]/80 p-8 backdrop-blur">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white shadow-lg shadow-blue-900/40">
          V
        </div>
        <div className="text-2xl font-black tracking-tight text-white">VisaFlow</div>
      </Link>

      <div className="flex flex-col gap-8">
        <nav className="flex flex-col gap-2" aria-label="Espace tableau de bord">
          <div className="mb-2 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
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
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white',
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      'h-5 w-5',
                      active ? 'text-white' : 'text-slate-500 group-hover:text-blue-400',
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
          <div className="mb-2 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
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
                    ? 'bg-white/[0.08] text-white ring-1 ring-white/15'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white',
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      'h-5 w-5',
                      active ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400',
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

      <div className="mt-auto border-t border-white/10 pt-8">
        <button
          type="button"
          className="group flex w-full cursor-not-allowed items-center gap-3 rounded-2xl px-4 py-3 font-bold text-slate-400 opacity-75"
          aria-disabled
        >
          <Settings className="h-5 w-5 text-slate-500" />
          Paramètres
        </button>
      </div>
    </aside>
  )
}
