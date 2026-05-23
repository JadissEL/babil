/**
 * Taxonomy paths for manifest HTTP snapshots (staging — not auto-materialized to Country).
 */

export function slugifyManifestSegment(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 48);
}

export function manifestExcerptFieldPath(categoryId: string, sourceLabel: string): string {
  return `provenance.manifest.${slugifyManifestSegment(categoryId)}.${slugifyManifestSegment(sourceLabel)}`;
}

export function manifestDedupeKey(
  countryId: number,
  categoryId: string,
  sourceLabel: string,
): string {
  return `manifest:${countryId}:${categoryId}:${slugifyManifestSegment(sourceLabel)}`;
}
