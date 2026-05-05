# Background Agents

This folder contains a production-oriented starting point for autonomous country intelligence ingestion.

## What runs

- `Primary Query Agent` logic:
  - builds multi-domain query plans per country
  - expands queries with synonym variants
  - ranks novelty to reduce duplicates
- `Ingestion Agent` logic:
  - pulls public signals (Wikipedia + World Bank)
  - validates and normalizes payloads
  - upserts into Prisma `Country`
  - retries failed tasks up to 3 attempts
  - hydrates `travel_reasons` content for country pages
  - ingests verified `traveler_quotes` from `data/traveler-quotes/*.json` with strict 10-quote / 5-3-2 validation

Both are orchestrated by `agents/runner.ts` as one resilient background service.

## Run locally

```bash
npm run agents:start
```

## Environment tuning

Optional variables:

```bash
AGENT_TICK_MS=30000
AGENT_REFRESH_MS=21600000
AGENT_WORKER_BATCH=8
```

## Persistence

- Queue/task state is persisted in `.agent-state/tasks.json`.
- Country records are persisted in your Prisma database (`Country.full_data` includes `_agent` metadata).
- Verified quote ingestion files are read from `data/traveler-quotes/`.

## Run detached in production

Recommended:
- PM2 on a VPS/container
- systemd service
- Render background worker service

The process is independent from Cursor and keeps running after editor shutdown when hosted properly.
