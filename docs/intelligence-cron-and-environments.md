# Cron intelligence, environnements et reprise (C.51)

Ce document complète [country-intelligence-system.md](country-intelligence-system.md) et [intelligence-pipeline-queue.md](intelligence-pipeline-queue.md) pour l’**exploitation** (secrets, où tourne quoi, que faire en cas d’échec partiel).

## Où s’exécute le pipeline ?

| Déclencheur | Fichier / config | Base de données | Durée typique |
|-------------|------------------|-----------------|---------------|
| **Vercel Cron** | [`vercel.json`](../vercel.json) → `GET /api/cron/intelligence-pipeline` (dim. 04:00 UTC) | `DATABASE_URL` du projet Vercel (Production) | Limitée par `maxDuration` (300 s sur la route) |
| **GitHub Actions** | [`.github/workflows/intelligence-pipeline-weekly.yml`](../.github/workflows/intelligence-pipeline-weekly.yml) | Secret repo **`DATABASE_URL`** | Jusqu’à 45 min |
| **Webhook signé** | `POST /api/webhooks/ingest` avec `event: intelligence.pipeline.run` (secret **`BABIL_WEBHOOK_INGEST_SECRET`**, signature HMAC — voir [catalogue-e-security.md](catalogue-e-security.md) §E.76) | Même `DATABASE_URL` que l’app qui reçoit le POST | `maxDuration` 300 s sur la route ingest |
| **Manuel / Render** | `npm run intelligence:world-bank:materialize`, worker, etc. | `DATABASE_URL` de l’environnement shell | Selon machine |

**Preview Vercel** : les crons Vercel ciblent en général la **production**. Les previews n’ont souvent pas les mêmes secrets ; ne pas supposer que le cron preview écrit sur la même base que la prod.

## Secrets et auth

### `CRON_SECRET` (route Vercel)

La route [`app/api/cron/intelligence-pipeline/route.ts`](../app/api/cron/intelligence-pipeline/route.ts) exige :

- En-tête **`Authorization: Bearer <CRON_SECRET>`**, ou
- Query **`?secret=<CRON_SECRET>`** (moins recommandé : fuite possible dans les logs).

Si `CRON_SECRET` est absent → **503**. Si le secret ne correspond pas → **401**.

À configurer dans le dashboard Vercel (Environment Variables) pour **Production** (et éventuellement Preview si vous testez le cron sur une preview).

### `BABIL_WEBHOOK_INGEST_SECRET` (webhook pipeline)

Alternative au cron HTTP : `POST /api/webhooks/ingest` avec corps JSON signé (HMAC sur le corps brut) peut déclencher le même orchestrateur que le cron lorsque `event` vaut `intelligence.pipeline.run` — voir [catalogue-e-security.md](catalogue-e-security.md) §E.76. Secret **distinct** de `CRON_SECRET`.

- **Vercel** : variable d’environnement du projet (souvent Production + Preview selon votre politique).
- **GitHub Actions** : secret **`DATABASE_URL`** (PostgreSQL cible, même chaîne que celle utilisée par l’app en prod si le pipeline doit alimenter le site).

Ne commitez jamais l’URL complète ; utilisez les stores de secrets des plateformes.

### Désactivation de collecte par source (C.52)

Variable **`INTELLIGENCE_SOURCE_DISABLED_SLUGS`** : liste de slugs séparés par des virgules (ex. `world_bank_open_data,oecd`). Voir [source-collection-flags.ts](../lib/intelligence-pipeline/source-collection-flags.ts).  
À définir sur **Vercel**, **Render**, ou dans le workflow GitHub (`env:` sur le job) si vous devez couper une source sans déployer du code.

### Timeouts HTTP World Bank (D.61)

Les appels sortants du client [`world-bank-client.ts`](../lib/intelligence-pipeline/world-bank-client.ts) utilisent **`intelligencePipelineFetch`** ([`http-fetch.ts`](../lib/intelligence-pipeline/http-fetch.ts)) avec **`INTELLIGENCE_HTTP_TIMEOUT_MS`** (défaut 45 s, max 120 s). Évite les workers bloqués si l’API WB ne répond pas.

## Matérialisation partielle et « rollback »

- **Collecte WB** : écritures **idempotentes** via `dedupeKey` + `upsert` — une reprise ne duplique pas les séries pour la même année/indicateur/pays.
- **Matérialisation** : `materializeEconomyObservationsForAllCountries` met à jour les pays **un par un**. Si le processus s’arrête au milieu, une partie des `Country.full_data` peut refléter la dernière exécution et l’autre non.
  - **Reprise** : relancer uniquement la matérialisation : cron **`?mode=materialize`** ou `npm run intelligence:materialize-economy` (ou équivalent sur la même base).
- **Rollback** : il n’y a pas de rollback automatique du JSON `full_data`. En incident grave, restaurer une **sauvegarde PostgreSQL** ou réinjecter les pays depuis `data/countries.json` + pipeline, selon votre procédure interne.
- **Traçabilité** : chaque run crée un `EnrichmentRun` (statut, `statsJson`, `errorSummary`). Les alertes C.42 ([enrichment-run-alerts.md](enrichment-run-alerts.md)) signalent les runs bloqués ou dégradés.

## Checklist rapide après incident

1. Consulter le dernier `EnrichmentRun` (admin Intelligence ou base).
2. Corriger la cause (quota API, timeout, schéma, secret manquant).
3. `prisma migrate deploy` si le schéma était en retard.
4. Relancer **collecte** et/ou **matérialisation** selon le besoin (full vs `materialize` seul).

Voir aussi [environments-preview-database-g94.md](environments-preview-database-g94.md) (preview vs prod), [runbooks-incidents-g95.md](runbooks-incidents-g95.md) (incidents), [observability-budget-alerts-g93.md](observability-budget-alerts-g93.md) (coût / volume d’appels).

Voir aussi [intelligence-seed-sources.md](intelligence-seed-sources.md) pour l’ordre migrate → seed sources → seed pays.
