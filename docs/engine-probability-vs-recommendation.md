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

- **Recommandation** : les quatre piliers du `breakdown` et le score final sont sur **0–100** (entiers arrondis côté API). Le champ historique `match_score` reste `finalScore / 10` (compatibilité).
- **Probabilité** : `globalScore` et les sous-scores agrégés du `breakdown` sont en **0–100**. Le signal brut `brutal_reality_score` dans `full_data` est une **échelle 0–10** ; le moteur le convertit en contribution 0–100 via `100 - brutal×10`. L’UI rappelle « /10 » quand elle cite la valeur brute fiche, et « % » pour les barres de breakdown.
- **Prisma** : les colonnes `tourist_visa_score`, `study_visa_score`, etc. sont stockées en **0–100** (aligné UI).

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
