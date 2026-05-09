# File d’attente pipeline intelligence (C.45)

Les fonctions serverless (Vercel) peuvent **timeout** avant la fin d’un run World Bank + matérialisation. Ce module introduit une **queue DB** (`IntelligencePipelineJob`) traitée par un **worker long-running** (machine dédiée, Render, GitHub Actions long, ou boucle locale).

## Modèle

- `kind` : libellé libre (ex. `world_bank_materialize`).
- `status` : `PENDING` → `RUNNING` → `SUCCEEDED` | `FAILED`.
- `payloadJson` : arguments sérialisés pour [`runEnrichmentPipeline`](../lib/intelligence-pipeline/run-enrichment-stub.ts) (`worldBank`, `materializeEconomy`, `worldBankLimit`, `stubMultilateralCollectors`, `trigger`).

## Commandes

```bash
# Enfiler (au moins un flag métier)
npm run intelligence:enqueue-job -- --kind=world_bank_materialize --world-bank --materialize
npm run intelligence:enqueue-job -- --kind=stubs --stub-collectors
npm run intelligence:enqueue-job -- --kind=wb_limited --world-bank --limit 10

# Traiter un seul job puis quitter
npm run intelligence:worker-once
```

## Idempotence World Bank (C.43)

Les écritures WB utilisent `CountryObservation.dedupeKey` (`wb:v1:{indicator}:{ISO2}:{year}`) et **`upsert`** : une reprise ne multiplie pas les lignes pour la même série.

## Sources multilatérales (C.44)

`npm run intelligence:pipeline -- --stub-collectors` (ou combiné avec `--world-bank`) exécute les **stubs** `un_data`, `oecd`, `imf_data` : pas d’appel réseau ; vérifie que les lignes `IntelligenceSource` existent après `intelligence:seed-sources`.

## Limites MVP

- Un seul worker à la fois recommandé (pas de `SKIP LOCKED` sur la sélection de job).
- Pas d’API HTTP d’enqueue dans ce lot — utiliser le script ou Prisma Studio.

## Déploiement / CI

Le workflow GitHub **[`.github/workflows/intelligence-pipeline-weekly.yml`](../.github/workflows/intelligence-pipeline-weekly.yml)** exécute **`npm run db:migrate-deploy`** avant le seed et le run World Bank, pour que la base cible (secret `DATABASE_URL`) ait toujours le schéma à jour (`dedupeKey`, `IntelligencePipelineJob`, etc.). Les environnements Vercel/Render qui **ne** passent pas par ce workflow doivent appliquer les migrations séparément (`prisma migrate deploy` avec la même `DATABASE_URL`).

Voir aussi [country-intelligence-system.md](country-intelligence-system.md).
