# Moteurs VisaFlow : probabilité vs recommandation

> **Ticket catalogue B.23** — source de vérité descriptive alignée sur le code (`app/api/probability/route.ts`, `app/api/recommendation/route.ts`).  
> **Version** : voir `BABIL_ENGINE_VERSION` dans [`lib/engine-version.ts`](../lib/engine-version.ts) ; exposée en en-têtes HTTP `X-Babil-Engine-Version` et `X-Babil-Engine-Kind` sur les réponses `POST` des deux routes.

## Données d’entrée communes

- Liste pays : `buildMergedCountriesList()` puis repli `loadFallbackCountries()` si vide.
- Chaque pays est lu avec `materializePublicFullData(full_data)` pour les signaux issus de la fiche.
- **Recommandation** : profil normalisé `NormalizedProfile` (`income`, `savings`, `cnss`, `maritalStatus`, `familyInEU`, `goal` ∈ `TOURISM` | `STUDY` | `WORK` | `BUSINESS` | `SHORT_COURSE`).
- **Probabilité** : profil Prisma / formulaire (`age`, `profession`, `CNSS_status`, `marital_status`, `family_in_europe`, `income`, `savings`, …).

## Moteur de recommandation (`POST /api/recommendation`)

### Signaux pays (`readCountrySignals`)

- Scores visa 0–100 : tourisme, études, travail, affaires — modèles `compute*Mobility100` + fusion `mergeModelWithDbScalar01to100` avec les colonnes Prisma.
- `rejectionRisk`, difficulté RDV, délais, transparence, modules éducation (langue, technique, cours courts, PhD structuré), business (ouverture, street food).

### Piliers du score final

Le score affiché est une somme pondérée (tous les sous-scores sont clampés 0–100) :

| Pilier | Poids | Contenu |
|--------|-------|---------|
| **Visa** (`visaScore`) | **0,40** | Score visa de base selon l’objectif (étude/travail/affaires/tourisme+cours court), puis bonus/malus revenu vs `inferCountryBudgetThreshold(pays)`, bonus épargne (seuils ×3 et ×6), +10 CNSS, +5 famille UE. |
| **Friction** (`frictionScore`) | **0,20** | `100 - frictionPenalty` avec `frictionPenalty = 0,5×difficulté_RDV + 0,3×normalisation_délais(180j) + 0,2×(100-transparence)`. |
| **Adéquation objectif** (`goalMatchScore`) | **0,25** | Base 50, puis règles par objectif (modules éducation, business, short course, travail, tourisme neutre +5). |
| **Anti-risque** | **0,15** | `(100 - riskScore)` où `riskScore` part de `rejectionRisk` + règles tourisme/finances, célibataire, famille UE × difficulté. |

Formule :  
`finalScore = clamp(0.4×visa + 0.2×friction + 0.25×goalMatch + 0.15×(100−risk))`.

Les champs `breakdown` du JSON renvoyé reprennent ces quatre valeurs (le radar « Anti-risque » affiche `100 − risk` côté UI).

### Narration profil

`appendProfileContextNarratives` peut préfixer les explications du **premier** pays du classement avec des phrases dérivées du profil (âge, objectif).

### Invités (sans compte)

- Sans `playground` : profil fixe [`PUBLIC_READ_ONLY_DEMO_PROFILE`](../lib/public-read-only-demo-profile.ts) (page `/recommendations`).
- Avec `playground: true` + `profile` : profil sanitisé [`sanitizePublicSyntheticProfile`](../lib/public-synthetic-profile.ts) (page `/recommendation-engine`).

---

## Moteur de probabilité (`POST /api/probability`)

Approche **multi-facteurs** indépendante : chaque pays reçoit un `globalScore` 0–100 agrégé à partir de six familles de scores internes, puis tri décroissant.

### Pondération du `globalScore`

| Facteur | Poids | Rôle |
|---------|-------|------|
| Financier | **0,20** | `min(100, (savings/100000)×100×0.6 + (income/15000)×100×0.4)` |
| Professionnel | **0,20** | Base 40 ; +40 si CNSS ; +20 secteur public ; +10 indépendant |
| Social | **0,20** | Base 50 ; +10 marié ; ± selon `family_in_europe` et pays (Italie, France, Espagne, Grèce) |
| Contexte pays | **0,20** | Mélange acceptation Maroc (fiche) et facilité visa moyenne (`mergedVisaScores100WithDb`) |
| Facilité RDV | **0,10** | `100 - friction_score` si présent |
| Risque immigration | **0,10** | `100 - brutal_reality×10` si présent |

Bonus **+3** si la fiche a des données PhD structurées (`hasCountryPhdStoredData`).

Les `reasons` / `strategy` sont enrichis par `appendProfileContextNarratives`.

### Invités

Profil serveur identique au démo recommandation (`PUBLIC_READ_ONLY_DEMO_PROFILE`) — pas de bac à sable personnalisé sur `/probability` pour limiter la surface d’abus.

---

## Différences clés (produit)

