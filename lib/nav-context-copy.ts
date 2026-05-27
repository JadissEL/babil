import { getObjectiveBySlug } from '@/lib/user-objectives/registry';

/** One-line strapline for primary nav rail under objective picker. */
export function navContextStraplineForSlug(slug: string | null | undefined): string | null {
  const def = getObjectiveBySlug(slug);
  if (!def) return null;
  const topic = def.focusTopicsFr[0];
  if (!topic) return `Parcours ${def.labelFr}`;
  return `Parcours ${def.labelFr} · ${topic}`;
}
