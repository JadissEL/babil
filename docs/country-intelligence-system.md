# Country Intelligence System — audit, architecture cible, exploitation

Document de référence pour transformer Babil en **plateforme de collecte et d’enrichissement** pays, sans se limiter à un scraper ponctuel.

---

## 1. Audit de l’existant

### 1.1 Schéma PostgreSQL actuel (`Country`)

- **Forces** : ligne par pays, identifiant stable, colonnes dénormalisées utiles aux listes (scores visa, friction, accès études, permis).
- **Faiblesses structurelles** :
  - **`full_data` en `String` JSON** : pas de contrainte de schéma côté SQL, pas d’historique par champ, pas de traçabilité source par attribut, migrations data difficiles.
  - **Doublon logique** : vérité partagée entre Prisma, `data/countries.json` et merge runtime (`countries-prisma-merge`) — utile en repli, mais source de dérive.
  - **Pas de table de provenance** : impossible de répondre proprement à « d’où vient ce chiffre ? » ni « quand a-t-il été observé ? ».
  - **`CountryInsight`** : texte libre, non relié à un modèle de confiance ni à des sources.
- **Champs potentiellement redondants** : friction / rendez-vous à la fois dans colonnes Prisma et dans `full_data.friction_analysis` / `appointment_audit` — acceptable comme **cache lecture** si la **source canonique** devient ailleurs.

### 1.2 Pipeline actuel

- **Seed / backfill** : normalisation (`materializePublicFullData`), scores dérivés, `_data_backfill`, `_agent.coverageManifest` — bonne base **qualité / contrat produit**.
- **Agent runner** : enrichit encore vers `Country` — à faire converger vers **écriture d’observations** puis **matérialisation** (voir §3).

### 1.3 Risques si on « scrape tout » sans couche sérieuse

- Données non comparables (unités, années), biais de langue, HTML fragile, duplication, impossibilité d’auditer — exactement ce que vous voulez éviter.

---

## 2. Architecture cible (vue d’ensemble)

### 2.1 Principes

1. **Sources d’abord** : registre de sources avec **niveau de confiance** (tiers A/B/C), URL, notes de licence.
2. **Observations append-only** : chaque valeur métier = une ligne `(pays, chemin logique, valeur JSON, source, date d’observation, confiance)` — historique naturel.
3. **Résolution déterministe** : fusion multi-sources par règles (tier > fraîcheur > confiance), pas par « dernier scraper gagne ».
4. **Matérialisation** : `Country.full_data` + colonnes Prisma restent le **cache lecture** pour l’API existante, reconstruits depuis les observations + règles métier.
5. **Runs traçables** : chaque exécution batch = `EnrichmentRun` (statut, stats, erreurs).

### 2.2 Modèle de données (implémenté — migration `intelligence_core`)

| Table | Rôle |
|--------|------|
| `IntelligenceSource` | Catalogue des sources fiables (slug unique, tier, URL, licence). |
| `EnrichmentRun` | Exécution de pipeline (statut, début/fin, résumé d’erreur, stats JSON). |
| `CountryObservation` | Fait atomique : `countryId`, `fieldPath` (notation pointée), `valueJson`, `sourceId`, `observedAt`, `confidence`, lien optionnel `runId`. |

### 2.3 Cartographie vers vos domaines métier

Les champs listés (général, immigration, études, travail, business, qualité de vie, créateurs, sport, etc.) sont mappés en **chemins logiques** sous un préfixe stable, par exemple :

- `general.population`, `general.capital`, `general.languages`, `general.currency`, …
- `mobility.schengen_member` (déjà canonique côté code : `schengen-members`)
- `mobility.driving.moroccan_license_recognition`, `mobility.driving.idp_required`, …
- `study.tuition_typical`, `study.student_work_allowed`, …
- `work.median_salary`, `work.unemployment_rate`, …
- `business.ease_of_setup_index`, `business.tax_summary`, …
- `quality.safety_index`, `quality.cost_of_living_index`, …
- `creator.filming_ease`, `creator.drone_rules_summary`, …

Le détail exact des clés doit **s’aligner** sur une **taxonomy versionnée** (fichier JSON ou table `FieldDefinition` en phase 2) pour éviter la dérive de noms.

### 2.4 Scoring & qualité (ligne directrice)

- **Pas de scores identiques par défaut** : les scores agrégés doivent combiner **plusieurs signaux** (ex. indices officiels + friction interne), avec **normalisation** (percentiles, z-score par cohorte région/objectif) et **gestion des manquants** (imputation explicite ou retrait du signal, jamais de « 5 partout » silencieux).
- **Détection d’anomalies** : écarts par rapport à la distribution régionale, sauts brutaux entre deux runs, incohérences logiques (ex. salaire min > salaire médian) — règles dans une couche `validate` du pipeline.
- Les scores **produit** existants (visa 1–10, etc.) restent **dérivés** à partir de champs normalisés + politique de produit, pas hardcodés par pays.

### 2.5 Automatisation

- **Jobs** : Vercel Cron → `GET /api/cron/intelligence-pipeline` (variable d’environnement **`CRON_SECRET`**, en-tête `Authorization: Bearer …`) ; fichier `vercel.json` (dimanche 04:00 UTC). Pour les gros volumes ou si la fonction dépasse le délai max, utiliser le workflow GitHub **Intelligence pipeline (weekly)** (`.github/workflows/intelligence-pipeline-weekly.yml`) avec le secret `DATABASE_URL`, ou un worker Render exécutant `npm run intelligence:world-bank:materialize`. Query `?mode=materialize` : matérialisation seule (sans nouvelle collecte WB).
- **Cache** : cache HTTP/API pour lectures publiques ; invalidation après run réussi de matérialisation.
- **Retry** : au niveau connecteur (backoff, idempotence par `runId` + clé naturelle observation).
- **Monitoring** : statut `EnrichmentRun`, logs applicatifs, alerte si `PARTIAL` / `FAILED`.
- **Admin** : `GET /api/admin/intelligence/summary` (auth admin Clerk) — dernier run, nombre de sources, nombre d’observations.

