'use client'

import { Clock, Globe } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { COUNTRY_HIGHLIGHTS } from '@/lib/country-highlights'
import { ATLAS_NAVY } from '@/lib/explorer-atlas-ui'
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
  /** Variante maquette Stitch PAGE 02 (Atlas). */
  variant?: 'default' | 'atlas'
  /** Sous-titre zone (ex. Schengen, Asie) — variante atlas. */
  atlasCategoryLabel?: string
  /** Délai visa affiché en jours — variante atlas. */
  atlasVisaDelayDays?: number
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
  variant = 'default',
  atlasCategoryLabel,
  atlasVisaDelayDays,
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

  const baseCardClass = cn(
    'group flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all duration-200',
    interactive || focusableLink ? 'cursor-pointer' : undefined,
    variant === 'default' && 'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft',
    variant === 'atlas' && 'border-[#0D1B3E]/10 bg-white shadow-md hover:border-[#0D1B3E]/25 hover:shadow-lg',
  )

  if (variant === 'atlas') {
    const days = atlasVisaDelayDays ?? 21
    const cat = atlasCategoryLabel ?? '—'
    const barPct = Math.min(100, Math.max(4, score))

    const atlasCard = (
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
        className={baseCardClass}
      >
        <CardContent className="flex min-h-0 flex-1 flex-col space-y-0 p-0">
          <div className="flex items-stretch gap-4 px-5 pb-2 pt-5">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted">{cat}</p>
              <h3 className="break-words text-2xl font-black tracking-tight text-[#0D1B3E] md:text-[1.65rem]">
                {name}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-muted">
                <Clock className="size-3.5 shrink-0 opacity-80" aria-hidden />
                <span>
                  Délai visa: <span className="text-[#0D1B3E]">{days}j</span>
                </span>
              </p>
              <p className="mt-auto pt-3 text-3xl font-black tabular-nums text-[#0D1B3E]">
                {score}
                <span className="text-base font-bold text-muted">/100</span>
              </p>
            </div>
            <div className="relative size-[5.25rem] shrink-0 self-center overflow-hidden rounded-full border-2 border-[#0D1B3E]/15 bg-line/30 md:size-24">
              <Image
                src={imageSrc}
                alt={`${scenicLabel}, ${name}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="96px"
                loading="lazy"
                onError={() => {
                  if (imageSrc !== guaranteedSrc) {
                    setImageSrc(guaranteedSrc)
                    setFallbackUsed(true)
                  }
                }}
              />
              {fallbackUsed ? (
                <div className="absolute bottom-1 right-1 rounded-full border border-amber-200/80 bg-amber-100/95 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-amber-800">
                  Gén.
                </div>
              ) : null}
            </div>
          </div>
          <div className="mt-auto h-2.5 w-full overflow-hidden bg-[#0D1B3E]/10">
            <div
              className="h-full rounded-none transition-all duration-500"
              style={{ width: `${barPct}%`, backgroundColor: ATLAS_NAVY }}
            />
          </div>
        </CardContent>
      </Card>
    )

    if (interactive) return atlasCard

    if (countryId != null) {
      return (
        <Link
          href={`/countries/${countryId}`}
          className="flex h-full min-h-0 min-w-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3E]/40"
          onClick={onNavigate}
        >
          {atlasCard}
        </Link>
      )
    }

    return atlasCard
  }

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
      className={baseCardClass}
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
