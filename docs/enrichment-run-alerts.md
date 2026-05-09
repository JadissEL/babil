# Alertes EnrichmentRun (C.42) — santé pipeline

Vérifie les runs **bloqués** (statut `PENDING` ou `RUNNING` sans `finishedAt` depuis plus de 2 h) et compte les **FAILED** / **PARTIAL** sur 14 jours. Même logique que [`GET /api/admin/intelligence/summary`](../app/api/admin/intelligence/summary/route.ts) (`runAlerts`).

## Usage

```bash
npm run intelligence:check-run-alerts
```

- Code sortie **1** si niveau **critical** (au moins un run bloqué au-delà du seuil).
- Option **`--fail-on-warning`** : code 1 aussi si seulement des échecs / partiels récents ou dernier run FAILED/PARTIAL.

## Automatisation

Workflow [`.github/workflows/enrichment-run-alerts.yml`](../.github/workflows/enrichment-run-alerts.yml) : quotidien + `workflow_dispatch`, secret `DATABASE_URL`. Une alerte critique fait échouer le job (notification selon les réglages du dépôt GitHub).

Contexte produit : [country-intelligence-system.md](country-intelligence-system.md) §2.5 ; exploitation (cron, secrets, reprise) : [intelligence-cron-and-environments.md](intelligence-cron-and-environments.md).
