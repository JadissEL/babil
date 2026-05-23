# Intelligence ecosystem — best practices (implemented)

This document maps industry guidance to Babil’s hybrid queue + observation staging architecture.

## Three-layer data model (medallion-style)

| Layer | Babil implementation |
|--------|----------------------|
| Bronze — raw facts | `CountryObservation` append-only + `rawPayload` / `rawExcerpt` / `sourceUrl` |
| Silver — candidate resolution | `lib/intelligence-validation/consensus.ts` + `merge-observations.ts` |
| Gold — golden record | `Country.full_data` via `materialize-economy-observations` only when `canPromoteField()` |

Field-level lineage on promotion: `full_data._intelligence.field_lineage[fieldPath]` (`lib/intelligence-validation/promotion-lineage.ts`) — observation id, source slug, confidence, materializedAt ([golden record + lineage](https://dataopsschool.com/blog/golden-record/)).

Inspired by [event data quality: dedupe, source scoring, audit trails](https://us.fitgap.com/stack-guides/managing-event-data-quality-with-deduplication-source-scoring-and-audit-trails) and [ingestion-stage quality frameworks](https://unstructured.io/insights/data-quality-at-ingestion-a-framework-for-ai-ready-pipelines).

## Ingestion quality gates

`lib/intelligence-validation/quality-gates.ts` classifies each write as **pass**, **quarantine** (`pending`), or **reject** (`disputed`) using confidence, provenance, and field path.

## Source reliability scoring

`lib/intelligence-validation/source-reliability.ts` adjusts consensus confidence from historical `verified` / `disputed` ratios per `IntelligenceSource.slug` (dynamic, not static tier only).

## Provenance & citations

Observations store:

- `sourceUrl` — canonical fetch/API URL  
- `rawExcerpt` — bounded excerpt for HITL / future LLM verify  
- `dedupeKey` — idempotent upserts  

Claims API shape: `lib/intelligence-claims.ts`.

## Hybrid orchestration

| Scheduler | Role |
|-----------|------|
| GitHub Actions | Enqueue only (`ALLOW_PROD_WRITES=1`) |
| Render `babil-agents` | Drain queue + country agent ticks |
| `intelligence-validate-and-materialize` GHA | Consensus tag + promote + launch gate |

Guardrails: `lib/intelligence-pipeline/job-budget.ts`, `enqueue-guard.ts`, `stale-job-recovery.ts`.

## Deterministic extract (no LLM)

`lib/intelligence-pipeline/manifest-json-extract.ts` parses **REST Countries API** JSON into population observations. LLM extract remains behind `extract_manifest_batch` + `AGENT_LLM_TOKEN_BUDGET_PER_TASK`.

## Human-in-the-loop

| Surface | Role |
|---------|------|
| `GET /api/admin/intelligence/review-queue` | Disputed observations + counts |
| `POST /api/admin/intelligence/review-queue/resolve` | Human verify / dispute / pending; re-validates country; syncs disputed paths |
| `GET /api/admin/intelligence/dead-letter-jobs` | Terminal failed jobs (`dead_letter:` prefix) |
| `POST .../dead-letter-jobs/redrive` | Reset attempt counter and re-queue (canary redrive) |
| Admin tab **Intelligence** | `IntelligenceReviewQueuePanel` + `IntelligenceDeadLetterPanel` ([review queue design](https://engineersofai.com/docs/ai-engineering/human-in-the-loop/Review-Queues-and-Tooling)) |

Escalation pattern: **triage + approval gate** — low-confidence or conflicting observations stay `disputed` until HITL; promotion skips non-promotable fields (`canPromoteField`).

## Queue observability

`collectIntelligenceQueueMetrics()` + `evaluateQueueAlertLevel()` feed the admin summary (`pipelineJobQueue.metrics`, `alertLevel`). Signals: oldest pending age, retry saturation, disputed volume ([pipeline retry / SLO patterns](https://dataworkers.io/resources/data-pipeline-retry-strategies/)).

Job retries: `lib/intelligence-pipeline/job-retry.ts` — exponential `notBefore` in payload, max `INTELLIGENCE_JOB_MAX_ATTEMPTS`.

## Post-promotion safety

`checkPromotionLaunchGateSample()` runs after `intelligence:materialize-approved` (and in GHA) — sample countries must pass `evaluateLaunchGate` before CI succeeds.

## Specialized job kinds (no longer deferred)

| `kind` | Collector |
|--------|-----------|
| `visa_friction` | Manifest fetch scoped to visa + Morocco corridor categories |
| `education` | `study_universities`, `ma_education_corridor` |
| `travel_signals` | `flights_transport`, `ma_air_transport` |
| `news_trends` | `finance_economics_news`, `statistics_data`, `health_quality_of_life` |
| `world_bank_materialize` | `runWorldBankCollector` + optional validate/materialize + launch-gate sample |

Enqueue: `npm run intelligence:enqueue-specialized -- --kind visa_friction --limit 20`

## Dead-letter queue (DLQ semantics)

After `INTELLIGENCE_JOB_MAX_ATTEMPTS` (default 3), jobs stay `FAILED` with `errorSummary` prefix `dead_letter:` ([DLQ ops guidance](https://www.systemoverflow.com/learn/message-queues/dead-letter-queues/dlq-operations-metrics-alerting-and-triage-slos)).

CI: `npm run intelligence:check-queue-alerts` — fails on critical queue SLO or ≥5 dead letters / 24h.

## Manifest URL map expansion

Rebuild after editing templates: `npm run agent:manifest-build-committed`. Labels use **Unicode-normalized lookup** (`normalizeManifestLabel`) so curly apostrophes in `agent-research-sources.ts` match ASCII template keys. Procedural rows (`Important:`, `Pattern:`, etc.) skip with `procedural_guidance_no_fetch`. Deterministic JSON extract: REST Countries population, World Bank country ISO2 metadata.

## Golden signals (SRE → batch pipeline)

Aligned with [Google SRE golden signals](https://sre.google/sre-book/monitoring-distributed-systems/) and [Pipeline Framework alerting](https://pipelineframework.org/guide/operations/observability/alerting):

| Signal | SLI module | Alert hints |
|--------|------------|-------------|
| **Errors** | `queue-metrics` (fail rate, DLQ 24h) | `dead_letter_24h`, `job_fail_rate_24h` |
| **Latency** | `latency-sli` (job duration P50/P95/P99) | `job_p95_ms` |
| **Saturation** | `saturation-sli` (daily job + manifest caps) | `job_budget_util` |
| **Throughput** | `queue-metrics.jobsCreatedLast24h`, `volume-sli` | `zero_observations_24h` |
| **Freshness (lag)** | `freshness-sli` | `materialized_fresh_ratio` |

Prometheus: `GET /api/metrics/intelligence` (Bearer `CRON_SECRET`). Vercel cron drains queue every 6h (`mode=queue`); weekly full pipeline Sunday 04:00 UTC.

Shared post-fetch: `validateAndMaybeMaterializeCountry()` in `post-fetch-pipeline.ts` (manifest + specialized jobs).

Offline gate: `npm run intelligence:self-check` (taxonomy + manifest map, no DB).

## Medallion layer timestamps

`full_data._intelligence` records pipeline progression (bronze → silver → gold):

| Field | Layer | When set |
|-------|-------|----------|
| `last_bronze_ingest_at` | Bronze | After manifest fetch writes observations |
| `last_silver_validated_at` | Silver | After `validateAndTagObservationsForCountry` |
| `last_gold_materialized_at` | Gold | After economy materialize to `full_data` |
| `medallion_layer_last` | — | Latest layer touched |

Bronze upserts use **monotonic confidence** on `dedupeKey` replay. Enqueue uses **`enqueueIntelligenceJob()`** (budget + dedupe + structured log).

## Data contracts (producer/consumer)

`validateObservationDataContract()` runs on every `upsertCountryObservation` — invalid shapes stay `pending` (not promoted). Sampled SLI: `collectIntelligenceContractSli()` → SLO report + Prometheus `babil_intelligence_contract_violation_rate`.

CI: `npm run intelligence:audit-contracts` or merged in `intelligence:check-data-quality` (contract + freshness).

## Public provenance UX

Per [explainable overview / provenance UX](https://datawizards.cloud/designing-explainable-overviews-surfacing-provenance-and-unc) patterns:

- Country page semantic strip uses `buildCountryIntelligenceSemanticItems()` — source slug + confidence on each stat.
- `CountryIntelligenceCoverageBadge` — client-side coverage % from materialized economy paths + dispute penalty.
- `IntelligenceDisputedFieldsAlert` when `full_data._intelligence.disputed_field_paths` is non-empty.
- `GET /api/countries/[id]?intelligence=1` merges golden-record `field_lineage` with live observations (`goldenRecord: true` rows preferred).

## Operations checklist

1. `npx prisma migrate deploy`  
2. `npm run intelligence:seed-sources`  
3. GitHub secret `ALLOW_PROD_WRITES=1`  
4. Optional env: `INTELLIGENCE_MAX_JOBS_PER_DAY`, `INTELLIGENCE_STALE_MATERIALIZE_DAYS`, `INTELLIGENCE_PROMOTION_CONFIDENCE_MIN`  
5. Rebuild URL map after template edits: `npm run agent:manifest-build-committed`  

## Contradiction second-pass (heuristic)

When `AGENT_LLM_TOKEN_BUDGET_PER_TASK` > 0, `extract_manifest_batch` loads excerpts and runs `runHeuristicContradictionPass` (≥12% numeric divergence). Conflicts are persisted via `applyHeuristicContradictionConflicts` (`disputed_field_paths` + observation `disputed`).

## Expectations suite (GE-style)

`runFieldExpectations()` — range checks on materialize targets during silver validation (population min, unemployment 0–80%, etc.). Failures downgrade consensus to `pending`.

## Public ecosystem status

`GET /api/intelligence/ecosystem-status` — taxonomy version, manifest fetchable count, capabilities list (no auth).

## Prometheus metrics

`GET /api/metrics/intelligence` — text exposition; auth via `CRON_SECRET`.

## Auto-materialize after manifest fetch

Default on: `manifest_fetch` jobs validate then `materializeEconomyObservationsForCountry({ onlyPromotable: true })`. Disable with `INTELLIGENCE_AUTO_MATERIALIZE_AFTER_FETCH=0`.

## Data contracts (producer/consumer)

`validateObservationDataContract()` in `lib/intelligence-validation/data-contract.ts` enforces:

- `fieldPath` shape and taxonomy alignment for materialize targets (`{ value: number }`)
- Manifest provenance snapshot shape for `provenance.manifest.*`
- Wired in `observation-writer` — contract violations → `pending` (quarantine)

CI: `npm run intelligence:validate-taxonomy` — glossary ↔ `MATERIALIZE_TARGETS`.

## Resilience (self-healing)

- **Error class** — `classifyPipelineError()` → permanent errors skip retry (DLQ immediately).
- **Retry jitter** — exponential backoff + random jitter on `IntelligencePipelineJob` requeue.
- **Circuit breaker** — per-host pause after repeated manifest HTTP failures.
- **Priority** — `scoreCountryPriority()` boosts countries with disputed paths and missing materialized economy fields.

## OpenLineage-style facets

`buildManifestFetchLineageFacet()` stored on `EnrichmentRun.statsJson` after manifest fetch (inputs = source URLs, outputs = field paths).

## Volume & completeness SLIs

- **Volume** (`volume-sli.ts`): observations/hour, pipeline fail rate, manifest run success rate — merged in SLO report.
- **Completeness** (`country-completeness.ts`): per-country score from materialize coverage + manifest provenance − disputes.
- Admin: `IntelligenceCompletenessPanel` · API `GET /api/admin/intelligence/completeness`.

## Operator SLO

- API: `GET /api/admin/intelligence/metrics`
- CLI: `npm run intelligence:slo-report` / `npm run intelligence:status`
- Admin UI: `IntelligenceSloPanel`

See [intelligence-runbook.md](intelligence-runbook.md).

See also [intelligence-cron-and-environments.md](intelligence-cron-and-environments.md).
