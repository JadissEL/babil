# Tickets priorisés (extrait du catalogue « 100 améliorations »)

**Liste complète des 100 pistes (versionnée dans le repo) :** [enhancements-backlog-100.md](enhancements-backlog-100.md)

Ces chantiers sont **en cours de livraison** dans le dépôt (voir implémentations associées). Les autres items du catalogue restent dans le backlog produit/tech.

| ID | Thème | Ticket | Statut |
|----|--------|--------|--------|
| **T1** | Perf API | `GET /api/countries?light=1` — payload liste sans `full_data` ni `commentaires` (opt-in ; défaut inchangé) | Implémenté |
| **T2** | Ops données | `CountryObservation` : purge, workflow dry-run mensuel (C.39), compaction (C.40), **dashboard volumes admin (C.41)** — [country-observation-retention.md](country-observation-retention.md), onglet Intelligence sur [`admin/page.tsx`](../app/(dashboard)/admin/page.tsx) | Implémenté |
| **T3** | CI | Workflow GitHub Actions : `lint` + `test:lib` + `build` sur push/PR | Implémenté |
| **T4** | Sécurité | Vérification RBAC admin : toutes les routes `/api/admin/*` passent par `getAdminUser()` ; test de garde | Implémenté |
| **T5** | Doc moteur | Formules reco vs proba + version API — [engine-probability-vs-recommendation.md](engine-probability-vs-recommendation.md), `lib/engine-version.ts`, en-têtes `X-Babil-Engine-Version` / `X-Babil-Engine-Kind` | Implémenté |
| **T6** | Transparence scoring | Top 3 facteurs, signaux fiche, snapshot contract/UI, journal `_data_changelog`, lexique B.27, agrégat confiance B.31, qualité données B.32, profil enum B.34–B.35, Assist masqué B.36, export RGPD B.37, **i18n pilote B.38** — voir fichiers listés en B.23–B.38 ci-dessous | Implémenté |

### Lot données / transparence catalogue B (items 23–38)