### 2.6 IA & personnalisation (phase ultérieure, sur cette base)

- **Classement par objectif** : fonction de score vectoriel sur dimensions normalisées (tourisme, études, travail…) — déjà amorcé côté compare/recommendation.
- **Explicabilité** : pour chaque pays, renvoyer les **top facteurs** + **sources** + **dates** issues de `CountryObservation`.
- **Suggestions** : modèles ou règles sur lacunes (`criticalMissing` du contrat) pour prioriser les enrichissements.

### 2.7 UX

- Pages pays / compare : bandeau « Données mises à jour le … » et liste **sources** (agrégées depuis observations gagnantes).
- API détail : `GET /api/countries/[id]?intelligence=1` ajoute `intelligence_provenance` (chemins, `observedAt`, confiance, source slug/nom/tier).
- Filtres par objectif : inchangés côté route, enrichis par métadonnées de confiance.

---

## 3. Pipeline d’enrichissement (cible)

```
Collecte (connecteurs API / fichiers officiels / saisie validée)
  → Validation (schéma, unités, cohérence)
  → Normalisation (taxonomie, devises, années)
  → Scoring interne (optionnel à ce stade)
  → Persistance observations (+ run)
  → Résolution multi-sources
  → Matérialisation → Country.full_data + colonnes Prisma
  → Invalidation cache + complétude / contrat produit
```

**Cette livraison** pose : tables, seed des sources, résolution déterministe, CLI pipeline, connecteur **World Bank Open Data** (population `SP.POP.TOTL`, PIB USD `NY.GDP.MKTP.CD`, PIB/hab. `NY.GDP.PCAP.CD`, espérance de vie `SP.DYN.LE00.IN`), collecte **par lots multi-pays** (jusqu’à ~40 codes ISO2 par requête et indicateur, `MRV=1`), **matérialisation** vers `full_data` (`economy.gdp_usd`, `economy.population_wb`, `economy.gdp_per_capita_usd`, `health.life_expectancy_years`), provenance optionnelle `GET /api/countries/[id]?intelligence=1`, route admin `GET /api/admin/intelligence/summary`, doc.

### 3.1 World Bank (officiel, sans clé API)

- Résolution **ISO2** : carte des noms anglais World Bank + mapping existant `country-card-mappers` + canon Schengen.
- Commandes :
  - `npm run intelligence:world-bank` — collecte pour tous les pays (beaucoup moins d’appels HTTP qu’en séquentiel grâce au batching ; petit délai entre lots pour respecter l’API).
  - `npm run intelligence:world-bank -- --limit 10` — échantillon.
  - `npm run intelligence:materialize-economy` — applique les dernières observations en base vers `full_data`.
  - `npm run intelligence:world-bank:materialize` — enchaîne les deux.
- Taxonomie des champs : `lib/intelligence-pipeline/taxonomy-v1.ts` (`general.population_total`, `economy.gdp_usd_current`, `economy.gdp_per_capita_usd_current`, `quality.life_expectancy_years`).
- **Overrides ISO2** : `lib/intelligence-pipeline/country-iso-overrides.ts` pour les noms qui ne matchent pas le libellé World Bank (ex. `DR Congo` → `cd`, `South Korea` → `kr`).

Les connecteurs **UN Data, OECD, …** restent à brancher sur le même modèle `CountryObservation`.

---

## 4. Stratégie de maintenance

1. **Versionner la taxonomie** des `fieldPath` (ex. `taxonomy/v1/fields.json`).
2. **Ne jamais modifier** une observation historique : marquer `superseded` ou nouvelle ligne + résolution.
3. **Rejouer** la matérialisation après chaque run complet ou par pays.
4. **Revue humaine** pour les sources `TIER_C_CURATED` et pour les champs critiques visa/permis.
5. **Alignement** avec `lib/country-intelligence-contract.ts` : les champs contrat peuvent être couverts progressivement par des observations.

---

## 5. Prochaines étapes concrètes (priorisées)

1. Appliquer la migration : `npx prisma migrate deploy` (ou `npx prisma migrate dev` en local), puis `npx prisma generate`.
2. Initialiser le catalogue sources : `npm run intelligence:seed-sources`.
3. Lancer une collecte test : `npm run intelligence:world-bank -- --limit 5` puis `npm run intelligence:materialize-economy`.
4. Étendre la **taxonomie** (`taxonomy-v1`) pour études, travail, qualité de vie, créateurs, sport.
5. Ajouter connecteurs **OECD / UN / ILO** avec quotas et cache.
6. Matérialisation **multi-domaines** (au-delà de `economy.*`) + exposition UI des sources.
7. Jobs planifiés : configurer **`CRON_SECRET`** sur Vercel (cron configuré dans `vercel.json`) et/ou activer le workflow hebdomadaire GitHub avec **`DATABASE_URL`** ; surveiller `EnrichmentRun` en échec.

---

*Document généré pour cadrer le produit ; le code associé vit sous `lib/intelligence-pipeline/` et `prisma/schema.prisma`.*
