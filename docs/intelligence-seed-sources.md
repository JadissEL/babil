# Seed des sources intelligence (C.47)

Reproduire le **catalogue `IntelligenceSource`** sur une base PostgreSQL neuve (ou après `prisma migrate deploy`).

## Prérequis

1. Variable **`DATABASE_URL`** pointant vers la base cible (même URL que l’app / Render / workflow GitHub).
2. Schéma à jour : `npm run db:migrate-deploy` (ou `npx prisma migrate deploy`).
3. Client Prisma généré : `npx prisma generate` (ou `npm ci`, qui lance `postinstall` → `prisma generate`).

## Commande

```bash
npm run intelligence:seed-sources
```

Alias CLI : `npx tsx scripts/intelligence-enrichment-pipeline.ts --seed-sources-only`

## Contenu

Le script appelle [`seedIntelligenceSources`](../lib/intelligence-pipeline/run-enrichment-stub.ts), qui upsert les entrées définies dans [`default-sources.ts`](../lib/intelligence-pipeline/default-sources.ts) :

| slug | Rôle |
|------|------|
| `world_bank_open_data` | Connecteur WB (collecte batch) |
| `un_data`, `oecd`, `imf_data`, `ilo_stat` | Stubs / multilatéraux (extension) |
| `babil_curated_research` | Recherche éditoriale interne |

Les lignes sont **idempotentes** (upsert par `slug`) : relancer la commande est sans danger.

## Ordre recommandé sur nouvelle base

1. `npm run db:migrate-deploy`
2. `npm run intelligence:seed-sources`
3. `npm run seed` (pays depuis `data/countries.json`, voir `prisma/seed.ts`)
4. Pipeline : `npm run intelligence:world-bank:materialize` (ou workflow GitHub hebdomadaire)

Voir aussi [country-intelligence-system.md](country-intelligence-system.md), [intelligence-pipeline-queue.md](intelligence-pipeline-queue.md).
