# Background Agents

This folder contains the autonomous country intelligence engine.

## Code layout

- Main orchestration: `runner.ts`
- Shared types: `runner-types.ts`
- Environment constants (tick intervals, gates, paths): `runner-constants.ts`
- Task queue persistence (`.agent-state/tasks.json`): `runner-persistence.ts`

## What runs

- `Country-first completion loop`:
  - processes one country task at a time by priority/completeness gap
  - recursively re-runs collection passes for the same country until saturation or target
  - persists a coverage manifest and completeness report inside `full_data._agent`
- `Collection + ingestion`:
  - pulls runtime signals (Wikipedia + World Bank GDP)
  - merges with existing country payload
  - hydrates `travel_reasons` content for country pages
  - ingests verified `traveler_quotes` from `data/traveler-quotes/*.json` with strict 10-quote / 5-3-2 validation
  - upserts into Prisma `Country`

## Run locally

```bash
npm run agents:start
```

## Environment tuning

Optional variables:

```bash
AGENT_TICK_MS=30000
AGENT_REFRESH_MS=21600000
AGENT_WORKER_BATCH=1
AGENT_MAX_RECURSION_PASSES=4
AGENT_COMPLETENESS_TARGET=85
```

## Persistence

- Queue/task state is persisted in `.agent-state/tasks.json`.
- Country records are persisted in your Prisma database (`Country.full_data` includes `_agent`, completeness, and coverage metadata).
- Verified quote ingestion files are read from `data/traveler-quotes/`.

## Run detached in production

Recommended:
- PM2 on a VPS/container
- systemd service
- Render background worker service

The process is independent from Cursor and keeps running after editor shutdown when hosted properly.
