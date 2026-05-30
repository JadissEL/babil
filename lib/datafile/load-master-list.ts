import fs from 'node:fs'
import path from 'node:path'

import type { DatafileMasterList, DatafileMasterSource } from '@/lib/datafile/types'

const MASTER_FILENAME = 'sources.master.json'

export function datafileRootFromCwd(cwd = process.cwd()): string {
  return path.join(cwd, 'datafile')
}

export function masterListPathFromCwd(cwd = process.cwd()): string {
  return path.join(datafileRootFromCwd(cwd), MASTER_FILENAME)
}

export function loadDatafileMasterList(cwd = process.cwd()): DatafileMasterList {
  const p = masterListPathFromCwd(cwd)
  if (!fs.existsSync(p)) {
    throw new Error(`Missing ${p} — run: npm run datafile:build-master`)
  }
  const raw = JSON.parse(fs.readFileSync(p, 'utf8')) as DatafileMasterList
  if (!raw?.sources?.length) {
    throw new Error(`${p} has no sources`)
  }
  return raw
}

export function slugFromDatafileId(id: string): string {
  return `datafile_${id.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '').slice(0, 72)}`
}

export function tierToPrisma(tier: DatafileMasterSource['tier']): 'TIER_A_OFFICIAL' | 'TIER_B_MULTILATERAL' | 'TIER_C_CURATED' {
  if (tier === 'official') return 'TIER_A_OFFICIAL'
  if (tier === 'multilateral') return 'TIER_B_MULTILATERAL'
  return 'TIER_C_CURATED'
}
