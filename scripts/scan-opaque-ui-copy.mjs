#!/usr/bin/env node
/**
 * Échoue si des motifs opaques (codes EN, abréviations) apparaissent dans du texte UI.
 * Allowlist : tests, lib/ui-display-fr.ts, lib/score-level-fr.ts, enums internes.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const SCAN_DIRS = ['app', 'components', 'lib']
const EXT = new Set(['.tsx', '.ts', '.jsx', '.js'])

const ALLOWLIST_PATH_PARTS = [
  'node_modules',
  '.next',
  'ui-display-fr.ts',
  'score-level-fr.ts',
  '.test.ts',
  '.vitest.ts',
  'scan-opaque-ui-copy.mjs',
  'enrich-country-api',
  'prisma',
  'migrations',
]

const GENERIC_IMAGE_LABEL_FR = 'Photo illustrative'

/** Motifs interdits dans chaînes / JSX texte (regex sur ligne). */
const FORBIDDEN = [
  { id: 'rdv', re: /\bRDV\b/, hint: 'Utiliser « rendez-vous »' },
  { id: 'score-slash-100', re: /\/100/, hint: 'Utiliser formatScoreSur100' },
  { id: 'days-j', re: /\d+j\b/i, hint: 'Utiliser formatDelaiJours' },
  { id: 'medium-strong-weak-jsx', re: /['"`]>\s*(Strong|Medium|Weak)\s*</, hint: 'mobilityTierLabelFr' },
  { id: 'current-destination', re: /Current destination/i, hint: 'Destination actuelle' },
  { id: 'verified-location', re: /Verified location/i, hint: 'Source vérifiée' },
  { id: 'signature-place', re: /Signature place/i, hint: 'scenicPlaceLabelFr' },
  { id: 'gen-abbr', re: /\bGén\./, hint: GENERIC_IMAGE_LABEL_FR },
  { id: 'image-generique', re: /IMAGE GENERIQUE/i, hint: 'Photo illustrative' },
  { id: 'schengen-only-en', re: /SCHENGEN ONLY/i, hint: 'Pays Schengen uniquement' },
  { id: 'visa-immigration-en', re: /Visa & immigration/i, hint: 'Visa et immigration' },
  { id: 'labo-reco', re: /Labo reco/i, hint: 'Recommandations' },
  { id: 'moteur-visa', re: /Moteur visa/i, hint: 'Probabilités' },
]

function isAllowlisted(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/')
  return ALLOWLIST_PATH_PARTS.some((p) => rel.includes(p))
}

function shouldScanFile(filePath) {
  if (!EXT.has(path.extname(filePath))) return false
  if (isAllowlisted(filePath)) return false
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/')
  return SCAN_DIRS.some((d) => rel.startsWith(`${d}/`))
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    const st = fs.statSync(full)
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === '.next') continue
      walk(full, out)
    } else if (shouldScanFile(full)) {
      out.push(full)
    }
  }
  return out
}

function stripCommentsAndStrings(line) {
  // Heuristique : ignorer lignes purement import/export type
  if (/^\s*(import|export)\s/.test(line)) return ''
  return line
}

function scanFile(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/')
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
  const hits = []
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const line = stripCommentsAndStrings(raw)
    if (!line.trim()) continue
    if (/^\s*(\*|\/\/|\/\*|\*\/)/.test(line)) continue
    // Skip enum/type definitions with English keys only (Record<..., ...>)
    if (/^\s*(type|interface|enum)\s/.test(line)) continue
    if (/Record<.*Strong.*Medium/.test(line)) continue
    for (const { id, re, hint } of FORBIDDEN) {
      if (re.test(raw)) {
        hits.push({ rel, line: i + 1, id, snippet: raw.trim().slice(0, 120), hint })
      }
    }
  }
  return hits
}

const files = SCAN_DIRS.flatMap((d) => walk(path.join(ROOT, d)))
const allHits = files.flatMap(scanFile)

if (allHits.length === 0) {
  console.log(`scan-opaque-ui-copy: OK (${files.length} fichiers)`)
  process.exit(0)
}

console.error(`scan-opaque-ui-copy: ${allHits.length} occurrence(s) interdite(s)\n`)
for (const h of allHits) {
  console.error(`  ${h.rel}:${h.line} [${h.id}] ${h.hint}`)
  console.error(`    ${h.snippet}\n`)
}
process.exit(1)
