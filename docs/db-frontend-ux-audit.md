# Audit base de données ↔ site web ↔ expérience utilisateur

**Date :** 2026-05-08  
**Portée :** schéma Prisma, APIs publiques et dashboard, `full_data`, fichiers statiques (`data/countries.json`), pipelines intelligence et agents.  
**Philosophie :** ce document **ne prescrit aucune suppression** sans validation humaine explicite. Les données « invisibles » peuvent être **stratégiques** (confiance, conformité, évolution produit, ML futur).

**Documents connexes :**  
- `docs/internal-country-data-pipeline-audit.md` — chaîne pays / merge / runner (2026-05-05)  
- `docs/country-intelligence-system.md` — intelligence multi-sources  
- `lib/country-intelligence-contract.ts` — contrat de champs `full_data` / colonnes

---

## 1. Méthodologie et garde-fous (« penser 5 fois »)

Pour chaque donnée, l’analyse distingue :

| Critère | Question |
|--------|----------|
| **Fonctionnel** | Est-elle lue par une route, un script, un job, un agent ? |
| **UX directe** | Est-elle affichée ou transformée en score visible ? |
| **Indirect** | Scoring (`lib/scoring/*`), recommandation, probabilité, filtres explorer ? |
| **Futur** | Roadmap intelligence, comparaisons enrichies, personnalisation ? |
| **Doublon** | Même sémantique en colonne Prisma **et** dans `full_data` ? |
| **Risque suppression** | Casser un flux silencieux (admin, sync Render, seed, cron) ? |

**Règle d’or :** *KEEP* ou *IMPROVE* par défaut pour tout ce qui alimente scoring, contrat produit, ou traçabilité. *SAFE TO DELETE* uniquement après preuve d’absence totale d’usage **et** absence d’intention produit documentée.

---

## 2. Vue d’ensemble des tables Prisma

| Table | Rôle principal | Exposition API / UI |
|-------|----------------|---------------------|
| `Country` | Vérité opérationnelle pays (colonnes + `full_data` JSON) | `GET /api/countries`, `GET /api/countries/[id]`, layouts SEO, explorer, compare, reco, proba, éducation, pages pays |
| `Comment` | Avis modérés | Détail pays (commentaires `APPROVED` + nom utilisateur) |
| `CountryInsight` | Blocs OSINT / friction / sentiment (texte) | **Non inclus** dans les `findUnique` / listes publiques — voir §6 |
| `User` | Identité app (Clerk `id`, email, nom, `role`) | Upsert via favoris / commentaires / profil / délégations ; `role` pour admin |
| `UserProfile` | Profil économique / familial / objectif | `GET/POST /api/user/profile` ; consommation partielle par `/api/probability`, `/api/recommendation` |
| `FavoriteCountry` | Favoris | `GET/POST /api/user/favorites` ; cœur sur fiche pays |
| `UserHistoryEvent` | Journal d’événements (type + payload JSON) | `POST` depuis fiche pays ; `GET /api/user/history` **sans écran dédié repéré** |
| `DelegatedApplicationRequest` | Demandes délégation (catégorie, package, payload) | APIs user + admin |
| `IntelligenceSource` | Catalogue sources (WB, etc.) | Admin `GET /api/admin/intelligence/summary`, seed CLI |
| `EnrichmentRun` | Runs pipeline (stats, erreurs) | Même admin + cron |
| `CountryObservation` | Faits append-only (taxonomie `fieldPath`) | Provenance optionnelle `GET /api/countries/[id]?intelligence=1` ; matérialisation → `full_data` |

---

## 3. Cartographie détaillée : `Country`

### 3.1 Colonnes scalaires Prisma

| Colonne | Backend | UX / produit |
|---------|---------|----------------|
| `id`, `name`, `region` | Toutes les listes, merge, agents | Cartes, filtres région, liens `/countries/[id]` |
| `schengen_flag` | Merge **écrase** par `isSchengenMember(name)` (canonique) | Filtre Schengen, badges |
| `tourist_visa_score` … `business_visa_score` | Merge avec `data/countries.json` ; `enrichCountryApiRecord` ; scoring | Cartes (visa), barres fiche pays, moteurs reco/proba |
| `appointment_difficulty` | Merge ; défaut `Medium` si vide | Filtres explorer, copy friction |
| `visa_processing_time`, `rejection_risk` | Payload API | Utilisés selon surfaces (reco / copy) |
| `language_study_access`, `technical_training_access`, `short_course_access` | API | Complétude + certains écrans éducation / enrich |
| `street_food_business_access` | API + `computeBusinessMobility100` | Business / scoring |
| `driving_license_status` | API + materializations permis | Permis / cartes si branché |
| `full_data` | Cœur du produit (JSON string → parsé / mergé / materialisé) | Quasi toute la richesse UX hors colonnes |

