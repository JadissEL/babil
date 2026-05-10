# Tickets priorisés (extrait du catalogue « 100 améliorations »)

**Liste complète des 100 pistes (versionnée dans le repo) :** [enhancements-backlog-100.md](enhancements-backlog-100.md)

Ces chantiers sont **en cours de livraison** dans le dépôt (voir implémentations associées). Les autres items du catalogue restent dans le backlog produit/tech.

| ID | Thème | Ticket | Statut |
|----|--------|--------|--------|
| **T1** | Perf API | `GET /api/countries?light=1` — payload liste sans `full_data` ni `commentaires` (opt-in ; défaut inchangé) | Implémenté |
| **T2** | Ops données | Pipeline observations C.39–C.52 : rétention, compaction, admin, alertes, idempotence WB, stubs/queue, tests mock, seed doc, démographie WB, glossaire, cap `rawPayload`, **doc cron/environnements (C.51)**, **flags collecte par source (C.52)** — voir table C.39–C.52 + [intelligence-cron-and-environments.md](intelligence-cron-and-environments.md) | Implémenté |
| **T3** | CI | Workflow GitHub Actions : `audit:ci` + `lint` + **`format:check`** + `test:lib` + **`test:vitest`** + `build` sur push/PR | Implémenté |
| **T4** | Sécurité | Vérification RBAC admin : toutes les routes `/api/admin/*` passent par `getAdminUser()` ; test de garde | Implémenté |
| **T5** | Doc moteur | Formules reco vs proba + version API — [engine-probability-vs-recommendation.md](engine-probability-vs-recommendation.md), `lib/engine-version.ts`, en-têtes `X-Babil-Engine-Version` / `X-Babil-Engine-Kind` | Implémenté |
| **T6** | Transparence scoring | Top 3 facteurs, signaux fiche, snapshot contract/UI, journal `_data_changelog`, lexique B.27, agrégat confiance B.31, qualité données B.32, profil enum B.34–B.35, Assist masqué B.36, export RGPD B.37, **i18n pilote B.38** — voir fichiers listés en B.23–B.38 ci-dessous | Implémenté |
| **T7** | Perf API (catalogue D) | **D.54–D.60** pagination, cache HTTP, `unstable_cache`, Edge doc, corps max, rate limit. **D.61–D.62** timeout WB + Zod reco/proba. **D.63–D.65** OpenAPI + ETag pays + audit LCP home — [api-edge-rate-limits.md](api-edge-rate-limits.md), [home-lcp-and-images.md](home-lcp-and-images.md) | Implémenté |
| **T8** | Sécurité / supply chain (catalogue E) | **E.66–E.77** — voir [catalogue-e-security.md](catalogue-e-security.md) (RBAC, audit admin, Origin prod, erreurs API, modération, checklists at rest / DPA, tests scope, **webhook signé E.76**, Dependabot, Clerk 6) | Implémenté |

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

### Lot pipeline observations catalogue C (items 39–52)

