import Link from 'next/link'
import { Globe } from 'lucide-react'

const links = [
  { href: '/explorer', label: 'Explorer' },
  { href: '/schengen', label: 'Schengen' },
  { href: '/probability', label: 'Visa Engine' },
]

export default function AppNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B0F19]/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-white">
          <div className="rounded-lg bg-blue-600 p-1.5">
            <Globe className="h-5 w-5" />
          </div>
          <span className="text-sm font-black uppercase tracking-widest">VisaFlow</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-bold text-slate-300 transition-colors hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/overview" className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10">
          Espace perso
        </Link>
      </div>
    </header>
  )
}

