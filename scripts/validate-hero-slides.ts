import { readFileSync } from 'node:fs'
import path from 'node:path'

type HeroSlide = {
  imageUrl?: string
  place?: string
  country?: string
  continent?: string
  durationMs?: number
  sourceName?: string
  sourceUrl?: string
}

function isHttpUrl(value: string) {
  return /^https?:\/\/.+/i.test(value)
}

function main() {
  const filePath = path.join(process.cwd(), 'data', 'hero-slides.json')
  const raw = readFileSync(filePath, 'utf8')
  const parsed = JSON.parse(raw) as unknown

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('hero-slides.json must contain a non-empty array.')
  }

  const errors: string[] = []
  parsed.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      errors.push(`Slide #${index + 1}: invalid object.`)
      return
    }
    const s = entry as HeroSlide

    if (!s.imageUrl || !isHttpUrl(s.imageUrl)) {
      errors.push(`Slide #${index + 1}: imageUrl must be a valid http(s) URL.`)
    }
    if (!s.place || s.place.trim().length < 2) {
      errors.push(`Slide #${index + 1}: place is required.`)
    }
    if (!s.country || s.country.trim().length < 2) {
      errors.push(`Slide #${index + 1}: country is required.`)
    }
    if (!s.sourceName || s.sourceName.trim().length < 2) {
      errors.push(`Slide #${index + 1}: sourceName is required.`)
    }
    if (!s.sourceUrl || !isHttpUrl(s.sourceUrl)) {
      errors.push(`Slide #${index + 1}: sourceUrl must be a valid http(s) URL.`)
    }
    if (typeof s.durationMs !== 'number' || !Number.isFinite(s.durationMs) || s.durationMs < 2000) {
      errors.push(`Slide #${index + 1}: durationMs must be a number >= 2000.`)
    }
  })

  if (errors.length > 0) {
    throw new Error(`Hero slides validation failed:\n- ${errors.join('\n- ')}`)
  }

  console.log(`Hero slides validation passed (${parsed.length} verified slides).`)
}

main()