| ID catalogue | Livrable | Fichiers / notes |
|--------------|----------|------------------|
| C.39 | Rétention `CountryObservation` | [`docs/country-observation-retention.md`](country-observation-retention.md) ; [`scripts/prune-country-observations.ts`](../scripts/prune-country-observations.ts) ; workflow dry-run [`.github/workflows/country-observation-maintenance.yml`](../.github/workflows/country-observation-maintenance.yml) |
| C.40 | Compaction dernière observation par triple | [`scripts/compact-country-observations.ts`](../scripts/compact-country-observations.ts) ; `npm run db:compact-observations(:dry)` |
| C.41 | Dashboard admin volumes pipeline | [`GET /api/admin/intelligence/summary`](../app/api/admin/intelligence/summary/route.ts) ; onglet Intelligence [`admin/page.tsx`](../app/(dashboard)/admin/page.tsx) |
| C.42 | Alertes `EnrichmentRun` (stuck / FAILED / PARTIAL) | [`lib/enrichment-run-alerts.ts`](../lib/enrichment-run-alerts.ts) ; `runAlerts` sur summary ; [`scripts/check-enrichment-run-alerts.ts`](../scripts/check-enrichment-run-alerts.ts) ; [`.github/workflows/enrichment-run-alerts.yml`](../.github/workflows/enrichment-run-alerts.yml) ; [enrichment-run-alerts.md](enrichment-run-alerts.md) |
| C.43 | Idempotence collecteur World Bank | [`lib/intelligence-pipeline/world-bank-dedupe.ts`](../lib/intelligence-pipeline/world-bank-dedupe.ts) ; [`world-bank-collector.ts`](../lib/intelligence-pipeline/world-bank-collector.ts) ; `CountryObservation.dedupeKey` dans [`prisma/schema.prisma`](../prisma/schema.prisma) |
| C.44 | Stubs OECD / IMF / UN (`IntelligenceSource`) | [`lib/intelligence-pipeline/stub-multilateral-collectors.ts`](../lib/intelligence-pipeline/stub-multilateral-collectors.ts) ; `npm run intelligence:pipeline -- --stub-collectors` |
| C.45 | Queue async `IntelligencePipelineJob` | [`prisma/schema.prisma`](../prisma/schema.prisma) ; [`scripts/intelligence-pipeline-enqueue.ts`](../scripts/intelligence-pipeline-enqueue.ts) ; [`scripts/intelligence-pipeline-worker-once.ts`](../scripts/intelligence-pipeline-worker-once.ts) ; [intelligence-pipeline-queue.md](intelligence-pipeline-queue.md) ; `pipelineJobQueue` sur summary admin |
| C.46 | Tests intégration mock HTTP (contrat WB) | [`lib/intelligence-pipeline/world-bank-client.integration.test.ts`](../lib/intelligence-pipeline/world-bank-client.integration.test.ts) |
| C.47 | Seed sources reproductible | [intelligence-seed-sources.md](intelligence-seed-sources.md) ; `npm run intelligence:seed-sources` |
| C.48 | Matérialisation étendue (démographie WB) | [`lib/intelligence-pipeline/taxonomy-v1.ts`](../lib/intelligence-pipeline/taxonomy-v1.ts) (`demographics.urban_population_pct` → `full_data.demographics.urban_population_wb_pct`) ; tuile fiche pays |
| C.49 | Glossaire `fieldPath` (provenance) | [`lib/intelligence-fieldpath-glossary.ts`](../lib/intelligence-fieldpath-glossary.ts) ; [`app/(public)/intelligence-fieldpaths/page.tsx`](../app/(public)/intelligence-fieldpaths/page.tsx) ; lien [`IntelligenceProvenanceCollapsible`](../components/country/IntelligenceProvenanceCollapsible.tsx) |
| C.50 | Limite taille `rawPayload` | [`lib/intelligence-pipeline/observation-raw-payload.ts`](../lib/intelligence-pipeline/observation-raw-payload.ts) ; appliqué dans [`world-bank-collector.ts`](../lib/intelligence-pipeline/world-bank-collector.ts) |
| C.51 | Doc cron, secrets, reprise partielle | [intelligence-cron-and-environments.md](intelligence-cron-and-environments.md) |
| C.52 | Désactivation collecte par source | [`lib/intelligence-pipeline/source-collection-flags.ts`](../lib/intelligence-pipeline/source-collection-flags.ts) ; variable `INTELLIGENCE_SOURCE_DISABLED_SLUGS` (`.env.example`) |

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

### Lot API / perf catalogue D (extrait 53–65)

| ID catalogue | Livrable | Fichiers / notes |
|--------------|----------|------------------|
| D.53 | Liste légère `?light=1` | [app/api/countries/route.ts](../app/api/countries/route.ts) (inchangé — déjà T1) |
| D.54 | Pagination curseur | [`lib/countries-list-pagination.ts`](../lib/countries-list-pagination.ts) ; `GET /api/countries?limit=&cursor=` |
| D.55 | Cache public + SWR | [`lib/public-api-cache.ts`](../lib/public-api-cache.ts) ; `GET /api/countries`, `GET /api/countries/[id]` |
| D.56 | React `cache` + `unstable_cache` liste fusionnée | [`lib/countries-prisma-merge.ts`](../lib/countries-prisma-merge.ts) — tag `MERGED_COUNTRIES_LIST_CACHE_TAG` |
| D.57 | Dédup requête + invalidation admin | `buildMergedCountriesList` → `getMergedCountriesListCached` ; [`PATCH .../admin/countries/[id]`](../app/api/admin/countries/[id]/route.ts) `revalidateTag` |
| D.58 | Middleware Edge (auth seulement) | [`proxy.ts`](../proxy.ts) ; [api-edge-rate-limits.md](api-edge-rate-limits.md) |
| D.59 | Taille max corps POST moteurs | [`lib/engine-post-body-limits.ts`](../lib/engine-post-body-limits.ts) ; `POST /api/recommendation`, `POST /api/probability` |
| D.60 | Rate limit POST moteurs | [`lib/engine-post-rate-limit.ts`](../lib/engine-post-rate-limit.ts) |
| D.61 | Timeout HTTP World Bank | [`lib/intelligence-pipeline/http-fetch.ts`](../lib/intelligence-pipeline/http-fetch.ts) ; [`world-bank-client.ts`](../lib/intelligence-pipeline/world-bank-client.ts) |
| D.62 | Zod POST reco/proba | [`lib/api-schemas/reco-proba-post-body.ts`](../lib/api-schemas/reco-proba-post-body.ts) |
| D.63 | OpenAPI public + `GET /api/openapi` | [`docs/openapi/babil-public-api.yaml`](openapi/babil-public-api.yaml) ; [`app/api/openapi/route.ts`](../app/api/openapi/route.ts) |
| D.64 | ETag faible + 304 | [`lib/http-weak-etag.ts`](../lib/http-weak-etag.ts) ; [`lib/json-response-with-etag.ts`](../lib/json-response-with-etag.ts) ; `GET /api/countries`, `GET /api/countries/[id]` |
| D.65 | Audit LCP home | [home-lcp-and-images.md](home-lcp-and-images.md) ; [`components/home/HeroWorldCarousel.tsx`](../components/home/HeroWorldCarousel.tsx) |

