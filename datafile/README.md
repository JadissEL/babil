# Datafile — master list & algorithme de scrape (~300 sites)

Ce dossier est le **centre de l’intelligence sources** : liste canonique des sites de confiance, scrape borné, extraction structurée vers les fiches pays.

## Fichiers

| Fichier / dossier | Rôle |
|-------------------|------|
| `sources.master.json` | ~288 sources (global + corridor Maroc) |
| `url-overrides.json` | URLs manuelles par `source id` (priorité max au build) |
| `scrape-runs/{runId}/` | Sortie bronze par run (JSON par source, **gitignoré**) |
| `ingest-report.json` | Rapport dedupe vs manifest |

## 1. Construire la master list

```bash
npm run datafile:build-master   # templates + resolveManifestUrlTemplate + overrides
npm run datafile:report-urls    # sources sans URL (hors procedural/skipped)
npm run datafile:ingest:db      # upsert IntelligenceSource
```

## 2. Scrape (bronze)

Implémentation : [`lib/datafile/scraper/`](../lib/datafile/scraper/)

```bash
npm run datafile:scrape -- --limit=10
npm run datafile:scrape -- --write-db --resume --run-id=run_... --retry-failed
```

| Variable | Défaut | Description |
|----------|--------|-------------|
| `DATAFILE_SCRAPE_MAX_PAGES_PER_SOURCE` | 40 | Pages max par site |
| `DATAFILE_SCRAPE_DELAY_MS` | 1500 | Pause entre requêtes |
| `DATAFILE_SCRAPE_RETRY_MS` | 2000 | Retry sur 403/429/502 |
| `DATAFILE_SCRAPE_FETCH_MS` | 14000 | Timeout fetch |

## 3. Extraction structurée → observations pays

### 3a. Bronze scrape → observations

[`lib/datafile/extract/`](../lib/datafile/extract/) — règles d’abord, `--llm-fill` optionnel sur les trous.

```bash
npm run datafile:bronze-to-observations -- --run-id=run_2026-05-30T... --write-db
npm run datafile:bronze-to-observations -- --run-id=... --write-db --llm-fill
```

### 3b. Manifest visa par pays (recommandé pour visa/délais/frais)

URLs templatées (`{country}`, `{slug}`, `{encodedCountry}`) — inclut Wikipedia Visa Policy / Wikivoyage / VisaHQ par pays :

```bash
npm run datafile:manifest-visa-extract -- --schengen --limit=15 --write-db --llm-fill
npm run datafile:manifest-visa-extract -- --corridor-maroc --write-db --llm-fill
npm run datafile:manifest-visa-extract -- --all-countries --write-db --llm-fill
```

LLM : `OPENROUTER_API_KEY` (recommandé, modèle `openai/gpt-4o-mini`) ou `OPENAI_API_KEY`.
Endpoint/modèle configurables via `INTELLIGENCE_LLM_BASE_URL` / `INTELLIGENCE_LLM_MODEL`.
`AGENT_MANIFEST_EXCERPT_CHARS=60000` recommandé pour capturer le corps des pages.

### 3c. Baselines visa curées (Schengen + corridor)

Valeurs officielles (Code des visas UE 810/2009, guidances UK/US/CA/AU/TR/UAE) écrites comme observations `estimated` :

```bash
npm run datafile:seed-curated-visa
```

### 3d. Pipeline complet (local / prod)

```bash
npm run datafile:pipeline -- --run-id=run_2026-05-30T13-18-10-318Z_c9a3e772 --all-countries --materialize --llm-fill
```

Étapes : bronze scrape → manifest visa (pays) → validation → materialisation `Country.full_data`.

### 4. Matérialiser + vérifier les fiches

```bash
npm run datafile:materialize-visa-countries   # promeut manifest-visa + curated-visa, matérialise full_data
npm run datafile:verify-fiches                # échantillon 10 Schengen + 5 corridor
npm run datafile:status                       # métriques globales
```

## 5. CI batch (optionnel)

Workflow `datafile-scrape-batch.yml` — `workflow_dispatch`, `--limit=20`, `--write-db`.

Production : `ALLOW_PROD_WRITES=1` + `DATABASE_URL`.
