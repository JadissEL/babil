/**
 * B.34 / B.35 — Contrat partagé profil utilisateur (objectif + profession).
 * Stockage Prisma en **snake_case** / minuscules côté `UserProfile`.
 */

export const USER_GOAL_TYPES = ['tourism', 'study', 'work', 'business', 'short_course'] as const
export type UserGoalType = (typeof USER_GOAL_TYPES)[number]

export const USER_PROFESSIONS = [
  'salaried',
  'self-employed',
  'freelance',
  'public',
  'unemployed',
  'student',
  'retired',
  'other',
] as const
export type UserProfession = (typeof USER_PROFESSIONS)[number]

export type EngineGoalUppercase = 'TOURISM' | 'STUDY' | 'WORK' | 'BUSINESS' | 'SHORT_COURSE'

const GOAL_SYNONYMS: Record<string, UserGoalType> = {
  tourism: 'tourism',
  tourisme: 'tourism',
  study: 'study',
  studies: 'study',
  education: 'study',
  etudes: 'study',
  work: 'work',
  travail: 'work',
  business: 'business',
  affaires: 'business',
  short_course: 'short_course',
  shortcourse: 'short_course',
  cours: 'short_course',
}

/** Objectif utilisateur normalisé, ou `null` si absent / inconnu. */
export function parseUserGoalType(raw: unknown): UserGoalType | null {
  if (raw === null || raw === undefined) return null
  const s = String(raw)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/-/g, '_')
  if (!s) return null
  if (GOAL_SYNONYMS[s]) return GOAL_SYNONYMS[s]
  if ((USER_GOAL_TYPES as readonly string[]).includes(s)) return s as UserGoalType
  return null
}

/** Objectif pour les moteurs (majuscules). Défaut : tourisme. */
export function userGoalTypeToEngineGoal(goal: UserGoalType | null): EngineGoalUppercase {
  const g = goal ?? 'tourism'
  const map: Record<UserGoalType, EngineGoalUppercase> = {
    tourism: 'TOURISM',
    study: 'STUDY',
    work: 'WORK',
    business: 'BUSINESS',
    short_course: 'SHORT_COURSE',
  }
  return map[g]
}

/** Profession normalisée, ou `null` si absente. */
export function parseUserProfession(raw: unknown): UserProfession | null {
  if (raw === null || raw === undefined) return null
  const s = String(raw).trim().toLowerCase()
  if (!s) return null
  if ((USER_PROFESSIONS as readonly string[]).includes(s)) return s as UserProfession
  return null
}

/** Valeur stockée illisible → `other` pour l’UI / scoring stable. */
export function coerceStoredProfession(raw: string | null): UserProfession | null {
  if (raw === null || raw === undefined || !String(raw).trim()) return null
  return parseUserProfession(raw) ?? 'other'
}
