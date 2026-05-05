# Render Deployment Commands

## Web service (`babil`)

Use these settings:

- Build Command:
  - `npm install && npm run build`
- Start Command:
  - `npm run start:render`

`start:render` executes:

1. `npm run db:push`
2. `npm run seed`
3. `next start`

Required environment variable on Render web service:

- `DATABASE_URL` = **Internal Database URL** from your Render Postgres instance

Recommended:

- Set `NODE_ENV=production`
- Keep Clerk keys configured in the same Render service.

## Background worker (`babil-agents`)

Use these settings:

- Build Command:
  - `npm install`
- Start Command:
  - `npm run agents:start`

Required environment variables on the worker:

- `DATABASE_URL` (same Postgres internal URL)
- optional tuning:
  - `AGENT_TICK_MS`
  - `AGENT_REFRESH_MS`
  - `AGENT_WORKER_BATCH`
  - `AGENT_TASK_TTL_HOURS`
  - `AGENT_RETRY_BASE_DELAY_MS`
  - `AGENT_RETRY_MAX_DELAY_MS`
