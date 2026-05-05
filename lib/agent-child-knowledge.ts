/**
 * Versioned declarative policy for the child enrichment runner.
 * Runtime state: `.agent-state/child-agent/`; committed defaults: `data/child-agent-bootstrap/`.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'

const CHILD_AGENT_STATE = path.join(process.cwd(), '.agent-state', 'child-agent')
const BOOTSTRAP = path.join(process.cwd(), 'data', 'child-agent-bootstrap')

export type ChildAgentPolicy = {
  maxShadowPasses: number
  prioritizedCriticalKeys: string[]
}

export type LoadedChildKnowledge = {
  version: string
  policy: ChildAgentPolicy
}

function defaultPolicy(): ChildAgentPolicy {
  return { maxShadowPasses: 1, prioritizedCriticalKeys: [] }
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string')
}

function validatePolicy(raw: unknown): ChildAgentPolicy | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const maxShadowPasses = o.maxShadowPasses
  if (typeof maxShadowPasses !== 'number' || !Number.isFinite(maxShadowPasses) || maxShadowPasses < 1 || maxShadowPasses > 8)
    return null
  let prioritizedCriticalKeys: string[] = []
  if (o.prioritizedCriticalKeys !== undefined) {
    if (!isStringArray(o.prioritizedCriticalKeys)) return null
    prioritizedCriticalKeys = o.prioritizedCriticalKeys
  }
  return { maxShadowPasses: Math.floor(maxShadowPasses), prioritizedCriticalKeys }
}

async function tryLoadFromBase(base: string): Promise<LoadedChildKnowledge | null> {
  const currentPath = path.join(base, 'current.json')
  const raw = await fs.readFile(currentPath, 'utf8')
  const cur = JSON.parse(raw) as { activeVersion?: string }
  const v =
    typeof cur.activeVersion === 'string' && /^v\d+$/.test(cur.activeVersion.trim())
      ? cur.activeVersion.trim()
      : null
  if (!v) return null
  const policyPath = path.join(base, v, 'policy.json')
  const polRaw = await fs.readFile(policyPath, 'utf8')
  const pol = JSON.parse(polRaw) as unknown
  const policy = validatePolicy(pol)
  if (!policy) return null
  return { version: v, policy }
}

export async function loadChildKnowledge(): Promise<LoadedChildKnowledge> {
  for (const base of [CHILD_AGENT_STATE, BOOTSTRAP]) {
    try {
      await fs.mkdir(base, { recursive: true })
      const loaded = await tryLoadFromBase(base)
      if (loaded) return loaded
    } catch {
      /* try next */
    }
  }
  return { version: 'v0', policy: defaultPolicy() }
}
