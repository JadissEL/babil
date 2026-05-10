import type { LegacyCountryRecord } from '@/lib/countries-fallback';

/**
 * Country row from `buildMergedCountriesList` / fallback as consumed by POST
 * `/api/recommendation` and `/api/probability` (champs optionnels issus du merge Prisma).
 */
export type EngineCountryListRow = LegacyCountryRecord & {
  visa?: Record<string, unknown>;
  friction?: Record<string, unknown>;
  education?: Record<string, unknown>;
  business?: Record<string, unknown>;
  street_food_business_access?: string | null;
};
