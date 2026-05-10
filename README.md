# Babil

Application Next.js (App Router) — moteur visa / pays, intelligence pipeline, agents.

## Prérequis

- **Node.js** 20+
- **PostgreSQL** (URL dans `DATABASE_URL`)
- Compte **Clerk** (clés dans `.env` / hébergeur)

## Démarrage rapide

```bash
npm ci
cp .env.example .env.local   # puis renseigner DATABASE_URL, Clerk, etc.
npm run db:setup             # prisma db push + seed
npm run dev
```

- **Build prod :** `npm run build` puis `npm start`
- **Render :** voir `render.yaml` et script `start:render` (migrations + seed au boot)

## Tests & qualité

| Commande | Rôle |
|----------|------|
| `npm run test:lib` | Tests `lib/**/*.test.ts` (runtime Node `tsx --test`) |
| `npm run test:vitest` | Vitest — routes API critiques (`lib/api-routes-critical.vitest.ts`) |
| `npm run lint` | ESLint (Next + `@typescript-eslint/no-explicit-any` en **warn**) |
| `npm run format:check` | Prettier sur `app/api/**`, `app/error.tsx`, dashboard `error.tsx`, `agents/**`, `lib/types/**`, `lib/api-schemas/**` |
| `npm run format` | Applique Prettier sur les mêmes chemins |
| `npm run check` | `test:lib` + `test:vitest` + `validate:schengen-keys` + `format:check` + `lint` |

## Variables d’environnement

Voir **[`.env.example`](.env.example)** : `DATABASE_URL`, Clerk, `CRON_SECRET`, pipeline intelligence (`INTELLIGENCE_*`), sécurité (`BABIL_*`, webhook ingest, rate limits moteur, etc.).

## Observabilité (Sentry — G.90)

- **Variables :** voir [`.env.example`](.env.example) (`NEXT_PUBLIC_SENTRY_DSN`, échantillonnage traces, optionnel `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` pour les source maps en build).
- **Sans DSN :** aucun envoi ; l’app se comporte comme avant.
- **Confidentialité :** le navigateur n’envoie pas l’id Clerk brut — voir [`components/SentryClerkSync.tsx`](components/SentryClerkSync.tsx) et [`lib/sentry-anon-user-id.ts`](lib/sentry-anon-user-id.ts).

## Intelligence pipeline

- **Doc :** [`docs/intelligence-cron-and-environments.md`](docs/intelligence-cron-and-environments.md), [`docs/country-intelligence-system.md`](docs/country-intelligence-system.md)
- **Cron HTTP :** `GET /api/cron/intelligence-pipeline` (secret `CRON_SECRET`)
- **Webhook signé :** `POST /api/webhooks/ingest` (secret `BABIL_WEBHOOK_INGEST_SECRET`) — événements documentés dans [`docs/catalogue-e-security.md`](docs/catalogue-e-security.md) §E.76
- **CI hebdo :** [`.github/workflows/intelligence-pipeline-weekly.yml`](.github/workflows/intelligence-pipeline-weekly.yml)

## Conventions App Router

*(Backlog F.87.)*

- **Server Components par défaut** : pas de `'use client'` sur une page ou un layout tant qu’il n’y a pas besoin de hooks React, d’écouteurs d’événements ou d’API navigateur.
- **Client** : regrouper l’UI interactive dans `components/` (ex. `DashboardLayoutClient`) ou marquer uniquement la feuille qui en a besoin.
- **Error boundaries** : [`app/error.tsx`](app/error.tsx), [`app/global-error.tsx`](app/global-error.tsx) (échec du layout racine), [`app/(dashboard)/error.tsx`](app/(dashboard)/error.tsx) (segment dashboard) — envoi Sentry si configuré (G.90).

- **Types API moteur** : préférer `import type { … } from '@/lib/types'` ([`lib/types/index.ts`](lib/types/index.ts)) pour `RecommendationApiItem`, `ProbabilityApiRow`, `EngineCountryListRow`.

## Legacy / hors Next

- Inventaire **`server.js`** (Express) vs App Router : [`docs/dead-code-and-legacy.md`](docs/dead-code-and-legacy.md).

## Autres docs utiles

- Backlog produit : [`docs/enhancements-backlog-100.md`](docs/enhancements-backlog-100.md)
- Sécurité (catalogue E) : [`docs/catalogue-e-security.md`](docs/catalogue-e-security.md)
- Agents locaux : [`agents/README.md`](agents/README.md)

## Fin de ligne (LF)

Le dépôt utilise **`.gitattributes`** pour favoriser **LF** sur les sources ; Prettier est réglé avec `"endOfLine": "lf"` sur les chemins formatés.
