# PAGE 06 — “COMPASS”
## Mes recommandations — carte et liste des destinations suggérées

### File Name
`06-compass-saved-recommendations.md`

### Page Type
Public (gating auth via modal patterns)

### Related User Journeys
- Retour utilisateur après moteur reco
- Exploration géographique des suggestions

### Connected Pages
- **Précédent :** `/probability`, `/recommendation-engine`
- **Suivant :** `/countries/[id]`, auth

---

## 1. Page Purpose
Matérialiser les **résultats moteur** en **vue cartographique + liste** navigable. Résout *“Où est-ce que le système me pousse à regarder ?”* Business : rétention + reclics pays.

---

## 2. Primary User Actions
- **Primaires :** sélectionner point carte ; ouvrir pays.
- **Secondaires :** filtrer par score / région ; trier.
- **Conversion :** sign-in pour persistance API favorites/history.

---

## 3. UX Goals
- **Orientation spatiale** immédiate.
- **Clarté ranking** sans humiliation des destinations basses.

---

## 4. Layout Architecture
**Implémentation actuelle (`app/(public)/recommendations/page.tsx`) :** titre “Intelligence de recommandation” → bannières profil / mode démo → **graphique** (`ScoreBreakdownChart` + pays actif) → **panneau** `RecommendationPanel` + barres métriques (`Progress`) — **pas** de carte géo sur cette route (la “boussole” est la **liste classée + chart**, pas une map).

---

## 5. Full Section Breakdown

### 5.1 Suspense & skeleton
- Même pattern que probabilités : `Suspense` + fallback `DashboardPageSkeleton` sous le `h1`.

### 5.2 Chargement reco & profil
- **Connecté :** profil `GET /api/user/profile` puis reco (logique équivalente probabilités côté API reco — voir code).
- **Anonyme :** profil démo + bannière `SignInButton` modal.
- **Query `countryId` / `countryName` :** focus pays pour chart / highlight (aligné PAGE 05).

### 5.3 Métriques synthèse (`RecoMetricBar`)
- **Purpose :** barres label + valeur 0–100 pour lecteurs qui préfèrent chiffres aux courbes.

### 5.4 `ScoreBreakdownChart` + sélection pays
- **Purpose :** inspecter un pays du top-N sur les axes du breakdown.
- **État :** `chartCountryId` ; loading chart cohérent avec liste.

### 5.5 `RecommendationPanel` + mode compare
- **Purpose :** lignes mappées via `mapApiRecommendationToPanelRow` ; toggle **compare** multi-sélection (voir implémentation `compareMode` / `compareSelectedIds`).
- **Empty :** message + liens explorer / compare objectif-aware (`ctaExploreHref`, `ctaCompareHref`).

### 5.6 Drivers & narrative
- **Purpose :** `formatScoreDriversFrench` sur la ligne focus — expliquer “pourquoi” en français court.

### 5.7 Toasts & erreurs réseau
- **Purpose :** feedback non bloquant sur échec fetch / payload invalide.

### 5.8 Écart vs maquette “carte”
- **Note Stitch :** si le brief design impose une carte, traiter comme **variante future** ; la spec produit **PAGE 06** reste ancrée sur la liste + chart actuelles.

---

## 6. UI Design Direction
Carte **desaturated base** ; pins `primary` ; liste fond `surface`.

---

## 7. Interaction Design
Sync highlight liste ↔ pin ; smooth pan.

---

## 8. Responsive UX
Tabs bottom iOS style pour switch map/liste.

---

## 9. Accessibility
Liste navigable même si carte non utilisable — équivalent textuel ordre reco.

---

## 10. Edge Cases & States
Aucune reco : guide vers probability ; erreur géoloc : fallback liste seule.

---

## 11. User Journey Connections
Boucle vers compare multi picks.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Carte style **editorial travel print** (peu de labels UI sur la carte). Liste avec **rank chip** (#1, #2). Transition split slider entre carte et liste sur desktop.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 06]
