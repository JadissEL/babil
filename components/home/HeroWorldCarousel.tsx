'use client'

import { useEffect, useMemo, useState } from 'react'
import slides from '@/data/hero-slides.json'

type HeroSlide = {
  imageUrl: string
  place: string
  country: string
  continent?: string
  durationMs?: number
}

const SLIDES: HeroSlide[] = slides

const AUTO_SLIDE_MS = 4200

export default function HeroWorldCarousel() {
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const current = useMemo(() => SLIDES[index], [index])
  const currentDelay = Math.max(2000, current.durationMs ?? AUTO_SLIDE_MS)

  const goNext = () => setIndex((prev) => (prev + 1) % SLIDES.length)
  const goPrev = () => setIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)

  useEffect(() => {
    if (isPaused) return
    const timer = setTimeout(() => {
      goNext()
    }, currentDelay)

    return () => clearTimeout(timer)
  }, [index, isPaused, currentDelay])

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

      {SLIDES.map((slide, slideIndex) => (
        <img
          key={`${slide.place}-${slide.country}`}
          src={slide.imageUrl}
          alt={`${slide.place}, ${slide.country}`}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            slideIndex === index ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            animation: slideIndex === index ? `heroKenBurns ${currentDelay}ms ease-out both` : undefined,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/80">
            Current destination
          </p>
          {current.continent ? (
            <p className="mb-1 mt-1 inline-flex rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white/90">
              {current.continent}
            </p>
          ) : null}
          <p className="text-lg font-black text-white md:text-xl">{current.place}</p>
          <p className="text-sm font-semibold text-white/90">{current.country}</p>
        </div>
        <div className="flex gap-1.5">
          {SLIDES.map((_, dotIndex) => (
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
