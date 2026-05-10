import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  isMutationHttpMethod,
  mutationOriginMatchesAllowlist,
  parseConfiguredMutationOrigins,
} from '@/lib/mutation-origin-guard'

const envKeys = [
  'NEXT_PUBLIC_APP_URL',
  'BABIL_APP_URL',
  'BABIL_ALLOWED_ORIGINS',
  'VERCEL_URL',
  'RENDER_EXTERNAL_URL',
] as const

function snapshotEnv(): Record<string, string | undefined> {
  const o: Record<string, string | undefined> = {}
  for (const k of envKeys) o[k] = process.env[k]
  return o
}

function restoreEnv(prev: Record<string, string | undefined>) {
  for (const k of envKeys) {
    const v = prev[k]
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }
}

test('isMutationHttpMethod', () => {
  assert.equal(isMutationHttpMethod('GET'), false)
  assert.equal(isMutationHttpMethod('post'), true)
  assert.equal(isMutationHttpMethod('PATCH'), true)
})

test('mutationOriginMatchesAllowlist respects Origin and Referer', () => {
  const allowed = new Set(['https://app.example.com'])
  assert.equal(
    mutationOriginMatchesAllowlist('POST', 'https://app.example.com', null, allowed),
    true,
  )
  assert.equal(
    mutationOriginMatchesAllowlist('POST', 'https://evil.example', null, allowed),
    false,
  )
  assert.equal(
    mutationOriginMatchesAllowlist(
      'POST',
      null,
      'https://app.example.com/profile',
      allowed,
    ),
    true,
  )
  assert.equal(mutationOriginMatchesAllowlist('GET', 'https://evil.example', null, allowed), true)
  assert.equal(mutationOriginMatchesAllowlist('POST', 'null', null, allowed), false)
})

test('mutationOriginMatchesAllowlist fails closed when allowlist empty', () => {
  const allowed = new Set<string>()
  assert.equal(
    mutationOriginMatchesAllowlist('POST', 'https://app.example.com', null, allowed),
    false,
  )
})

test('parseConfiguredMutationOrigins merges env', () => {
  const prev = snapshotEnv()
  try {
    process.env.NEXT_PUBLIC_APP_URL = 'https://a.example.com/path'
    process.env.BABIL_ALLOWED_ORIGINS = 'https://b.example.com, https://c.example.com/foo'
    process.env.VERCEL_URL = 'x.vercel.app'
    process.env.RENDER_EXTERNAL_URL = 'https://svc.onrender.com'
    const list = parseConfiguredMutationOrigins()
    assert.ok(list.includes('https://a.example.com'))
    assert.ok(list.includes('https://b.example.com'))
    assert.ok(list.includes('https://c.example.com'))
    assert.ok(list.includes('https://x.vercel.app'))
    assert.ok(list.includes('https://svc.onrender.com'))
  } finally {
    restoreEnv(prev)
  }
})
