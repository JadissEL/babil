/**
 * Homepage hero carousel: curated `data/hero-slides.json` plus one optional slide per
 * showcase country from merged `full_data.travel_reasons` (when a valid image URL exists).
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { buildMergedCountriesList } from '@/lib/countries-prisma-merge'
import { HOMEPAGE_SHOWCASE_NAMES } from '@/lib/home-showcase-countries'

export type HomeHeroSlide = {
  imageUrl: string
  place: string
  country: string
  continent?: string
  durationMs?: number
  sourceName?: string
  sourceUrl?: string
}

function isHttp(u: string) {
  return /^https:\/\/.+/i.test(u.trim())
}

function attributionForImage(imageUrl: string): { sourceName: string; sourceUrl: string } {
  const lower = imageUrl.toLowerCase()
  if (lower.includes('images.unsplash.com')) {
    const base = imageUrl.split('?')[0]
    const slug = base.split('/photo-')[1]?.replace(/\/$/, '')
    return {
      sourceName: 'Unsplash',
      sourceUrl: slug ? `https://unsplash.com/photos/${slug}` : 'https://unsplash.com',
    }
  }
  if (lower.includes('source.unsplash.com')) {
    return { sourceName: 'Unsplash', sourceUrl: 'https://unsplash.com/license' }
  }
  return { sourceName: 'VisaFlow', sourceUrl: 'https://unsplash.com' }
}

function continentHint(region: string): string | undefined {
  const r = region.trim().toLowerCase()
  if (r === 'europe' || r === 'schengen') return 'Europe'
  if (r === 'asia') return 'Asia'
  if (r === 'africa') return 'Africa'
  if (r === 'north america') return 'North America'
  if (r === 'south america' || r === 'latin america') return 'Americas'
  if (r === 'oceania') return 'Oceania'
  return undefined
}

function firstTravelHighlightSlide(countryName: string, region: string, full: Record<string, unknown>): HomeHeroSlide | null {
  const reasons = full.travel_reasons
  if (!Array.isArray(reasons) || reasons.length === 0) return null
  const raw = reasons[0]
  if (!raw || typeof raw !== 'object') return null
  const reason = raw as Record<string, unknown>
  const imageUrl = typeof reason.imageUrl === 'string' ? reason.imageUrl.trim() : ''
  if (!imageUrl || !isHttp(imageUrl)) return null
  const placeRaw =
    (typeof reason.title === 'string' && reason.title.trim()) ||
    (typeof reason.imageAlt === 'string' && reason.imageAlt.trim()) ||
    'Travel highlight'
  const att = attributionForImage(imageUrl)
  return {
    imageUrl,
    place: placeRaw,
    country: countryName,
    continent: continentHint(region),
    durationMs: 4200,
    sourceName: att.sourceName,
    sourceUrl: att.sourceUrl,
  }
}

async function loadCuratedSlides(): Promise<HomeHeroSlide[]> {
  const filePath = path.join(process.cwd(), 'data', 'hero-slides.json')
  const text = await readFile(filePath, 'utf8')
  const parsed = JSON.parse(text) as unknown
  return Array.isArray(parsed) ? (parsed as HomeHeroSlide[]) : []
}

export async function buildHomeHeroSlides(): Promise<HomeHeroSlide[]> {
  let curated: HomeHeroSlide[] = []
  try {
    curated = await loadCuratedSlides()
  } catch {
    curated = []
  }

  let merged: Awaited<ReturnType<typeof buildMergedCountriesList>> = []
  try {
    merged = await buildMergedCountriesList()
  } catch {
    merged = []
  }
  const byName = new Map(merged.map((c) => [c.name, c]))

  const extras: HomeHeroSlide[] = []
  for (const name of HOMEPAGE_SHOWCASE_NAMES) {
    const row = byName.get(name)
    if (!row) continue
    const full =
      row.full_data && typeof row.full_data === 'object' && !Array.isArray(row.full_data)
        ? (row.full_data as Record<string, unknown>)
        : {}
    const slide = firstTravelHighlightSlide(name, row.region, full)
    if (slide) extras.push(slide)
  }

  const seenUrls = new Set<string>()
  for (const s of curated) {
    if (typeof s.imageUrl === 'string') seenUrls.add(s.imageUrl.trim())
  }

  const out: HomeHeroSlide[] = [...curated]
  for (const e of extras) {
    const url = e.imageUrl.trim()
    if (seenUrls.has(url)) continue
    seenUrls.add(url)
    out.push(e)
  }

  return out
}
