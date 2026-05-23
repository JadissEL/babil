/**
 * URL map file shape for trusted-source HTTP fetch allowlist.
 */

export type ManifestUrlMapEntry = {
  categoryId: string;
  sourceLabel: string;
  method: 'GET';
  urlTemplate: string;
  responseKind?: 'json' | 'text';
  /** When true, row satisfies CI parity without a fetchable URL (UGC, forums, manual-only). */
  skipped?: boolean;
  skipReason?: string;
};

export type ManifestUrlMapFile = {
  version: string;
  entries: ManifestUrlMapEntry[];
  _comment?: string;
};

export function isFetchableEntry(e: ManifestUrlMapEntry): boolean {
  if (e.skipped) return false;
  const u = e.urlTemplate?.trim() ?? '';
  return u.startsWith('https://');
}
