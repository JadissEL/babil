import { promises as fs } from 'node:fs'
import path from 'node:path'

export type WorldCountrySeed = { country: string; region: string }

function inferRegion(raw: string): string {
  const v = String(raw || 'Other')
  if (v === 'Europe') return 'Europe'
  if (v === 'Asia') return 'Asia'
  if (v === 'Africa') return 'Africa'
  if (v === 'Americas') return 'Americas'
  if (v === 'Oceania') return 'Oceania'
  return 'Other'
}

function normalizeEntry(item: unknown): WorldCountrySeed | null {
  if (!item || typeof item !== 'object') return null
  const o = item as Record<string, unknown>
  const country = String(o.country || o.name || '').trim()
  if (!country) return null
  const region = inferRegion(String(o.region || 'Other'))
  return { country, region }
}

/**
 * Loads `data/world-country-run-order.json`: fixed global order for the agents runner
 * (strictly sequential: one country per tick according to cursor, then wrap to first).
 */
export async function tryLoadWorldCountryRunOrderFile(): Promise<WorldCountrySeed[] | null> {
  const filePath = path.join(process.cwd(), 'data', 'world-country-run-order.json')
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    const out: WorldCountrySeed[] = []
    for (const item of parsed) {
      const row = normalizeEntry(item)
      if (row) out.push(row)
    }
    return out.length > 0 ? out : null
  } catch {
    return null
  }
}
