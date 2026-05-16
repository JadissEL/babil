import type { MoroccoResearchPack } from '@/lib/morocco-research-pack';
import {
  EXPLICIT_UNKNOWN_ACCEPTANCE_FR,
  MOROCCO_PACK_VERSION,
  MOROCCO_SECTION_SCAFFOLD_SUMMARIES,
} from '@/lib/morocco-content-constants';
import type { ManifestFetchResultItem } from '@/lib/agent-manifest-source-fetch';
import type { SourcedValue } from '@/lib/morocco-research-evidence';

const SECTION_KEYS = [
  'immigration_legal',
  'work_business',
  'education',
  'costs_life_mad',
  'society_demographics',
  'mobility_transport',
  'climate_geography',
  'special_programs',
  'driving_license_detail',
  'qualitative_moroccan_lens',
  'extended_criteria',
] as const satisfies readonly (keyof MoroccoResearchPack)[];

function isPlainRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/** Ensure every Morocco corridor section exists with honest scaffold copy; preserve existing deep content. */
export function ensureMoroccoResearchPackScaffold(existing: unknown): MoroccoResearchPack {
  const base = isPlainRecord(existing) ? { ...existing } : {};
  const out = base as MoroccoResearchPack;
  if (!out._pack_version || typeof out._pack_version !== 'string' || !out._pack_version.trim()) {
    out._pack_version = MOROCCO_PACK_VERSION;
  }
  for (const key of SECTION_KEYS) {
    const summaryDefault = MOROCCO_SECTION_SCAFFOLD_SUMMARIES[key] ?? '';
    const cur = out[key];
    if (!isPlainRecord(cur)) {
      (out as Record<string, unknown>)[key] = { summary: summaryDefault };
      continue;
    }
    const section = { ...cur };
    const s = section.summary;
    if (typeof s !== 'string' || !s.trim()) {
      section.summary = summaryDefault;
    }
    (out as Record<string, unknown>)[key] = section;
  }
  return out;
}

function inferPackSectionForCategory(categoryId: string): keyof MoroccoResearchPack | null {
  const c = categoryId.toLowerCase();
  if (/visa|immigration|consul|schengen|entry|resid/.test(c)) return 'immigration_legal';
  if (/work|business|employ|labou|r?h\b/.test(c)) return 'work_business';
  if (/edu|study|univers|school|student/.test(c)) return 'education';
  if (/flight|transport|mobil|air/.test(c)) return 'mobility_transport';
  if (/cost|price|housing|rent|col|numbeo|infla/.test(c)) return 'costs_life_mad';
  if (/climate|weather|geograph|demograph/.test(c)) return 'climate_geography';
  return 'extended_criteria';
}

/**
 * Attach manifest HTTP excerpts as `sourced_entries` (unverified) for human triage.
 * Never overwrites an existing keyed entry.
 */
export function mergeManifestFetchIntoMoroccoPack(
  pack: MoroccoResearchPack,
  manifest:
    | {
        results?: Array<
          Pick<
            ManifestFetchResultItem,
            'categoryId' | 'sourceLabel' | 'url' | 'ok' | 'excerpt' | 'fetchedAt'
          >
        >;
      }
    | null
    | undefined,
): MoroccoResearchPack {
  if (!manifest || !Array.isArray(manifest.results)) return pack;
  const next = { ...pack } as Record<string, unknown>;

  for (const r of manifest.results) {
    if (!r || !r.ok || !r.excerpt || typeof r.excerpt !== 'string' || !r.excerpt.trim()) continue;
    const sectionKey = inferPackSectionForCategory(r.categoryId);
    if (!sectionKey) continue;
    const sectionRaw = next[sectionKey];
    const section: Record<string, unknown> = isPlainRecord(sectionRaw)
      ? { ...sectionRaw }
      : { summary: '' };
    const sourced = isPlainRecord(section.sourced_entries)
      ? { ...(section.sourced_entries as Record<string, unknown>) }
      : {};
    const entryKey = `manifest_${r.categoryId}`.replace(/[^a-zA-Z0-9_]/g, '_');
    if (sourced[entryKey]) continue;
    const sv: SourcedValue<string> = {
      value: r.excerpt.slice(0, 8000),
      verification: 'unverified',
      asOf: r.fetchedAt,
      notes: `Extrait automatique — ${r.sourceLabel}. Revue humaine requise.`,
      sources: [
        { url: r.url, label: r.sourceLabel, retrievedAt: r.fetchedAt, kind: 'http_get_excerpt' },
      ],
    };
    sourced[entryKey] = sv;
    section.sourced_entries = sourced;
    next[sectionKey] = section;
  }
  return next as MoroccoResearchPack;
}

/** Normalize legacy seed / static blobs before launch gate or public responses (idempotent). */
export function hydrateFullDataMoroccoLaunchDefaults(
  fullData: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...fullData };
  const acc = next.acceptance_rate_morocco;
  if (acc === '60%' || acc === undefined || acc === null) {
    next.acceptance_rate_morocco = EXPLICIT_UNKNOWN_ACCEPTANCE_FR;
  }
  next.morocco_research_pack = ensureMoroccoResearchPackScaffold(next.morocco_research_pack);
  return next;
}
