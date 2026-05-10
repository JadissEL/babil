# Healthchecks et dépendances (G.96)

## Vue d’ensemble

| Endpoint | Auth | Rôle |
|----------|------|------|
| **`GET /api/health`** | Aucune | Sonde **légère** : exécute `SELECT 1` via Prisma. **200** si la base répond, **503** si indisponible ou erreur inattendue. `Cache-Control: no-store`. |
| **`GET /api/admin/agents/health`** | **Admin** (Clerk + rôle) | Diagnostic **agents** : fichier `.agent-state/tasks.json`, agrégats pays (`full_data`, complétude, images, PhD). **503** si la base est considérée indisponible (`isDbUnavailable`) avec corps partiel (état fichier conservé). |

Ne pas exposer d’URL PostgreSQL, secrets ou PII dans ces réponses.

## Dépendances par sonde

### `GET /api/health`

| Dépendance | Obligatoire | Détail |
|------------|-------------|--------|
| **PostgreSQL** (`DATABASE_URL`) | Oui | Une requête SQL minimale par appel. Sans DB → **503**. |
| **Clerk** | Non | Non utilisé par cette route. |
| Fichier agent state | Non | Non lu. |

### `GET /api/admin/agents/health`

| Dépendance | Obligatoire | Détail |
|------------|-------------|--------|
| **PostgreSQL** | Oui pour le bloc métrique pays | Lecture `country` (nom + `full_data`). |
| **`.agent-state/tasks.json`** | Non | Si absent : `stateStatus: "missing"` ; la route reste **200** si la DB répond. |
| **Disque / FS** | Lecture seule | Accès au fichier d’état du runner. |
| **Clerk admin** | Oui pour accéder à la route | Sans session admin → **403**. |

## Intégration monitoring

- Pointer son **uptime checker** (Better Stack, UptimeRobot, etc.) vers **`GET /api/health`** sur l’URL de prod (pas la preview si la preview n’a pas de DB fiable).
- Pour diagnostiquer les **agents** après alarme, un admin ouvre **`/admin`** (onglet lié) ou appelle **`GET /api/admin/agents/health`** avec une session admin.

## Voir aussi

- Runbooks incidents : [runbooks-incidents-g95.md](runbooks-incidents-g95.md)  
- Environnements DB : [environments-preview-database-g94.md](environments-preview-database-g94.md)