**Duplication volontaire :** colonnes 1–10 et champs dérivés dans `full_data` peuvent coexister ; les libs de scoring **fusionnent** modèle et snapshot DB (`mergeModelWithDbScalar01to100`, etc.). Ce n’est pas du « gaspillage » automatiquement supprimable : c’est un **cache lecture** et une **stabilité API**.

### 3.2 `full_data` (JSON)

- **Contrat explicite :** `COUNTRY_INTELLIGENCE_CONTRACT_V2` (+ version `CONTRACT_VERSION`) liste les chemins attendus pour complétude agent / qualité.
- **Merge :** `mergeDisplayedFullData` + `materializePublicFullData` — le statique comble les blocs manquants après runner.
- **Usages indirects majeurs :** `official_score`, `friction_score`, `acceptance_rate_morocco`, `visa_system`, `appointment_audit`, `friction_analysis`, `education_mobility`, `street_food`, `driving_license` / `driving_rights`, `morocco_insights`, `travel_reasons`, `traveler_quotes`, `phd_studies`, `_agent.*`, indicateurs matérialisés `economy.*`, `health.*`, `work.*`.

**Verdict :** `full_data` est un **actif stratégique** même si chaque clé n’a pas un widget dédié : elle alimente scoring, comparateur, hero, doctorat, permis, et futures briques intelligence.

---

## 4. Système intelligence (`IntelligenceSource`, `EnrichmentRun`, `CountryObservation`)

| Élément | Utilisation |
|---------|-------------|
| Observations | Écrites par collecte WB (batch) ; lues pour matérialisation et `?intelligence=1` |
| `statsJson` (runs) | Métadonnées opérationnelles (ex. `apiBatchCalls`) — utile monitoring, pas affichage grand public |
| Tables | Croissance monotone (append-only) — **à gérer par rétention / archivage**, pas par suppression aveugle de schéma |

**UX actuelle :** provenance **opt-in** sur l’API détail.  
**Amélioration produit :** bandeau « Sources : Banque mondiale, mise à jour le … » sur la fiche pays (déjà partiellement couvert par `_intelligence.economy_materialized_at` + carte indicateurs WB).

---

## 5. Utilisateur : `User`, `UserProfile`, `FavoriteCountry`, `UserHistoryEvent`

### 5.1 `User`

- Créé / mis à jour par Clerk + routes profil, favoris, commentaires, délégations.
- `role` : `ADMIN` pour `getAdminUser` — **critique**, ne jamais supprimer sans remplacer le modèle d’auth admin.

### 5.2 `UserProfile`

| Champ | Formulaire profil | `/api/probability` | `/api/recommendation` |
|-------|-------------------|--------------------|------------------------|
| `income`, `savings` | Oui | Oui (pondération financière) | Normalisé dans le profil reco |
| `CNSS_status` | Oui | Oui (forte pondération pro) | Via normalisation |
| `profession` | Oui | Oui (valeurs type `public` / `self-employed`) | Indirect |
| `marital_status`, `family_in_europe` | Oui | Oui (score social + pays cible) | Indirect |
| `family_details` | Oui (saisie libre) | **Non utilisé dans la boucle de score actuelle** | **Opportunité** : explicabilité / risque |
| `goal_type` | Oui | **Peu ou pas exploité dans la formule proba affichée** | Oui (objectif TOURISM/STUDY/…) |
| `age` | Oui (validé 16–120) | **Non utilisé dans le snippet proba** | Selon normalisation reco |

**Catégorisation :** champs profil = **KEEP** ; `family_details`, `age`, `goal_type` côté proba = **IMPROVE** (expliquer le score, calibrer par âge, aligner objectif).

