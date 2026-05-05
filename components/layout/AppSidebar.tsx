import Link from 'next/link'
import {
  Briefcase,
  Car,
  Gavel,
  Globe,
  GraduationCap,
  LayoutDashboard,
  MessagesSquare,
  Scale,
  ShieldCheck,
  Zap,
} from 'lucide-react'

const items = [
  { href: '/overview', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/explorer', label: 'Explorer', icon: Globe },
  { href: '/compare', label: 'Compare', icon: Scale },
  { href: '/schengen', label: 'Schengen', icon: ShieldCheck },
  { href: '/probability', label: 'Visa Engine', icon: Zap },
  { href: '/education', label: 'Education', icon: GraduationCap },
  { href: '/community', label: 'Community', icon: MessagesSquare },
  { href: '/business', label: 'Business', icon: Briefcase },
  { href: '/permis', label: 'Driving License', icon: Car },
  { href: '/moderation', label: 'Modération', icon: Gavel },
]

export default function AppSidebar() {
  return (
    <aside className="rounded-2xl border border-white/10 bg-[#111827] p-4 text-slate-200">
      <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Navigation</p>
      <nav className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <item.icon className="h-4 w-4" /> {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