| ID catalogue | Livrable | Fichiers / notes |
|--------------|----------|------------------|
| B.23 | Doc technique unique (poids, inputs) | [engine-probability-vs-recommendation.md](engine-probability-vs-recommendation.md) |
| B.24 | `engineVersion` exposée | `lib/engine-version.ts` ; en-têtes sur `POST /api/recommendation` et `POST /api/probability` |
| B.25 | Calibration / stabilité | Tests [`lib/public-synthetic-profile.test.ts`](../lib/public-synthetic-profile.test.ts) ; checklist manuelle dans la doc moteur |
| B.26 | Top 3 facteurs vs neutre | [`lib/score-driver-explain.ts`](../lib/score-driver-explain.ts) ; champ `topDrivers` reco + proba |
| B.27 | Échelles 0–100 vs 0–10 / naming | [`lib/score-scale-lexicon.ts`](../lib/score-scale-lexicon.ts) ; fiche pays + radar ; doc moteur + `schema.prisma` |
| B.28 | Journal écritures `full_data` | [`lib/full-data-changelog.ts`](../lib/full-data-changelog.ts) ; `materializePublicFullDataForApi` ; agent + admin + pipeline économie |
| B.29 | Snapshot contract ↔ fiche pays | [`lib/country-intelligence-contract-display-snapshot.ts`](../lib/country-intelligence-contract-display-snapshot.ts) + test |
| B.30 | Signaux manquants explicites | [`lib/probability-result-display.ts`](../lib/probability-result-display.ts) ; `defaultsUsed` sur `POST /api/probability` |
| B.31 | Agrégat confiance observations par pays | [`lib/country-observation-confidence-aggregate.ts`](../lib/country-observation-confidence-aggregate.ts), [`lib/country-observation-confidence-db.ts`](../lib/country-observation-confidence-db.ts) ; `observationConfidenceAggregate` sur [`GET /api/countries/[id]`](../app/api/countries/[id]/route.ts) ; fiche pays + imprimable |
| B.32 | Détection d’anomalies (économie + sauts pipeline) | [`lib/intelligence-data-anomalies.ts`](../lib/intelligence-data-anomalies.ts), [`lib/intelligence-data-anomalies-db.ts`](../lib/intelligence-data-anomalies-db.ts) ; `dataQualityAnomalies` sur [`GET /api/countries/[id]`](../app/api/countries/[id]/route.ts) ; fiche + PDF |
| B.33 | Harmonisation `CountryInsight` vs observations | [`docs/country-insight-vs-observations.md`](country-insight-vs-observations.md) ; encart [`CountryDbInsightsCollapsible`](../components/country/CountryDbInsightsCollapsible.tsx) |
| B.34 | `goal_type` validé (enum partagé) | [`lib/user-profile-enums.ts`](../lib/user-profile-enums.ts) ; [`POST /api/user/profile`](../app/api/user/profile/route.ts) ; [`sanitizePublicSyntheticProfile`](../lib/public-synthetic-profile.ts) ; [`POST /api/recommendation`](../app/api/recommendation/route.ts) |
| B.35 | `profession` validée (enum) | Même module `user-profile-enums` ; profil dashboard + coercition lecture ; pondérations étendues sur [`POST /api/probability`](../app/api/probability/route.ts) |
| B.36 | Masquage demandes déléguées (admin) | [`lib/delegated-application-payload-utils.ts`](../lib/delegated-application-payload-utils.ts) ; [`GET /api/admin/delegated-application-requests`](../app/api/admin/delegated-application-requests/route.ts) ; [`GET .../[id]`](../app/api/admin/delegated-application-requests/[id]/route.ts) `?fullPayload=1` ; onglet Assist [`admin/page.tsx`](../app/(dashboard)/admin/page.tsx) |
| B.37 | Export données RGPD (pack JSON) | [`lib/user-gdpr-export.ts`](../lib/user-gdpr-export.ts) ; [`GET /api/user/data-export`](../app/api/user/data-export/route.ts) (`?inline=1` optionnel) ; profil [`profile/page.tsx`](../app/(dashboard)/profile/page.tsx) |
| B.38 | Stratégie i18n chaînes métier | [`docs/business-strings-i18n.md`](business-strings-i18n.md) ; [`lib/i18n/`](../lib/i18n/) ; pilote catalogues dans [`lib/score-driver-explain.ts`](../lib/score-driver-explain.ts) (`formatScoreDrivers`, locale `fr` \| `en`) |

### Lot pipeline observations catalogue C (items 39–40)

| ID catalogue | Livrable | Fichiers / notes |
|--------------|----------|------------------|
| C.39 | Rétention `CountryObservation` | [`docs/country-observation-retention.md`](country-observation-retention.md) ; [`scripts/prune-country-observations.ts`](../scripts/prune-country-observations.ts) ; workflow dry-run [`.github/workflows/country-observation-maintenance.yml`](../.github/workflows/country-observation-maintenance.yml) |
| C.41 | Dashboard admin volumes pipeline | [`GET /api/admin/intelligence/summary`](../app/api/admin/intelligence/summary/route.ts) ; onglet Intelligence [`admin/page.tsx`](../app/(dashboard)/admin/page.tsx) |

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

- Moteurs (formules + version + échelles B.27 + i18n pilote B.38) : [engine-probability-vs-recommendation.md](engine-probability-vs-recommendation.md), [lib/score-scale-lexicon.ts](../lib/score-scale-lexicon.ts), [business-strings-i18n.md](business-strings-i18n.md)
- Spécification liste légère : [app/api/countries/route.ts](../app/api/countries/route.ts) (`?light=1`)
- Rétention + compaction observations : [country-observation-retention.md](country-observation-retention.md)
- CI : [ci.yml](../.github/workflows/ci.yml)
