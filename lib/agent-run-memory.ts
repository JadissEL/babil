import { promises as fs } from 'node:fs'
import path from 'node:path'

const ORCH_DIR = path.join(process.cwd(), '.agent-state', 'orchestration')
const MAX_ERRORS = 40
const MAX_CYCLES = 120

export type RunMemoryCycle = {
  id: string
  at: string
  fromPhase: string
  toPhase: string
  trigger: string
  criticalMissingCount: number
  completenessScore: number
  sourceFingerprint?: string
}

export type RunMemoryError = {
  at: string
  message: string
  phase?: string
}

export type RunMemory = {
  countryKey: string
  lastUpdatedAt: string
  planEpoch: number
  currentState: string
  improvementCycle: number
  cycles: RunMemoryCycle[]
  errors: RunMemoryError[]
  sourcesIndex: Record<string, { firstUsedAt: string; fields: string[]; fetchStatus: string }>
}

export function orchestrationSlugForCountry(country: string): string {
  return country
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function memoryPath(slug: string): string {
  return path.join(ORCH_DIR, `${slug}.json`)
}

export async function loadRunMemory(country: string): Promise<RunMemory> {
  const countryKey = country.trim()
  const slug = orchestrationSlugForCountry(countryKey)
  await fs.mkdir(ORCH_DIR, { recursive: true })
  try {
    const raw = await fs.readFile(memoryPath(slug), 'utf8')
    const parsed = JSON.parse(raw) as Partial<RunMemory>
    return {
      countryKey: typeof parsed.countryKey === 'string' ? parsed.countryKey : countryKey,
      lastUpdatedAt: typeof parsed.lastUpdatedAt === 'string' ? parsed.lastUpdatedAt : new Date().toISOString(),
      planEpoch: typeof parsed.planEpoch === 'number' ? parsed.planEpoch : 0,
      currentState:
        typeof parsed.currentState === 'string' ? parsed.currentState : 'initialized',
      improvementCycle: typeof parsed.improvementCycle === 'number' ? parsed.improvementCycle : 0,
      cycles: Array.isArray(parsed.cycles) ? parsed.cycles.slice(-MAX_CYCLES) : [],
      errors: Array.isArray(parsed.errors) ? parsed.errors.slice(-MAX_ERRORS) : [],
      sourcesIndex:
        parsed.sourcesIndex && typeof parsed.sourcesIndex === 'object'
          ? (parsed.sourcesIndex as RunMemory['sourcesIndex'])
          : {},
    }
  } catch {
    return {
      countryKey,
      lastUpdatedAt: new Date().toISOString(),
      planEpoch: 0,
      currentState: 'initialized',
      improvementCycle: 0,
      cycles: [],
      errors: [],
      sourcesIndex: {},
    }
  }
}

export async function saveRunMemory(mem: RunMemory): Promise<{ relativePath: string }> {
  const slug = orchestrationSlugForCountry(mem.countryKey)
  await fs.mkdir(ORCH_DIR, { recursive: true })
  mem.lastUpdatedAt = new Date().toISOString()
  mem.cycles = mem.cycles.slice(-MAX_CYCLES)
  mem.errors = mem.errors.slice(-MAX_ERRORS)
  const file = memoryPath(slug)
  await fs.writeFile(file, JSON.stringify(mem, null, 2), 'utf8')
  return { relativePath: path.relative(process.cwd(), file) }
}

export function appendOrchestrationCycle(
  mem: RunMemory,
  cycle: Omit<RunMemoryCycle, 'id'> & { id?: string },
): void {
  const id = cycle.id ?? `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  mem.cycles.push({
    ...cycle,
    id,
  })
  mem.planEpoch += 1
}

export function recordRunMemoryError(mem: RunMemory, message: string, phase?: string): void {
  mem.errors.push({ at: new Date().toISOString(), message, phase })
}

export function fingerprintSources(inputs: Record<string, unknown>): string {
  const keys = Object.keys(inputs).sort()
  let s = ''
  for (const k of keys) {
    const v = inputs[k]
    s += `${k}:${typeof v === 'object' ? JSON.stringify(v)?.slice(0, 120) : String(v)}|`
  }
  return `${s.length}:${s.slice(0, 512)}`
}
