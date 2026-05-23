# Intelligence pipeline — operator runbook

## SLO signals (RED-style)

| Signal | Source | Alert |
|--------|--------|-------|
| Queue depth | `pending` + `running` jobs | `intelligence:check-queue-alerts` |
| Errors | `failedLast24h`, dead-letter count | CI critical if DLQ ≥ 5 / 24h |
| Retry saturation | `retrySaturationRatio` | warning > 0.2, critical > 0.4 |
| Oldest pending age | `oldestPendingAgeMinutes` | critical > 120 min |
| Materialization freshness | `materializedFreshRatio` | warning < 0.7, critical < 0.5 |
| Observation coverage | `check-data-quality` script | logged in CI |

```bash
npm run intelligence:slo-report
npm run intelligence:check-data-quality
curl -s /api/admin/intelligence/metrics   # admin session
```

### Public health probe (intelligence)

`GET /api/health?intelligence=1` — queue alert level, pending/running, DLQ 24h, circuit-breaker hosts (no auth; returns 503 when queue SLO critical).

### Enqueue low completeness

`npm run intelligence:enqueue-low-completeness -- --limit 15` — manifest_fetch for weakest intelligence scores (daily orchestrator enqueues 12).

### Schema drift

Manifest extractors emit structured warnings when REST Countries or World Bank JSON shape changes (`schema-drift.ts`).

### Resilience

- **Transient vs permanent errors** — permanent failures skip retry and go straight to DLQ (`transient-errors.ts`).
- **Backoff jitter** — retry delay includes 0–25% jitter to avoid retry storms.
- **Per-host circuit breaker** — after 5 failures, host paused 5 min (`INTELLIGENCE_FETCH_CB_*` env).

### LLM contradiction pass (optional)

Set `AGENT_LLM_TOKEN_BUDGET_PER_TASK` ≥ `INTELLIGENCE_LLM_MIN_TOKEN_BUDGET` (default 1200) and `OPENAI_API_KEY` for structured JSON review on `extract_manifest_batch` jobs. Heuristic pass always runs when budget > 0.

## Daily automation (GitHub Actions)

- `intelligence-orchestrator-daily` — enqueue stale manifest + freshness + WB + visa_friction
- `intelligence-validate-and-materialize` — validate, materialize, recover stale, queue SLO, launch gate
- `agent-manifest-fetch` — high-priority manifest batches

Render **`babil-agents`** drains `IntelligencePipelineJob` each tick.

## Dead-letter triage

1. Admin → Intelligence → **Dead-letter** panel, or `GET /api/admin/intelligence/dead-letter-jobs`
2. Check `errorClass` / `canRedrive` — **poison** jobs need code/data fix, not blind replay
3. **Canary redrive** (transient only): UI **Canary ×3** or `npm run intelligence:dlq-canary-redrive -- --limit=3`
4. Single job: `POST .../dead-letter-jobs/redrive` with `{ "jobId": "..." }`
5. Bulk: `POST .../dead-letter-jobs/bulk-redrive` with `{ "limit": 3 }`

## HITL review

- `GET /api/admin/intelligence/review-queue` — disputed + medium-confidence
- Resolve → re-validates country + updates `disputed_field_paths` on `full_data`

## Contradiction second-pass

Set `AGENT_LLM_TOKEN_BUDGET_PER_TASK` > 0 to enable **heuristic** excerpt scan on `extract_manifest_batch` jobs (no external LLM yet).

## Cron modes

`GET /api/cron/intelligence-pipeline?mode=queue` — drain up to 5 queue jobs (Vercel cron companion to Render worker).

## Production secrets

- `DATABASE_URL`, `ALLOW_PROD_WRITES=1` (GHA enqueue only)
- `INTELLIGENCE_JOB_MAX_ATTEMPTS` (default 3)
- `INTELLIGENCE_MAX_JOBS_PER_DAY` — daily enqueue cap