| | Recommandation | Probabilité |
|---|----------------|------------|
| **Objectif** | Classement « meilleur match » pour un objectif visa explicite | Vue « chances de succès » plus profil socio-économique |
| **Visa** | Pilier central (40 %) | Intégré dans « contexte pays » (20 %) |
| **Friction** | Pilier dédié (20 %) | Pilier RDV (10 %) |
| **Sortie** | Top 10, breakdown radar 4 axes, `topDrivers` (3) | Liste triée, breakdown détaillé, `topDrivers` (3), `defaultsUsed` si fiche incomplète |

---

## Versionnement (ticket B.24)

- Constante : `BABIL_ENGINE_VERSION` (`lib/engine-version.ts`).
- Chaque réponse réussie ou erreur 500 inclut les en-têtes `X-Babil-Engine-Version` et `X-Babil-Engine-Kind` (`recommendation` | `probability`).
- Les corps d’erreur 500 peuvent inclure `engineVersion` pour le debug client.

---

## Échelles & nommage (ticket B.27)

- **Source de vérité code + libellés UI** : [`lib/score-scale-lexicon.ts`](../lib/score-scale-lexicon.ts) (`SCORE_SCALE_LEGEND_FR`, constantes de bornes).
- **Recommandation** : les quatre piliers du `breakdown` et le score final sont sur **0–100** (entiers arrondis côté API). Le champ historique `match_score` reste `finalScore / 10` (compatibilité).
- **Probabilité** : `globalScore` et les sous-scores agrégés du `breakdown` sont en **0–100**. Le signal brut `brutal_reality_score` dans `full_data` est une **échelle 0–10** ; le moteur le convertit en contribution 0–100 via `100 - brutal×10`. L’UI rappelle « /10 » quand elle cite la valeur brute fiche, et « % » pour les barres de breakdown.
- **Prisma `Country`** : les colonnes `tourist_visa_score`, `study_visa_score`, `work_visa_score`, `business_visa_score` sont des **snapshots 1–10** (voir commentaires `schema.prisma`) ; `mergeModelWithDbScalar01to100` les projette en **0–100** pour l’enrichissement et les moteurs. Le JSON `full_data` porte typiquement `friction_score` **0–100** et `brutal_reality_score` **0–10**.

---

## Top facteurs « SHAP-like » simplifiés (ticket B.26)

- **Idée** : par rapport à un profil de référence **neutre** (chaque pilier interne à **50** avant pondération), on calcule la contribution signée de chaque pilier au score final, puis on expose les **3 plus grandes** en valeur absolue.
- **Recommandation** : implémentation [`computeRecommendationTopDrivers`](../lib/score-driver-explain.ts), champ JSON `topDrivers` sur chaque ligne renvoyée par `POST /api/recommendation` (mêmes pondérations que la formule finale).
- **Probabilité** : [`computeProbabilityTopDrivers`](../lib/score-driver-explain.ts) sur les six facteurs qui entrent dans `globalScore` (finance, profession, social, contexte pays, RDV, risque immigration), champ `topDrivers` sur chaque pays.
- **UI** : listes « Facteurs les plus influents (vs neutre) » sur `/recommendations`, `/recommendation-engine`, `/probability` (détail pays).

---

## Signaux fiche manquants (ticket B.30)

- **Texte** : [`formatCountrySheetSignalsSummary`](../lib/probability-result-display.ts) et [`describeTopCountrySignals`](../lib/probability-result-display.ts) mentionnent explicitement **non renseigné** et le recours à une **valeur neutre (50)**.
- **API probabilité** : `defaultsUsed` liste les clés (`acceptance_rate_morocco`, `friction_score`, `brutal_reality_score`) pour lesquelles la fiche était vide ; [`orderedProbabilityBreakdown`](../lib/probability-result-display.ts) peut suffixer les libellés concernés (`· fiche non renseignée → neutre`, etc.).

---

## Agrégat confiance observations (ticket B.31)

- **Stockage** : chaque ligne `CountryObservation` porte un `confidence` **0–1** (défaut 0,7 en Prisma).
- **API fiche pays** : `GET /api/countries/[id]` ajoute `observationConfidenceAggregate` lorsqu’il existe au moins une observation — moyenne, min, max, `count` et `meanPercent` (0–100 arrondi). Voir [`getObservationConfidenceAggregateForCountry`](../lib/country-observation-confidence-db.ts).
- **UI** : la tuile « Confiance » garde `full_data.confidence_score` (0–100) ; une ligne **pipeline** sous la tuile résume l’agrégat quand il est disponible (distinct de la confiance fiche). Lexique : [`SCORE_SCALE_LEGEND_FR.pipelineObservationConfidence`](../lib/score-scale-lexicon.ts).

---

## Qualité données & sauts pipeline (ticket B.32)