### 5.3 `FavoriteCountry`

- Entièrement utilisé (API + UI cœur). **KEEP**.

### 5.4 `UserHistoryEvent`

- **Écrit** : `VIEW_COUNTRY` depuis la fiche pays.
- **Lu** : `GET /api/user/history` existe.
- **Affiché** : pas de page « historique » repérée dans le grep frontend.

**Catégorisation :** **KEEP** (analytics, personnalisation future, support). **IMPROVE / DISPLAY ON UI** : section « Récemment consultés » ou alimenter recommandations « reprendre ».  
**Pas ARCHIVE** sans décision produit : les données sont déjà structurées et peu coûteuses.

---

## 6. `CountryInsight` — cas particulier important

**Constat technique :** `GET /api/countries/[id]` inclut désormais `insights` (ordre `id` desc, max 25) ; la fiche pays affiche un encart repliable **Notes terrain (base de données)** lorsque du contenu existe. Le merge liste standard reste inchangé. Le script `sync-countries-to-render.ts` synchronise ces lignes vers un autre déploiement.

**Interprétation produit :** ce n’est **pas** « données inutiles » : c’est une **couche non branchée** au frontend Next actuel.

| Catégorie | Recommandation |
|-----------|----------------|
| **KEEP** | Conserver le modèle tant qu’une stratégie OSINT / friction existe ou est envisagée. |
| **IMPROVE / DISPLAY ON UI** | Exposer un encart « Lecture terrain / friction » sourcé depuis `CountryInsight` ou fusion progressive vers `full_data` versionné. |
| **SAFE TO DELETE** | **Non recommandé** sans audit métier : risque de perte sémantique et de divergence avec sync Render. |

---

## 7. `Comment`, `DelegatedApplicationRequest`

- **Comment :** flux modération `PENDING/APPROVED/REJECTED` — visible uniquement si approuvé. **KEEP** ; impact confiance communauté.
- **DelegatedApplicationRequest :** données métier sensibles dans `payload` JSON — **KEEP** ; vérifier conformité RGPD / rétention en dehors de ce doc technique.

---

## 8. Données hors PostgreSQL : `data/countries.json`

- **Rôle :** fallback riche, couverture quand la DB est partielle, merge par **nom** de pays.
- **Risque :** dérive vs DB si les deux évoluent sans discipline.

**Stratégie :** **KEEP** comme filet de sécurité et référence seed ; **IMPROVE** processus (une source de vérité « canonique » documentée par environnement).

---

## 9. Mapping synthétique DB → API → UI

```
Country (+ merge JSON)
  → GET /api/countries ──► Explorer, Compare, Home showcase, Hero (travel_reasons), Education hub
  → GET /api/countries/[id] ──► Fiche pays, SEO layout
  → POST /api/recommendation | /api/probability ──► Dashboard reco / proba

UserProfile
  → GET/POST /api/user/profile ──► Page profil
  → injecté dans reco/proba si connecté

CountryObservation (+ materialize)
  → full_data (economy, health, work, …)
  → ?intelligence=1 ──► provenance (optionnel)

UserHistoryEvent
  → POST (fiche pays) ; GET /api/user/history ──► (pas d’UI liste identifiée)

CountryInsight
  → (pas sur API publique standard) ──► aucune UI Next actuelle

Admin
  → intelligence summary, countries patch, agents health, délégations
```

---

## 10. Catégorisation (résumé exécutif)

### KEEP (ne pas supprimer ; fondation)

- Tout le modèle `Country` y compris `full_data`.
- `User`, `UserProfile`, `FavoriteCountry`, `Comment`, `DelegatedApplicationRequest`.
- `IntelligenceSource`, `EnrichmentRun`, `CountryObservation`.
- `UserHistoryEvent`.
- `CountryInsight` (non branché ≠ inutile).
- Fichier statique `data/countries.json` (tant que le merge en dépend).

### IMPROVE (données utiles mais sous-exploitées)

- Champs profil : `age`, `family_details`, `goal_type` dans les **formules** et l’**explicabilité** proba/reco.
- `UserHistoryEvent` : produit « continuez votre exploration » ou scoring de fraîcheur d’intérêt.
- Provenance intelligence : affichage systématique (ou opt-out) sur fiche pays pour **confiance**.
- Alignement contract ↔ UI : champs `COUNTRY_INTELLIGENCE_CONTRACT_V2` remplis mais sans surface (prioriser par domaine visa / friction / éducation).