### Lot sécurité catalogue E (items 66–77)

| ID catalogue | Livrable | Fichiers / notes |
|--------------|----------|------------------|
| E.66 | RBAC `/api/admin/*` | [`lib/admin-api-routes.test.ts`](../lib/admin-api-routes.test.ts) ; `getAdminUser` sur chaque route admin |
| E.67 | Journal audit admin | [`prisma/schema.prisma`](../prisma/schema.prisma) `AdminAuditLog` ; [`lib/admin-audit-log.ts`](../lib/admin-audit-log.ts) ; [`GET /api/admin/audit-log`](../app/api/admin/audit-log/route.ts) ; [`lib/admin-audit-wiring.test.ts`](../lib/admin-audit-wiring.test.ts) |
| E.68 | Garde `Origin` mutations (prod) | [`lib/mutation-origin-guard.ts`](../lib/mutation-origin-guard.ts) ; [`lib/mutation-origin-wiring.test.ts`](../lib/mutation-origin-wiring.test.ts) |
| E.69 | En-têtes + HSTS prod | [`next.config.js`](../next.config.js) |
| E.70 | Hygiène secrets / GHA | [catalogue-e-security.md](catalogue-e-security.md) |
| E.71 | Erreurs API sans PII / stack | [`lib/api-public-error.ts`](../lib/api-public-error.ts) ; [`lib/api-public-error.test.ts`](../lib/api-public-error.test.ts) |
| E.72 | Rate limit POST commentaires + UI modération | [`lib/comment-post-rate-limit.ts`](../lib/comment-post-rate-limit.ts) ; [`POST /api/comments`](../app/api/comments/route.ts) ; [`/moderation`](../app/(dashboard)/moderation/page.tsx) |
| E.73 | Chiffrement at rest (checklist) | [catalogue-e-security.md](catalogue-e-security.md) §E.73 |
| E.74 | Sous-traitants / DPA (registre) | [catalogue-e-security.md](catalogue-e-security.md) §E.74 |
| E.75 | Garde scope API utilisateur (+ délégué) | [`lib/user-private-api-scope.test.ts`](../lib/user-private-api-scope.test.ts) |
| E.76 | Webhook signé ingest + dispatch événements | [`lib/webhook-signature.ts`](../lib/webhook-signature.ts) ; [`lib/webhook-ingest-dispatch.ts`](../lib/webhook-ingest-dispatch.ts) ; [`POST /api/webhooks/ingest`](../app/api/webhooks/ingest/route.ts) ; [`lib/webhook-signature.test.ts`](../lib/webhook-signature.test.ts) ; [`lib/webhook-ingest-wiring.test.ts`](../lib/webhook-ingest-wiring.test.ts) ; [`lib/webhook-ingest-dispatch.test.ts`](../lib/webhook-ingest-dispatch.test.ts) |
| E.77 | Audit deps + Dependabot | [`npm run audit:ci`](../package.json) ; [ci.yml](../.github/workflows/ci.yml) ; [dependabot.yml](../.github/dependabot.yml) |

## Références

- Moteurs (formules + version + échelles B.27 + i18n pilote B.38) : [engine-probability-vs-recommendation.md](engine-probability-vs-recommendation.md), [lib/score-scale-lexicon.ts](../lib/score-scale-lexicon.ts), [business-strings-i18n.md](business-strings-i18n.md)
- Limites Edge / corps / rate limit / timeout WB / Zod moteurs / OpenAPI / ETag pays / LCP home (D.58–D.65) : [api-edge-rate-limits.md](api-edge-rate-limits.md), [home-lcp-and-images.md](home-lcp-and-images.md)
- Liste pays : [app/api/countries/route.ts](../app/api/countries/route.ts) (`?light=1`, `?limit` + `?cursor`, en-têtes cache) ; merge serveur [`lib/countries-prisma-merge.ts`](../lib/countries-prisma-merge.ts) (`unstable_cache` + `cache`, tag + `revalidateTag` admin)
- Rétention + pipeline intelligence (C.39–C.52) : [country-observation-retention.md](country-observation-retention.md), [enrichment-run-alerts.md](enrichment-run-alerts.md), [intelligence-pipeline-queue.md](intelligence-pipeline-queue.md), [intelligence-seed-sources.md](intelligence-seed-sources.md), [intelligence-cron-and-environments.md](intelligence-cron-and-environments.md)
- CI + audit deps : [ci.yml](../.github/workflows/ci.yml), [dependabot.yml](../.github/dependabot.yml), [catalogue-e-security.md](catalogue-e-security.md)
