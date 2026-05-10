'use client'

import { useUser } from '@clerk/nextjs'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { useEffect, useState } from 'react'

function storageKey(blockId: string, countryId?: string | number | null) {
  const cid = countryId == null || countryId === '' ? 'na' : String(countryId)
  return `babil:content-feedback:v1:${blockId}:${cid}`
}

type Props = {
  blockId: string
  countryId?: string | number | null
  className?: string
}

export function BlockFeedback({ blockId, countryId, className = '' }: Props) {
  const { user } = useUser()
  const [value, setValue] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(blockId, countryId))
      if (raw === 'up' || raw === 'down') setValue(raw)
    } catch {
      /* ignore */
    }
  }, [blockId, countryId])

  const persist = (helpful: boolean) => {
    const next = helpful ? 'up' : 'down'
    setValue(next)
    try {
      localStorage.setItem(storageKey(blockId, countryId), next)
    } catch {
      /* ignore */
    }
    if (user) {
      fetch('/api/user/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CONTENT_FEEDBACK',
          payload: {
            blockId,
            countryId: countryId == null || countryId === '' ? null : Number(countryId) || String(countryId),
            helpful,
          },
        }),
      }).catch(() => {})
    }
  }

  return (
    <div
      className={`mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4 ${className}`}
      role="group"
      aria-label="Ce bloc vous est-il utile ?"
    >
      <span className="mr-auto text-[10px] font-black uppercase tracking-widest text-muted">Utile ?</span>
      <button
        type="button"
        aria-pressed={value === 'up'}
        onClick={() => persist(true)}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
          value === 'up'
            ? 'border-success/50 bg-[#e9f9f1] text-success'
            : 'border-line bg-inset text-muted hover:border-primary/30 hover:text-text'
        }`}
      >
        <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
        Oui
      </button>
      <button
        type="button"
        aria-pressed={value === 'down'}
        onClick={() => persist(false)}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
          value === 'down'
            ? 'border-danger/45 bg-[#fff0f0] text-danger'
            : 'border-line bg-inset text-muted hover:border-primary/30 hover:text-text'
        }`}
      >
        <ThumbsDown className="h-3.5 w-3.5" aria-hidden />
        Non
      </button>
    </div>
  )
}
