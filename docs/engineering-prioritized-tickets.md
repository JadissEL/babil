# Tickets priorisés (extrait du catalogue « 100 améliorations »)

Ces cinq chantiers sont **en cours de livraison** dans le dépôt (voir implémentations associées). Les autres items du catalogue restent dans le backlog produit/tech.

| ID | Thème | Ticket | Statut |
|----|--------|--------|--------|
| **T1** | Perf API | `GET /api/countries?light=1` — payload liste sans `full_data` ni `commentaires` (opt-in ; défaut inchangé) | Implémenté |
| **T2** | Ops données | Politique de rétention `CountryObservation` + script de purge paramétrable (`--dry-run`, `--older-than-days`) | Implémenté |
| **T3** | CI | Workflow GitHub Actions : `lint` + `test:lib` + `build` sur push/PR | Implémenté |
| **T4** | Sécurité | Vérification RBAC admin : toutes les routes `/api/admin/*` passent par `getAdminUser()` ; test de garde | Implémenté |
| **T5** | Doc moteur | Documenter formules probabilité vs recommandation + `engineVersion` API — **backlog** (non inclus dans ce lot) | À planifier |

## Références

- Spécification liste légère : [app/api/countries/route.ts](../app/api/countries/route.ts) (`?light=1`)
- Rétention : [country-observation-retention.md](country-observation-retention.md)
- CI : [ci.yml](../.github/workflows/ci.yml)
