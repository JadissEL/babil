import type { SourceRef, SourcedValue, VerificationTier } from '@/lib/morocco-research-evidence';
import type { MoroccoResearchPack } from '@/lib/morocco-research-pack';

export const MOROCCO_SECTION_LABELS_FR: Partial<Record<keyof MoroccoResearchPack, string>> = {
  immigration_legal: 'Immigration et cadre légal',
  work_business: 'Travail et entreprise',
  education: 'Études et formations',
  costs_life_mad: 'Budget et coût de la vie (repères)',
  society_demographics: 'Société et démographie',
  mobility_transport: 'Mobilité et vols',
  climate_geography: 'Climat et géographie',
  special_programs: 'Programmes spéciaux',
  driving_license_detail: 'Permis de conduire (Maroc → destination)',
  qualitative_moroccan_lens: 'Lecture terrain',
  extended_criteria: 'Critères étendus',
};

export function isSourcedValue(v: unknown): v is SourcedValue<unknown> {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  return 'value' in o && 'verification' in o && typeof o.verification === 'string';
}

export function verificationLabelFr(tier: VerificationTier): string {
  switch (tier) {
    case 'official_primary':
      return 'Source officielle';
    case 'cross_checked':
      return 'Recoupée';
    case 'single_source':
      return 'Source unique';
    default:
      return 'Non validé';
  }
}

export function sourceRefsFromValue(sv: SourcedValue<unknown>): SourceRef[] {
  return Array.isArray(sv.sources) ? sv.sources : [];
}
