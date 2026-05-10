# Runbooks incidents (G.95)

Procédures courtes pour les scénarios les plus fréquents. Détail pipeline : [intelligence-cron-and-environments.md](intelligence-cron-and-environments.md), alertes runs : [enrichment-run-alerts.md](enrichment-run-alerts.md).

## 1. Pipeline intelligence cassé ou dégradé

**Symptômes** : dernier `EnrichmentRun` en `FAILED` / `PARTIAL` ; bandeau ou API admin Intelligence en alerte ; données économie WB obsolètes.

**Étapes**

1. Ouvrir l’onglet **Intelligence** sur `/admin` ou lire `EnrichmentRun` en base (`status`, `errorSummary`, `statsJson`).
2. Vérifier **secrets** : `CRON_SECRET`, `DATABASE_URL`, désactivation source `INTELLIGENCE_SOURCE_DISABLED_SLUGS`, timeout `INTELLIGENCE_HTTP_TIMEOUT_MS`.
3. Consulter les logs de la route **`/api/cron/intelligence-pipeline`** ou du workflow GitHub (sortie du job).
4. Corriger la cause (quota API, schéma, réseau) puis **relancer** : cron avec `?mode=materialize` si seule la matérialisation est nécessaire, ou run complet selon la doc cron.
5. Pas de rollback automatique du JSON `full_data` : en cas d’incident majeur, restauration **backup Postgres** ou réinjection depuis les sources — voir section « Matérialisation partielle » dans la doc cron.

## 2. Base de données indisponible

**Symptômes** : erreurs 500 sur routes utilisant Prisma ; listes vides là où le code retombe sur du statique ; **`GET /api/health`** renvoie **503** avec `checks.database: "down"` ou `"error"`.

**Étapes**

1. Vérifier **Neon / hébergeur** (incident, suspension, limite connexions).
2. Contrôler **`DATABASE_URL`** sur Vercel / Render (typo, rotation de mot de passe).
3. `prisma migrate deploy` si le déploiement était en avance sur la base.
4. Les routes **pays** peuvent **retomber** sur JSON statique / fallback — comportement documenté dans le code des handlers `GET /api/countries` ; les fonctionnalités **user** restent dépendantes de la DB.

## 3. Application lente ou timeouts sur le pipeline serverless

**Symptômes** : `504` / timeout sur cron ou webhook pipeline.

**Étapes**

1. Vérifier `maxDuration` sur les routes concernées (Vercel).
2. Réduire le périmètre du run (`worldBankLimit`, mode `materialize` seul).
3. Augmenter progressivement les timeouts HTTP côté collecte si la plateforme externe est lente (`INTELLIGENCE_HTTP_TIMEOUT_MS`, plafonné — voir `http-fetch.ts`).

## 4. Fallback « lecture seule » données pays

Si la DB est down mais que le site doit rester **consultable** : les merges pays utilisent `buildMergedCountriesList` avec caches et repli **fallback** JSON selon les handlers. Ne pas supposer que **toutes** les routes ont le même repli — les écritures (profil, commentaires) échoueront tant que la DB est hors service.

## Liens utiles

- Sécurité / webhook : [catalogue-e-security.md](catalogue-e-security.md) §E.76  
- Coût / volume d’appels WB : [observability-budget-alerts-g93.md](observability-budget-alerts-g93.md)  
- **Healthchecks** : [healthcheck-g96.md](healthcheck-g96.md) (`GET /api/health`, admin agents health)  
- Preview vs prod DB : [environments-preview-database-g94.md](environments-preview-database-g94.md)
