# Tickets priorisés (extrait du catalogue « 100 améliorations »)

**Liste complète des 100 pistes (versionnée dans le repo) :** [enhancements-backlog-100.md](enhancements-backlog-100.md)

Ces cinq chantiers sont **en cours de livraison** dans le dépôt (voir implémentations associées). Les autres items du catalogue restent dans le backlog produit/tech.

| ID | Thème | Ticket | Statut |
|----|--------|--------|--------|
| **T1** | Perf API | `GET /api/countries?light=1` — payload liste sans `full_data` ni `commentaires` (opt-in ; défaut inchangé) | Implémenté |
| **T2** | Ops données | Politique de rétention `CountryObservation` + script de purge paramétrable (`--dry-run`, `--older-than-days`) | Implémenté |
| **T3** | CI | Workflow GitHub Actions : `lint` + `test:lib` + `build` sur push/PR | Implémenté |
| **T4** | Sécurité | Vérification RBAC admin : toutes les routes `/api/admin/*` passent par `getAdminUser()` ; test de garde | Implémenté |
| **T5** | Doc moteur | Formules reco vs proba + version API — [engine-probability-vs-recommendation.md](engine-probability-vs-recommendation.md), `lib/engine-version.ts`, en-têtes `X-Babil-Engine-Version` / `X-Babil-Engine-Kind` | Implémenté |

### Lot données / transparence catalogue B (items 23–25)

| ID catalogue | Livrable | Fichiers / notes |
|--------------|----------|------------------|
| B.23 | Doc technique unique (poids, inputs) | [engine-probability-vs-recommendation.md](engine-probability-vs-recommendation.md) |
| B.24 | `engineVersion` exposée | `lib/engine-version.ts` ; en-têtes sur `POST /api/recommendation` et `POST /api/probability` |
| B.25 | Calibration / stabilité | Tests [`lib/public-synthetic-profile.test.ts`](../lib/public-synthetic-profile.test.ts) ; checklist manuelle dans la doc moteur |

### Lot UX catalogue A (items 16–22)

| ID catalogue | Livrable | Fichiers / notes |
|--------------|----------|------------------|
| A.16 | Sources officielles en tête de fiche pays | `lib/official-sources.ts`, `components/country/OfficialSourcesCard.tsx`, fiche [`app/(public)/countries/[id]/page.tsx`](../app/(public)/countries/[id]/page.tsx) |
| A.17 | Vue régionale (moyennes score par zone) | `lib/explorer-region-score-buckets.ts`, `components/explorer/ExplorerRegionScoreStrip.tsx`, [`app/(public)/explorer/page.tsx`](../app/(public)/explorer/page.tsx) |
| A.18 | CTA PhD visible quand données PhD | Bandeau + lien `/countries/[id]/doctorat` sur la même fiche pays |
| A.19 | Feedback utile / pas utile | `components/feedback/BlockFeedback.tsx`, événement `CONTENT_FEEDBACK` sur `POST /api/user/history` |
| A.20 | Personas profil (démo) | Presets sur [`app/(dashboard)/profile/page.tsx`](../app/(dashboard)/profile/page.tsx) |
| A.21 | Lecture sans compte (reco / proba / labo) | [`/recommendations`](../app/(public)/recommendations/page.tsx), [`/probability`](../app/(public)/probability/page.tsx), [`/recommendation-engine`](../app/(public)/recommendation-engine/page.tsx) ; démo serveur + bac à sable `playground` + [`sanitizePublicSyntheticProfile`](../lib/public-synthetic-profile.ts) |
| A.22 | Page design system interne | [`app/(dashboard)/design-system/page.tsx`](../app/(dashboard)/design-system/page.tsx) (protégée par middleware + layout dashboard) ; section composants produit |

## Références

- Moteurs (formules + version) : [engine-probability-vs-recommendation.md](engine-probability-vs-recommendation.md)
- Spécification liste légère : [app/api/countries/route.ts](../app/api/countries/route.ts) (`?light=1`)
- Rétention : [country-observation-retention.md](country-observation-retention.md)
- CI : [ci.yml](../.github/workflows/ci.yml)
