/**
 * B.37 — Paquet d’export des données personnelles stockées côté app (Prisma).
 * Ne couvre pas les données résidant uniquement chez Clerk ; le JSON rappelle ce périmètre.
 */

export const GDPR_EXPORT_SCHEMA_VERSION = 1 as const

export type GdprExportBundle = {
  _export: {
    schemaVersion: typeof GDPR_EXPORT_SCHEMA_VERSION
    exportedAt: string
    scope: string
    historyEventsMaxRows: number
  }
  user: {
    id: string
    email: string
    name: string | null
    role: string
    createdAt: string
  } | null
  profile: Record<string, unknown> | null
  comments: Array<{
    id: number
    content: string
    status: string
    createdAt: string
    countryId: number
    countryName: string
  }>
  favoriteCountries: Array<{
    id: number
    countryId: number
    countryName: string
    createdAt: string
  }>
  historyEvents: Array<{
    id: number
    type: string
    createdAt: string
    payload: unknown
  }>
  delegatedApplicationRequests: Array<{
    id: number
    category: string
    packageId: string
    status: string
    createdAt: string
    payload: unknown
  }>
}

function safeJsonParse(raw: string | null): unknown {
  if (raw == null || raw === '') return null
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return { _parseError: true, _rawLength: raw.length }
  }
}

export function buildGdprExportBundle(input: {
  exportedAt: Date
  historyEventsMaxRows: number
  user: {
    id: string
    email: string
    name: string | null
    role: string
    createdAt: Date
  } | null
  profile: Record<string, unknown> | null
  comments: Array<{
    id: number
    content: string
    status: string
    createdAt: Date
    countryId: number
    country: { name: string }
  }>
  favorites: Array<{
    id: number
    countryId: number
    createdAt: Date
    country: { name: string }
  }>
  historyEvents: Array<{
    id: number
    type: string
    payload: string | null
    createdAt: Date
  }>
  delegatedRequests: Array<{
    id: number
    category: string
    packageId: string
    status: string
    payload: string
    createdAt: Date
  }>
}): GdprExportBundle {
  return {
    _export: {
      schemaVersion: GDPR_EXPORT_SCHEMA_VERSION,
      exportedAt: input.exportedAt.toISOString(),
      scope:
        'Tables Prisma liées à votre compte (User, UserProfile, Comment, FavoriteCountry, UserHistoryEvent, DelegatedApplicationRequest). Les données de compte / session gérées par Clerk (ex. image profil, métadonnées OAuth) ne sont pas incluses — exportez-les depuis le portail Clerk si besoin.',
      historyEventsMaxRows: input.historyEventsMaxRows,
    },
    user: input.user
      ? {
          id: input.user.id,
          email: input.user.email,
          name: input.user.name,
          role: input.user.role,
          createdAt: input.user.createdAt.toISOString(),
        }
      : null,
    profile: input.profile,
    comments: input.comments.map((c) => ({
      id: c.id,
      content: c.content,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
      countryId: c.countryId,
      countryName: c.country.name,
    })),
    favoriteCountries: input.favorites.map((f) => ({
      id: f.id,
      countryId: f.countryId,
      countryName: f.country.name,
      createdAt: f.createdAt.toISOString(),
    })),
    historyEvents: input.historyEvents.map((e) => ({
      id: e.id,
      type: e.type,
      createdAt: e.createdAt.toISOString(),
      payload: safeJsonParse(e.payload),
    })),
    delegatedApplicationRequests: input.delegatedRequests.map((d) => ({
      id: d.id,
      category: d.category,
      packageId: d.packageId,
      status: d.status,
      createdAt: d.createdAt.toISOString(),
      payload: safeJsonParse(d.payload),
    })),
  }
}
