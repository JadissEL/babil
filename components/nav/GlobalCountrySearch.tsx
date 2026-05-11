'use client'

import { Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { normalizeCountriesApiListResponse } from '@/lib/country-full-data-materialize'
import { cn } from '@/lib/utils'

type Row = { id: string | number; name: string }

function isEditableKeyboardTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  return Boolean(target.closest('[contenteditable="true"]'))
}

function useAppleLikePlatform() {
  const [isApple, setIsApple] = useState(false)
  useEffect(() => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    const p = typeof navigator !== 'undefined' ? navigator.platform : ''
    const uad =
      typeof navigator !== 'undefined' && 'userAgentData' in navigator
        ? (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
        : undefined
    const mac =
      /Mac|iPhone|iPad|iPod/i.test(p) ||
      /Mac OS/.test(ua) ||
      uad?.platform === 'macOS'
    setIsApple(mac)
  }, [])
  return isApple
}

export function GlobalCountrySearch() {
  const router = useRouter()
  const isApple = useAppleLikePlatform()
  const shortcutLabel = isApple ? '⌘K' : 'Ctrl+K'
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [loaded, setLoaded] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    if (loaded) return
    try {
      const r = await fetch('/api/countries?light=1')
      const data = await r.json()
      const norm = normalizeCountriesApiListResponse(data)
      setRows(
        norm
          .map((c) => ({
            id: (c as { id?: unknown }).id as string | number,
            name: String((c as { name?: unknown }).name ?? ''),
          }))
          .filter((x) => x.name && x.id !== undefined && x.id !== ''),
      )
    } catch {
      setRows([])
    } finally {
      setLoaded(true)
    }
  }, [loaded])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) return
      if (!open && isEditableKeyboardTarget(e.target)) return
      e.preventDefault()
      setOpen((o) => !o)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    let idleId: number | undefined
    let timeoutId: number | undefined
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(() => {
        void load()
      })
    } else {
      timeoutId = window.setTimeout(() => {
        void load()
      }, 500)
    }
    return () => {
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
    }
  }, [load])

  useEffect(() => {
    if (!open) return
    void load()
    const t = window.setTimeout(() => inputRef.current?.focus(), 0)
    const onDoc = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => {
      window.clearTimeout(t)
      document.removeEventListener('mousedown', onDoc)
    }
  }, [open, load])

  useEffect(() => {
    if (!open) return
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [open])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows.slice(0, 14)
    return rows.filter((r) => r.name.toLowerCase().includes(s)).slice(0, 24)
  }, [q, rows])

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-[10px] font-black uppercase tracking-wider text-muted transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-primary sm:px-3.5 sm:text-xs"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Rechercher un pays"
        title={`Rechercher un pays (${shortcutLabel})`}
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden />
        <span className="max-[420px]:sr-only">Pays</span>
        <kbd className="hidden rounded border border-line bg-inset px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted sm:inline">
          {shortcutLabel}
        </kbd>
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-[60] bg-black/25 sm:hidden" aria-hidden onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-label="Recherche de pays"
            aria-modal="true"
            className={cn(
              'fixed left-3 right-3 top-[max(5rem,calc(4.25rem+env(safe-area-inset-top,0px)))] z-[70] max-h-[min(28rem,calc(100dvh_-_7.5rem_-_var(--vf-objective-dock-height,5.5rem)_-_env(safe-area-inset-top,0px)_-_env(safe-area-inset-bottom,0px)))] overflow-hidden rounded-2xl border border-line bg-surface shadow-card sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-[min(70dvh,24rem)] sm:w-[min(100vw-2rem,22rem)]',
            )}
          >
            <div className="border-b border-line p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  ref={inputRef}
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault()
                      setHighlight((h) => (filtered.length ? (h + 1) % filtered.length : 0))
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault()
                      setHighlight((h) =>
                        filtered.length ? (h - 1 + filtered.length) % filtered.length : 0,
                      )
                    } else if (e.key === 'Enter' && filtered.length > 0) {
                      e.preventDefault()
                      const r = filtered[Math.min(highlight, filtered.length - 1)]
                      if (r) {
                        setOpen(false)
                        setQ('')
                        router.push(`/countries/${encodeURIComponent(String(r.id))}`)
                      }
                    }
                  }}
                  placeholder="Nom du pays…"
                  className="w-full rounded-xl border border-line bg-inset py-2.5 pl-10 pr-3 text-sm font-medium text-text outline-none focus:ring-2 focus:ring-primary/40"
                  autoComplete="off"
                />
              </div>
              <p className="mt-2 text-[11px] font-medium text-muted">
                Liste fusionnée légère — flèches et Entrée pour ouvrir.
              </p>
            </div>
            <ul className="max-h-[min(45dvh,calc(100dvh_-_14rem_-_var(--vf-objective-dock-height,5.5rem)_-_env(safe-area-inset-top,0px)_-_env(safe-area-inset-bottom,0px)),18rem)] overflow-y-auto p-2 sm:max-h-[min(55dvh,16rem)]">
              {!loaded ? (
                <li className="px-3 py-4 text-center text-sm font-medium text-muted">Chargement…</li>
              ) : filtered.length === 0 ? (
                <li className="px-3 py-4 text-center text-sm font-medium text-muted">Aucun résultat.</li>
              ) : (
                filtered.map((r, i) => (
                  <li key={String(r.id)}>
                    <Link
                      href={`/countries/${encodeURIComponent(String(r.id))}`}
                      className={cn(
                        'block rounded-xl px-3 py-2.5 text-sm font-bold text-text transition-colors',
                        i === highlight ? 'bg-primary-soft ring-1 ring-primary/30' : 'hover:bg-primary-soft',
                      )}
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => {
                        setOpen(false)
                        setQ('')
                      }}
                    >
                      {r.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  )
}