### DISPLAY ON UI (forte valeur UX sans nouveau collecte)

- Indicateurs WB déjà matérialisés (élargir tooltips « source + année »).
- `_agent.completeness` / manifest pour utilisateur avancé ou mode « transparence » (premium).
- `CountryInsight` : vignette friction / OSINT si contenu présent.

### ARCHIVE (stratégie de données, pas suppression immédiate)

- Anciennes `CountryObservation` : politique de rétention (ex. garder N dernières par `fieldPath` + export froid) — **à décider** avec contraintes légales et coût stockage.
- `EnrichmentRun` anciens : archivage stats pour audit qualité.

### SAFE TO DELETE (très peu d’entrées — **validation humaine obligatoire**)

- **Aucune colonne ou table du schéma actuel n’est recommandée pour suppression directe** dans ce rapport.
- Candidats **éventuels** après analyse métier + migration : uniquement si une table entière est abandonnée **officiellement** (ex. décision produit de ne jamais brancher `CountryInsight` **et** arrêt sync externe) — alors migration dédiée + backup, pas « drop column » impulsif.

---

## 11. Duplications et cohérence

| Zone | Observation |
|------|-------------|
| Scores visa colonnes vs `full_data` | Fusion contrôlée par libs ; garder les deux tant que les pipelines (seed, runner, scoring) s’y réfèrent. |
| `schengen_flag` DB vs calcul canonique | La valeur servie au client est **recalculée** ; la colonne DB sert de repli / outils — **KEEP**. |
| Static JSON vs DB | Risque de vérité double — **IMPROVE** gouvernance (documenter « qui gagne » par environnement — déjà largement : DB + merge). |

---

## 12. Performance et backend

- **`full_data` volumineux** : chargé sur listes — surveiller taille JSON, index uniquement sur colonnes relationnelles ; le « poids » est surtout **réseau et parse**, pas des index SQL inutilisés sur JSON.
- **`CountryObservation`** : index `(countryId, fieldPath)` adapté aux lectures matérialisation et provenance ; croissance = **partitionnement / rétention** à terme.
- **Requêtes** : listes pays avec `comments` inclus — utile pour cartes si commentaires affichés ; sinon **IMPROVE** avec `select` minimal ou paramètre `?light=1` si un jour les perfs imposent.

---

## 13. Plan d’amélioration UX basé sur les données **déjà** stockées (priorisé)

1. **Historique de navigation** : exploiter `UserHistoryEvent` pour un carrousel « Reprendre » (sans nouveau stockage). — **Fait** : section « Reprendre vos recherches » sur le tableau de bord (`/overview`), à partir des événements `VIEW_COUNTRY`.
2. **Transparence scores & profil** : le moteur de probabilité enrichit les `reasons` / `strategy` avec **âge** et **objectif** (`goal_type`) — sans changer les pondérations numériques. **UI** : bandeau « Profil pris en compte » sur `/probability` et `/recommendations`. **Reco** : mêmes textes préfixés sur l’explication du **premier** pays classé. Extension possible : expliciter acceptation / friction par pays dans l’UI.
3. **Provenance intelligence** : bloc repliable « Sources des données intelligence » sur fiche pays (chargement paresseux `?intelligence=1`). Lien admin pour power users inchangé.
4. **CountryInsight** : décision produit unique — soit intégration UI, soit migration vers observations versionnées ; pas suppression silencieuse.

---

## 14. Conclusion CTO / produit

La base Babil n’est **pas** un grenier de champs morts : elle mélange **cache relationnel**, **document JSON stratégique**, **journal utilisateur**, et **graphe d’intelligence** en construction. L’écart principal n’est pas « données inutiles » mais **données sous-monétisées côté UX** (historique, insight, profil, provenance).

**Toute suppression de schéma doit passer par :** (1) cette matrice d’impact, (2) recherche `grep` / usages agents / scripts, (3) migration Prisma + plan rollback, (4) validation produit / juridique si données personnelles ou historiques.

---

*Fin du rapport — audit rédigé pour décision humaine, pas pour exécution automatique de nettoyage.*
