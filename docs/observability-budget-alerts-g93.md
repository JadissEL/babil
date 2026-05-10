# Budget et alertes coût (G.93)

Objectif : détecter une **hausse anormale** des appels sortants (pipeline) et documenter les **garde-fous fournisseurs** (LLM, hébergeur) sans centraliser de facturation dans le repo.

## 1. Pipeline intelligence — World Bank (code)

Le collecteur expose `apiBatchCalls` (batches HTTP indicateur × lot). Après chaque `EnrichmentRun`, si la variable **`INTELLIGENCE_PIPELINE_WB_HTTP_SOFT_LIMIT`** est définie (entier > 0) et que `apiBatchCalls` la dépasse, le processus émet une ligne JSON :

- `msg`: `pipeline_external_calls_budget_soft_exceeded`
- champs : `runId`, `pipelineStatus`, `worldBankApiBatchCalls`, `softLimit`

À brancher sur une **alerte log** (Vercel Log Drain, Datadog, etc.) : filtrer sur ce `msg`.

Implémentation : [`lib/pipeline-external-budget.ts`](../lib/pipeline-external-budget.ts), journalisation via [`slogProcess`](../lib/structured-log.ts) dans [`run-enrichment-stub.ts`](../lib/intelligence-pipeline/run-enrichment-stub.ts).

## 2. LLM / OpenAI (hors code aujourd’hui)

Le dépôt ne fait pas encore d’appels OpenAI en production pour les agents. Quand ce sera branché :

- Configurer des **limites de budget** et alertes mail dans la console OpenAI (organisation).
- Journaliser côté worker : tokens `usage` (réponse API) ou agrégats quotidiens, en **JSON structuré** (même convention que `slogProcess`), sans PII.
- Optionnel : webhook interne signé (comme [`/api/webhooks/ingest`](../app/api/webhooks/ingest/route.ts)) déclenché par un job quotidien — hors scope du backlog G.93 minimal.

## 3. Autres fournisseurs

| Fournisseur | Action typique |
|-------------|----------------|
| **Vercel** | Budget / notifications de dépassement sur le projet ; surveiller les invocations des routes `cron` et `maxDuration`. |
| **Neon / PostgreSQL** | Alertes facturation ou seuils compute ; éviter les previews branchées par erreur sur la prod (voir [environments-preview-database-g94.md](environments-preview-database-g94.md)). |
| **Clerk** | Quotas MAU / usage — alertes dans le dashboard Clerk. |

## 4. Réglage du seuil WB

La valeur dépend du nombre de pays, d’indicateurs et de la taille des lots (`world-bank-collector`). Commencer par une marge au-dessus du **run nominal** observé en staging, puis resserrer après quelques semaines de métriques.
