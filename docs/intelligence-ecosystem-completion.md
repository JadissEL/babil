# Intelligence ecosystem — completion checklist

Use this as the operator “definition of done” for the autonomous enrichment stack.

## Data layers

| Layer | Artifact | Done when |
|-------|-----------|-----------|
| Bronze | `CountryObservation` + manifest excerpts | Allowlisted fetch writes rows with `sourceUrl`, `rawExcerpt`, `dedupeKey` |
| Silver | `validateAndTagObservationsForCountry` | Consensus + expectations suite pass; disputes synced to `full_data._intelligence` |
| Gold | `materializeEconomyObservationsForCountry` | Only `canPromoteField()` paths; `field_lineage` stamped |

## Manifest

- [x] `npm run agent:manifest-validate` — OK (289 rows, 131 fetchable URLs; 2026-05-23 `intelligence:self-check`)
- [x] Fetchable ratio documented (target ≥ 120/289) — **131/289** in committed map
- [ ] Procedural guidance rows use `procedural_guidance_no_fetch`

## Operations

- [ ] `npm run intelligence:status` — SLO not critical (DB reachable post-`db push`; **critical** until jobs/observations populate — 2026-05-23)
- [ ] `GET /api/health?intelligence=1` — 200 when healthy (re-check after Render/Vercel deploy from `main` `2a06b3f`)
- [ ] `GET /api/metrics/intelligence` (CRON_SECRET) — scrapable metrics (set `CRON_SECRET` in Vercel; see `.env.example`)
- [ ] Render `babil-agents` drains queue continuously
- [ ] GHA orchestrator + validate/materialize green (dispatch manually; requires `DATABASE_URL` + `ALLOW_PROD_WRITES=1` secrets)

## Quality gates

- [x] `npm run intelligence:validate-taxonomy` — OK (2026-05-23)
- [ ] `npm run intelligence:check-data-quality`
- [ ] `npm run intelligence:check-queue-alerts`
- [ ] Expectations suite blocks out-of-range materialize values

## HITL

- [ ] Admin review queue empty or triaged weekly
- [ ] DLQ poison jobs fixed in code, not redriven

## Optional LLM

- [ ] `OPENAI_API_KEY` + `AGENT_LLM_TOKEN_BUDGET_PER_TASK` on worker for contradiction batch

---

## Verification log (2026-05-23)

| Step | Result |
|------|--------|
| `npm run ci:local` | Pass (check + manifest + taxonomy + build) |
| Git push `main` | `5b8e181..2a06b3f` (4 commits: pipeline, API, UI, devops) |
| Production DB | `prisma db push` synced schema; observation migrations marked applied; removed empty `20260208120000_*` migration dir locally |
| `npm run intelligence:self-check` | Pass |
| `npm run intelligence:status` | Runs; freshness SLO **critical** until pipeline enqueues work |
| Stitch smoke | Manual: `/`, `/explorer`, `/compare`, `/schengen`, `/probability`, `/recommendations`, `/recommendation-engine`, `/business`, `/investment`, `/education` after deploy |

**Operator follow-ups:** configure `CRON_SECRET` on Vercel; GitHub secrets for intelligence workflows; trigger **Intelligence validate and materialize** workflow once `gh` is authenticated.

### Continuation (2026-05-23)

| Step | Result |
|------|--------|
| `intelligence:seed-sources` | 149 sources upserted |
| `intelligence:enqueue-stale --limit 5` | 5 `manifest_fetch` jobs |
| `intelligence:worker-once` × 4 | 4 succeeded; **51** pending observations |
| GitHub CI run [#229](https://github.com/JadissEL/babil/actions/runs/26324865351) | **Failed** at `test:lib` — mitigated locally with `--test-concurrency=1` |
| Production DB | Schema synced; pipeline queue operational |

**Note:** `GET /api/health?intelligence=1` returns **503** while freshness SLO is critical (expected). Use `GET /api/health` for DB liveness only until materialize catches up.
