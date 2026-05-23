# Intelligence ecosystem — completion checklist

Use this as the operator “definition of done” for the autonomous enrichment stack.

## Data layers

| Layer | Artifact | Done when |
|-------|-----------|-----------|
| Bronze | `CountryObservation` + manifest excerpts | Allowlisted fetch writes rows with `sourceUrl`, `rawExcerpt`, `dedupeKey` |
| Silver | `validateAndTagObservationsForCountry` | Consensus + expectations suite pass; disputes synced to `full_data._intelligence` |
| Gold | `materializeEconomyObservationsForCountry` | Only `canPromoteField()` paths; `field_lineage` stamped |

## Manifest

- [ ] `npm run agent:manifest-validate` — 0 `pending_manual_url_template`
- [ ] Fetchable ratio documented (target ≥ 120/289)
- [ ] Procedural guidance rows use `procedural_guidance_no_fetch`

## Operations

- [ ] `npm run intelligence:status` — SLO not critical
- [ ] `GET /api/health?intelligence=1` — 200 when healthy
- [ ] `GET /api/metrics/intelligence` (CRON_SECRET) — scrapable metrics
- [ ] Render `babil-agents` drains queue continuously
- [ ] GHA orchestrator + validate/materialize green

## Quality gates

- [ ] `npm run intelligence:validate-taxonomy`
- [ ] `npm run intelligence:check-data-quality`
- [ ] `npm run intelligence:check-queue-alerts`
- [ ] Expectations suite blocks out-of-range materialize values

## HITL

- [ ] Admin review queue empty or triaged weekly
- [ ] DLQ poison jobs fixed in code, not redriven

## Optional LLM

- [ ] `OPENAI_API_KEY` + `AGENT_LLM_TOKEN_BUDGET_PER_TASK` on worker for contradiction batch
