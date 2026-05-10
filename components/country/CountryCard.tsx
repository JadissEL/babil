'use client'

import { Globe } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { COUNTRY_HIGHLIGHTS } from '@/lib/country-highlights'
import { cn } from '@/lib/utils'

export type MobilityTier = 'Strong' | 'Medium' | 'Weak'

export type CountryCardProps = {
  /** When provided and no `onClick`, navigation vers `/countries/[countryId]` */
  countryId?: string | number
  name: string
  /** ISO Alpha-2 (flag-icons css: `fi fi-xx`) */
  code: string
  score: number
  visaScore: number
  friction: 'Low' | 'Medium' | 'High'
  study: MobilityTier
  business: MobilityTier
  highlightPlace?: string
  highlightImageUrl?: string
  /** Fired when the user follows the link to `/countries/[id]` (analytics / onboarding). */
  onNavigate?: () => void
  onClick?: () => void
}

function frictionStripClass(friction: CountryCardProps['friction']) {
  if (friction === 'Low') return 'border-[#94dfbd] bg-[#e9f9f1] text-success'
  if (friction === 'Medium') return 'border-[#f2c27a] bg-[#fff5e7] text-warning'
  return 'border-[#f3afaf] bg-[#fff0f0] text-danger'
}

function fallbackCountryImageUrl(countryName: string) {
  const q = encodeURIComponent(`${countryName} landmark travel photography`)
  return `https://source.unsplash.com/1600x900/?${q}`
}

function guaranteedImageUrl(countryName: string) {
  const seed = encodeURIComponent(countryName.toLowerCase().replace(/\s+/g, '-'))
  return `https://picsum.photos/seed/${seed}/1600/900`
}

export function CountryCard({
  countryId,
  name,
  code,
  score,
  visaScore,
  friction,
  study,
  business,
  highlightPlace,
  highlightImageUrl,
  onNavigate,
  onClick,
}: CountryCardProps) {
  const iso = code.toLowerCase().trim()
  const interactive = typeof onClick === 'function'
  const focusableLink = countryId != null && !interactive
  const curated = COUNTRY_HIGHLIGHTS[iso]
  const scenicImage = highlightImageUrl || curated?.imageUrl || fallbackCountryImageUrl(name)
  const scenicLabel = highlightPlace || curated?.place || `Signature place in ${name}`
  const guaranteedSrc = useMemo(() => guaranteedImageUrl(name), [name])
  const [imageSrc, setImageSrc] = useState(scenicImage)
  const [fallbackUsed, setFallbackUsed] = useState(false)

  const card = (
    <Card
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={cn(
        'group flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft',
        interactive || focusableLink ? 'cursor-pointer' : undefined,
      )}
    >
      <CardContent className="flex min-h-0 flex-1 flex-col space-y-0 p-0">
        <div className="relative h-36 shrink-0 overflow-hidden rounded-t-2xl border-b border-line">
          <Image
            src={imageSrc}
            alt={`${scenicLabel}, ${name}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 320px"
            loading="lazy"
            onError={() => {
              if (imageSrc !== guaranteedSrc) {
                setImageSrc(guaranteedSrc)
                setFallbackUsed(true)
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-2 left-3 max-w-[calc(100%-1.25rem)] rounded-full border border-white/40 bg-black/35 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white">
            <span className="line-clamp-2 break-words whitespace-normal">
              {scenicLabel} - {name}
            </span>
          </div>
          {fallbackUsed ? (
            <div className="absolute right-3 top-2 rounded-full border border-amber-200/70 bg-amber-100/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-700">
              Image generique
            </div>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-5 px-6 pb-6 pt-5">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {iso ? (
                <span className={cn(`fi fi-${iso}`, 'shrink-0 text-2xl leading-none shadow-sm')} aria-hidden />
              ) : (
                <Globe className="size-6 shrink-0 text-muted" aria-hidden />
              )}
              <h3 className="min-w-0 break-words text-lg font-semibold tracking-tight text-text">{name}</h3>
            </div>

            <Badge className="shrink-0" variant="default">
              {score}/100
            </Badge>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-muted">Visa probability</p>
            <Progress value={visaScore} />
          </div>

          <div className="mt-auto flex min-w-0 flex-wrap gap-2">
            <Badge className={cn(frictionStripClass(friction), 'font-semibold')} variant="secondary">
              ⚡ {friction}
            </Badge>
            <Badge variant="secondary">🎓 Study: {study}</Badge>
            <Badge variant="secondary">💼 Business: {business}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (interactive) return card

  if (countryId != null) {
    return (
      <Link
        href={`/countries/${countryId}`}
        className="flex h-full min-h-0 min-w-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        onClick={onNavigate}
      >
        {card}
      </Link>
    )
  }

  return card
}

export default CountryCard
