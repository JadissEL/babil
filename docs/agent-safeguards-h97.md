# Garde-fous agents (H.97)

Ce document décrit les mécanismes **implémentés** dans le dépôt pour limiter les dérives (HTTP, taille JSON) et préparer un **budget tokens** LLM futur. Le runner ne fait **pas** encore d’appels OpenAI en production.

## 1. Retries HTTP (enrichissement Wikipedia / World Bank GDP)

Fichier : [`lib/agent-http-retry.ts`](../lib/agent-http-retry.ts), utilisé par [`lib/agent-country-enrichment-merge.ts`](../lib/agent-country-enrichment-merge.ts).

- **`AGENT_HTTP_MAX_ATTEMPTS`** (défaut **3**, max 8) — tentatives par URL.
- **`AGENT_HTTP_RETRY_BASE_MS`** (défaut **400** ms, max 30 s) — backoff exponentiel entre tentatives sur **erreur réseau** ou statuts **408, 429, 502, 503, 504**.
- Les **404** et autres 4xx « définitifs » ne sont **pas** rejoués.

Les **retries de tâche** (file d’attente pays) restent gérés dans [`agents/runner.ts`](../agents/runner.ts) via `AGENT_RETRY_BASE_DELAY_MS` / `AGENT_RETRY_MAX_DELAY_MS`.

## 2. Validation avant écriture `full_data`

Fichier : [`lib/agent-full-data-persist-guard.ts`](../lib/agent-full-data-persist-guard.ts), appelé dans [`agents/runner.ts`](../agents/runner.ts) juste avant `prisma.country.upsert`.

Contrôles :

- JSON sérialisable (`JSON.stringify` — détecte références circulaires / `BigInt` non supportés).
- Taille du JSON UTF-8 ≤ **`AGENT_FULL_DATA_JSON_MAX_BYTES`** (défaut **12_000_000** octets, plafond **32 Mo** ; valeurs &lt; **64** ignorées → défaut).
- Si présents : `travel_reasons` et `traveler_quotes` doivent être des **tableaux** ; `_agent` doit être un **objet** (pas un tableau).

En cas d’échec, le runner lève `persist_guard:<reason>` → la tâche passe par le chemin d’**erreur** habituel (retry / `failed`).

## 3. Budget tokens LLM (réservé)

- Variable **`AGENT_LLM_TOKEN_BUDGET_PER_TASK`** (défaut **0** = inactif), exportée dans [`agents/runner-constants.ts`](../agents/runner-constants.ts). Aucune enforcement tant qu’aucun appel LLM n’est câblé.
- Lors d’une intégration future : comparer `usage.total_tokens` (réponse API) à ce plafond et court-circuiter / journaliser avant merge dans `full_data`.

## 4. Voir aussi

- Agents locaux : [`agents/README.md`](../agents/README.md)  
- Contrat champs / complétude : [`lib/country-intelligence-contract.ts`](../lib/country-intelligence-contract.ts), [`lib/country-completeness.ts`](../lib/country-completeness.ts)
