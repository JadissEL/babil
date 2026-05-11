'use client'

import { Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { getDashboardNavTitle } from '@/components/layout/dashboard-nav-config'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

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
    <div className="flex min-h-[calc(100vh-4rem)] bg-bg text-text">
      <DashboardSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-16 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface/95 px-3 backdrop-blur-sm sm:px-4 lg:hidden">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-[#f8f2e8] text-text transition-colors hover:bg-primary-soft hover:text-primary"
            onClick={() => setMobileOpen(true)}
            aria-expanded={mobileOpen}
            aria-controls="dashboard-mobile-nav"
            aria-label="Ouvrir le menu du tableau de bord"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-sm font-black tracking-tight text-text">{title}</h1>
          <Link
            href="/"
            className="shrink-0 rounded-xl border border-line bg-[#f8f2e8] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-muted transition-colors hover:bg-primary-soft hover:text-primary"
          >
            Accueil
          </Link>
        </header>

        <main className="flex-1 px-4 py-5 sm:px-5 sm:py-7 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  )
}
