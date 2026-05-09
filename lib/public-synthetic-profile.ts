/**
 * Profil « bac à sable » pour visiteurs sur `/recommendation-engine` (POST avec `playground: true`).
 * Valeurs bornées pour éviter abus numériques ; ne remplace pas le profil démo sur `/recommendations`.
 */

import { parseUserGoalType, parseUserProfession } from '@/lib/user-profile-enums'

const MAX_MAD = 15_000_000

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function sanitizePublicSyntheticProfile(raw: Record<string, unknown>): Record<string, unknown> {
  const income = clamp(Number(raw.income ?? 0), 0, MAX_MAD)
  const savings = clamp(Number(raw.savings ?? 0), 0, MAX_MAD)
  const ageRaw = Number.parseInt(String(raw.age ?? ''), 10)
  const age =
    Number.isFinite(ageRaw) && ageRaw >= 16 && ageRaw <= 120 ? ageRaw : undefined

  const marital = String(raw.marital_status ?? raw.maritalStatus ?? 'single').toLowerCase()
  const marital_status = marital === 'married' ? 'married' : 'single'

  const rawProf =
    typeof raw.profession === 'string' && raw.profession.trim()
      ? raw.profession.trim().slice(0, 64)
      : ''
  const profession = parseUserProfession(rawProf) ?? 'salaried'

  const goal_type = parseUserGoalType(raw.goal_type ?? raw.goal) ?? 'tourism'

  const out: Record<string, unknown> = {
    income,
    savings,
    CNSS_status: Boolean(raw.CNSS_status ?? raw.cnss),
    marital_status,
    family_in_europe: Boolean(raw.family_in_europe ?? raw.familyInEU),
    family_details:
      typeof raw.family_details === 'string' ? raw.family_details.trim().slice(0, 2000) : '',
    profession,
    goal_type,
  }
  if (age !== undefined) out.age = age
  return out
}
