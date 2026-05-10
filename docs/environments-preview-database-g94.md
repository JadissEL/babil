# Environnements — base preview vs production (G.94)

## Principe

- **Production** : `DATABASE_URL` pointe vers la base **principale** (Neon primary ou Postgres managé).
- **Preview / staging** : une **autre** base (ou **branche Neon** dédiée), jamais la même URL que la prod pour les déploiements expérimentaux.

Évite d’écraser des données réelles depuis une PR, un cron preview ou un script local mal configuré.

## Vercel

1. **Production** : variables d’environnement → `DATABASE_URL` = URL prod.
2. **Preview** : dupliquer les variables nécessaires ; `DATABASE_URL` = URL de la base de **preview** (ou branche Neon).
3. Les **crons Vercel** ciblent en général la **production** — ne pas supposer qu’une preview partage les secrets : voir [intelligence-cron-and-environments.md](intelligence-cron-and-environments.md).

## Neon (branches)

1. Créer une **branch** depuis `main` (ex. `preview` ou une branche par feature critique).
2. Récupérer la connection string de la branche (rôle applicatif, pas `neon_superuser` en runtime).
3. Coller cette URL dans **Vercel → Environment Variables → Preview**.
4. Après un changement de schéma : `prisma migrate deploy` (ou `db push` en dev) contre **cette** URL avant de merger, pour éviter les décalages de schéma preview/prod.

## GitHub Actions

Le workflow [`.github/workflows/intelligence-pipeline-weekly.yml`](../.github/workflows/intelligence-pipeline-weekly.yml) utilise le secret **`DATABASE_URL`**. Ce doit rester **aligné avec l’intention métier** (souvent la **prod** si le pipeline alimente le site public). Ne pas y mettre une URL preview sans le vouloir explicitement.

## Checklist rapide

- [ ] Preview et prod ont des `DATABASE_URL` distinctes.
- [ ] `CRON_SECRET` / `BABIL_WEBHOOK_INGEST_SECRET` : policy claire par environnement.
- [ ] Aucun script local avec `DATABASE_URL` prod exportée par défaut sur une machine partagée.
