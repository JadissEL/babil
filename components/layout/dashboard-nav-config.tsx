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
  MessageSquare,
  MessagesSquare,
  ShieldCheck,
  Activity,
  Scale,
  Shield,
  SwatchBook,
  History,
} from 'lucide-react'

export type DashboardNavItem = {
  label: string
  href: string
  icon: ComponentType<LucideProps>
  match?: 'exact' | 'prefix'
}

export const dashboardNav: DashboardNavItem[] = [
  { label: 'Aperçu', href: '/overview', icon: LayoutDashboard },
  { label: 'Historique', href: '/history', icon: History },
  { label: 'Moteur de probabilités', href: '/probability', icon: Brain },
  { label: 'Moteur reco (pro)', href: '/recommendation-engine', icon: Activity },
  { label: 'Mes recommandations', href: '/recommendations', icon: Map },
  { label: 'Mon profil', href: '/profile', icon: User },
  { label: 'Administration', href: '/admin', icon: Shield },
  { label: 'Design system', href: '/design-system', icon: SwatchBook },
]

export const explorerNav: DashboardNavItem[] = [
  { label: 'Explorer global', href: '/explorer', icon: Globe, match: 'prefix' },
  { label: 'Vue Schengen', href: '/schengen', icon: ShieldCheck },
  { label: 'Comparer pays', href: '/compare', icon: Scale },
  { label: 'Communauté', href: '/community', icon: MessagesSquare },
  { label: 'Business & investissement', href: '/business', icon: Briefcase },
  { label: 'Investissement / CBI', href: '/investment', icon: CreditCard },
  { label: 'Éducation & Formation', href: '/education', icon: GraduationCap, match: 'prefix' },
  { label: 'Permis International', href: '/permis', icon: Car },
  { label: 'Modération', href: '/moderation', icon: MessageSquare },
]

export function normalizeDashboardPath(p: string) {
  if (p.length > 1 && p.endsWith('/')) return p.slice(0, -1)
  return p || '/'
}

export function hrefDashboardActive(normalizedPathname: string, item: DashboardNavItem): boolean {
  const h = item.href
  if (item.match === 'prefix') {
    return normalizedPathname === h || normalizedPathname.startsWith(`${h}/`)
  }
  return normalizedPathname === h
}

export function getDashboardNavTitle(pathname: string): string {
  const p = normalizeDashboardPath(pathname)
  for (const item of dashboardNav) {
    if (hrefDashboardActive(p, item)) return item.label
  }
  for (const item of explorerNav) {
    if (hrefDashboardActive(p, item)) return item.label
  }
  return 'Espace connecté'
}
