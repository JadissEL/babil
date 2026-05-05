/**
 * Mirror DATABASE_URL + Clerk keys into Vercel **Preview** for all Preview deployments.
 *
 * Loads `.env` then `.env.local` (later wins), matching typical Next.js local setup.
 *
 * Run: node tooling/sync-vercel-preview-env.mjs
 *
 * **Why:** `npx vercel env add … preview --value …` fails non-interactively with `git_branch_required`
 * (cannot target “all Preview branches”; production branch names are rejected for Preview-targeted CLI adds).
 *
 * Options:
 * - **Recommended:** set `VERCEL_TOKEN` from https://vercel.com/account/tokens — script uses REST API (`gitBranch: null`).
 * - **CLI fallback:** set `VERCEL_PREVIEW_GIT_BRANCH` to a **non-production** remote branch — script runs `vercel env add … preview <branch>`.
 */
import fs from 'node:fs'
import { spawnSync } from 'node:child_process'

function parseEnv(contents) {
  const out = {}
  for (const line of contents.split(/\r?\n/)) {
    if (/^\s*#/.test(line)) continue
    const m = /^\s*([A-Za-z_][\w]*)\s*=\s*(.*)?\s*$/.exec(line)
    if (!m) continue
    let v = m[2] ?? ''
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    out[m[1]] = v
  }
  return out
}

function loadEnvFiles() {
  const merged = {}
  for (const file of ['.env', '.env.local']) {
    try {
      Object.assign(merged, parseEnv(fs.readFileSync(file, 'utf8')))
    } catch {
      // optional files
    }
  }
  if (Object.keys(merged).length === 0) {
    console.error('No variables found — add .env or .env.local in project root.')
    process.exit(1)
  }
  return merged
}

function loadVercelMeta() {
  try {
    const j = JSON.parse(fs.readFileSync('.vercel/project.json', 'utf8'))
    const projectId = j.projectId
    const teamId = j.orgId
    if (!projectId || !teamId) throw new Error('missing projectId/orgId')
    return { projectId, teamId }
  } catch {
    console.error('Missing `.vercel/project.json` — run `npx vercel link` from the repo root.')
    process.exit(1)
  }
}

function vercelEnvType(key, sensitiveCliStyle) {
  if (key.startsWith('NEXT_PUBLIC_')) return 'plain'
  return sensitiveCliStyle ? 'sensitive' : 'plain'
}

async function addPreviewApi({ token, teamId, projectId, key, value, sensitive }) {
  const type = vercelEnvType(key, sensitive)
  const qs = new URLSearchParams({ teamId, upsert: 'true' })
  const url = `https://api.vercel.com/v10/projects/${encodeURIComponent(projectId)}/env?${qs}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key,
      value,
      type,
      target: ['preview'],
      gitBranch: null,
    }),
  })
  const text = await res.text()
  let body
  try {
    body = JSON.parse(text)
  } catch {
    body = text
  }
  if (!res.ok) {
    console.error(`API failed (${key}) ${res.status}:`, typeof body === 'string' ? body : JSON.stringify(body, null, 2))
    return false
  }
  console.log(`OK Preview (API): ${key}`)
  return true
}

function addPreviewCli(name, value, sensitive, gitBranch) {
  const args = ['vercel', 'env', 'add', name, 'preview']
  if (gitBranch) args.push(gitBranch)
  args.push(
    '--yes',
    '--force',
    '--value',
    value,
    ...(sensitive ? ['--sensitive'] : ['--no-sensitive']),
    '--cwd',
    process.cwd(),
  )
  const r = spawnSync('npx', args, {
    encoding: 'utf8',
    shell: true,
    env: { ...process.env, CI: '', FORCE_COLOR: '0' },
  })
  if (r.status !== 0) {
    console.error(`Failed (${name}):\n`, r.stderr?.trim?.() || r.stdout?.trim?.() || '')
    return false
  }
  console.log(`OK Preview (CLI): ${name}`)
  return true
}

function printInstructions() {
  console.error(`
Could not sync Preview env vars automatically.

Cause: Vercel CLI refuses non-interactive Preview adds unless you pin a Git branch (and never the production branch).

Fix — pick one:

  1) Set VERCEL_TOKEN (https://vercel.com/account/tokens) and re-run this script.

  2) Set VERCEL_PREVIEW_GIT_BRANCH to a branch that exists on the remote AND is not your Production Branch,
     then re-run (variables apply only to preview deployments from that branch).

  3) Add DATABASE_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY for Preview “All branches” in the dashboard.
`)
}

const keys = ['DATABASE_URL', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY']

async function main() {
  const envVars = loadEnvFiles()
  const token = process.env.VERCEL_TOKEN || process.env.VERCEL_ACCESS_TOKEN || ''
  const previewBranch = (process.env.VERCEL_PREVIEW_GIT_BRANCH || '').trim()

  let ok = true
  for (const k of keys) {
    const v = envVars[k]
    if (!v) {
      console.error(`Missing ${k} in .env or .env.local`)
      ok = false
    }
  }
  if (!ok) process.exit(1)

  if (token) {
    const { projectId, teamId } = loadVercelMeta()
    for (const k of keys) {
      const v = envVars[k]
      const sensitive = k !== 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'
      ok = (await addPreviewApi({ token, teamId, projectId, key: k, value: v, sensitive })) && ok
    }
    process.exit(ok ? 0 : 1)
  }

  if (!previewBranch) {
    printInstructions()
    process.exit(1)
  }

  for (const k of keys) {
    const v = envVars[k]
    const sensitive = k !== 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'
    ok = addPreviewCli(k, v, sensitive, previewBranch) && ok
  }

  process.exit(ok ? 0 : 1)
}

main()
