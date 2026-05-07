'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import curatedSlidesStatic from '@/data/hero-slides.json'

import type { HomeHeroSlide } from '@/lib/home-hero-slides'

function isRenderableSlide(slide: HomeHeroSlide) {
  return Boolean(
    slide.imageUrl?.trim() &&
      slide.place?.trim() &&
      slide.country?.trim() &&
      slide.sourceName?.trim() &&
      slide.sourceUrl?.trim() &&
      /^https?:\/\//i.test(String(slide.sourceUrl).trim()),
  )
}

const AUTO_SLIDE_MS = 4200

const curatedFallback = curatedSlidesStatic as HomeHeroSlide[]

type Props = {
  /** When set (e.g. from `buildHomeHeroSlides()`), includes curated JSON + merged travel highlights */
  slides?: HomeHeroSlide[] | null
}

export default function HeroWorldCarousel({ slides }: Props) {
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const VERIFIED_SLIDES = useMemo(() => {
    const raw = slides != null && slides.length > 0 ? slides : curatedFallback
    return raw.filter(isRenderableSlide)
  }, [slides])

  useEffect(() => {
    setIndex((i) => {
      if (VERIFIED_SLIDES.length === 0) return 0
      return Math.min(i, VERIFIED_SLIDES.length - 1)
    })
  }, [VERIFIED_SLIDES.length])

  const current = VERIFIED_SLIDES[index] ?? VERIFIED_SLIDES[0]
  const currentDelay = Math.max(2000, current?.durationMs ?? AUTO_SLIDE_MS)

  useEffect(() => {
    if (isPaused || VERIFIED_SLIDES.length === 0 || !current) return
    const len = VERIFIED_SLIDES.length
    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % len)
    }, currentDelay)

    return () => clearTimeout(timer)
  }, [current, index, isPaused, currentDelay, VERIFIED_SLIDES.length])

  const goNext = () =>
    setIndex((prev) => (prev + 1) % Math.max(1, VERIFIED_SLIDES.length))
  const goPrev = () =>
    setIndex((prev) => (prev - 1 + VERIFIED_SLIDES.length) % Math.max(1, VERIFIED_SLIDES.length))

  if (VERIFIED_SLIDES.length === 0) {
    return (
      <div className="relative flex h-[260px] items-center justify-center rounded-2xl border border-line bg-[#f8f2e8] p-6 text-center shadow-soft md:h-[320px]">
        <p className="text-sm font-semibold text-muted">No verified hero photos available yet.</p>
      </div>
    )
  }

  return (
    <div
      className="relative h-[260px] overflow-hidden rounded-2xl border border-line shadow-soft md:h-[320px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          goNext()
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          goPrev()
        }
      }}
      tabIndex={0}
      aria-label="World destinations carousel"
    >
      <div className="absolute left-0 right-0 top-0 z-20 h-1.5 bg-black/25">
        <div
          key={`${index}-${currentDelay}`}
          className="h-full bg-gradient-to-r from-accent via-warning to-primary"
          style={{
            animation: `heroSlideProgress ${currentDelay}ms linear forwards`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />
      </div>

      {VERIFIED_SLIDES.map((slide, slideIndex) => (
        <Image
          key={`${slide.place}-${slide.country}-${slide.imageUrl.slice(0, 40)}`}
          src={slide.imageUrl}
          alt={`${slide.place}, ${slide.country}`}
          fill
          className={`object-cover transition-opacity duration-700 ${
            slideIndex === index ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            animation: slideIndex === index ? `heroKenBurns ${currentDelay}ms ease-out both` : undefined,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
          sizes="(max-width: 768px) 100vw, 896px"
          priority={slideIndex === 0}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Current destination</p>
          {current?.continent ? (
            <p className="mb-1 mt-1 inline-flex rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white/90">
              {current.continent}
            </p>
          ) : null}
          <p className="mb-1 inline-flex rounded-full border border-emerald-200/60 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-50">
            Verified location source
          </p>
          <p className="text-lg font-black text-white md:text-xl">{current.place}</p>
          <p className="text-sm font-semibold text-white/90">{current.country}</p>
          {current.sourceName && current.sourceUrl ? (
            <a
              href={current.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex text-xs font-semibold text-white/80 underline underline-offset-2 hover:text-white"
            >
              Source photo: {current.sourceName}
            </a>
          ) : null}
        </div>
        <div className="flex gap-1.5">
          {VERIFIED_SLIDES.map((_, dotIndex) => (
            <button
              key={`dot-${dotIndex}`}
              type="button"
              aria-label={`Go to slide ${dotIndex + 1}`}
              onClick={() => setIndex(dotIndex)}
              className={`h-2.5 w-2.5 rounded-full border border-white/40 ${
                dotIndex === index ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