- **Heuristiques `full_data.economy`** : cohérence PIB / population / PIB·hab., valeurs extrêmes — [`analyzeEconomyIndicatorsAnomalies`](../lib/intelligence-data-anomalies.ts).
- **Sauts** : deux dernières `CountryObservation` pour PIB nominal et population (taxonomie WB) — [`fetchObservationJumpAnomaliesForCountry`](../lib/intelligence-data-anomalies-db.ts).
- **API / UI** : `GET /api/countries/[id]` expose `dataQualityAnomalies` (liste `{ code, messageFr }`) si non vide ; encart « Signaux qualité données » sur la fiche et la vue imprimable.

---

## CountryInsight vs observations (ticket B.33)

- **Doc** : [country-insight-vs-observations.md](country-insight-vs-observations.md) — rôles, décision v1 (pas de fusion automatique), pistes d’évolution.

---

## Profil utilisateur : `goal_type` et `profession` (tickets B.34–B.35)

- **Contrat partagé** : [`USER_GOAL_TYPES` / `USER_PROFESSIONS`](../lib/user-profile-enums.ts) — parsing, mapping vers objectif moteur (`userGoalTypeToEngineGoal`), coercition `profession` en lecture.
- **API** : `POST /api/user/profile` rejette objectif ou profession inconnus (400 + liste des valeurs). `GET` renvoie `goal_type` et `profession` normalisés quand possible.
- **Moteurs** : `POST /api/recommendation` utilise le même parsing d’objectif ; `POST /api/probability` mappe la profession via `coerceStoredProfession` et ajuste légèrement le facteur professionnel pour les statuts couverts par l’enum.

---

## Demandes déléguées — masquage admin (ticket B.36)

- **Utilitaire** : [`redactDelegatedPayloadDeep`](../lib/delegated-application-payload-utils.ts), emails / téléphones / noms / champs type notes masqués ; `packageSnapshot` produit (nom de forfait, prix) conservé pour le contexte métier.
- **API** : liste admin — `contactEmailMasked` + `hasFormContactEmail` ; détail — `payloadRedactionApplied: true` par défaut, JSON complet avec `GET ?fullPayload=1` (toujours réservé aux admins).
- **Logs** : [`delegatedRequestLogContext`](../lib/delegated-application-payload-utils.ts) pour journaliser id / catégorie / package sans corps de payload.

---

## Journal `full_data` (ticket B.28)

- Clé JSON **`_data_changelog`** : liste chronologique inversée (plus récent en tête), entrées `{ at, actor, action, detail?, subjectId? }` avec `actor` ∈ `admin` | `agent` | `pipeline` | `system`.
- **Écritures branchées** : `PATCH /api/admin/countries/[id]` (détail des champs modifiés + `subjectId` = id utilisateur admin Prisma), upsert post-enrichissement dans [`agents/runner.ts`](../agents/runner.ts), matérialisation économie [`materializeEconomyObservationsForCountry`](../lib/intelligence-pipeline/materialize-economy-observations.ts).
- **Confidentialité** : le journal **n’est pas** renvoyé aux clients publics — [`materializePublicFullDataForApi`](../lib/country-full-data-materialize.ts) retire `_data_changelog` après normalisation (liste pays, fiche, reco, proba, enrich explorer).
- **Limite** : tronquer à 50 entrées par défaut ([`DEFAULT_MAX_FULL_DATA_CHANGELOG_ENTRIES`](../lib/full-data-changelog.ts)) ; pas d’historique infini en JSON.

---

## Snapshot contract ↔ fiche pays (ticket B.29)

- Liste de marqueurs attendus dans [`app/(public)/countries/[id]/page.tsx`](../app/(public)/countries/[id]/page.tsx) : [`COUNTRY_DETAIL_PAGE_CONTRACT_MARKERS`](../lib/country-intelligence-contract-display-snapshot.ts).  
- Test : [`lib/country-intelligence-contract-display-snapshot.test.ts`](../lib/country-intelligence-contract-display-snapshot.test.ts) (échec si la fiche publique retire un signal majeur sans mettre à jour le snapshot).

---

## Calibration & stabilité (ticket B.25)

- **Automatisé** : tests sur [`sanitizePublicSyntheticProfile`](../lib/public-synthetic-profile.test.ts) (bornes, objectifs, âge).
- **Backtests manuels** : après toute modification des formules, vérifier sur un jeu fixe de pays (ex. France, Canada, Turquie, Maroc-destination fictive si présent) que :
  - les ordres de grandeur restent cohérents ;
  - un même profil démo produit des classements stables entre déploiements (comparer `X-Babil-Engine-Version` et captures JSON).
- **Non régression** : si le comportement attendu change volontairement, incrémenter `BABIL_ENGINE_VERSION` et documenter le changement ici ou dans le changelog interne.

---

## Références code

- [`app/api/recommendation/route.ts`](../app/api/recommendation/route.ts) — `computeRecommendation`, `normalizeProfile`, `readCountrySignals`
- [`app/api/probability/route.ts`](../app/api/probability/route.ts) — boucle `countries.map` et pondérations
- [`lib/recommendation-radar-axes.ts`](../lib/recommendation-radar-axes.ts) — textes UI radar reco
