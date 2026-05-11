# PAGE 04 — “SHIELD”
## Vue Schengen — espace mobilité zone Schengen

### File Name
`04-shield-schengen-atlas.md`

### Page Type
Public

### Related User Journeys
- Préparation voyage court séjour
- Compréhension membres / règles dedupe (données techniques)
- Navigation depuis explorer

### Connected Pages
- **Précédent :** `/explorer`, navbar
- **Suivant :** pays Schengen individuels `/countries/[id]`, `/compare`

---

## 1. Page Purpose
Centraliser la **lecture zone Schengen** : membres, signaux, éventuelles ambiguïtés de données (clefs lookup). Répond à *“Comment la zone s’articule pour mon besoin ?”* Business : SEO thématique forte + rétention utilisateurs Europe.

---

## 2. Primary User Actions
- **Primaires :** parcourir liste / cartes membres ; accéder fiche pays.
- **Secondaires :** filtrer (si présent) ; lire encadrés légaux disclaimers.
- **Conversion :** vers probabilité / reco pour “chances visa court séjour”.

---

## 3. UX Goals
- **Clarté géopolitique** sans ton juridique effrayant.
- **Confiance** via distinction claire “information indicative”.

---

## 4. Layout Architecture
**Implémentation (`app/(public)/schengen/page.tsx`, client) :** titre + recherche → **barre comparer (2–4 pays)** → **tableau comparatif côte à côte** (si ≥ 2 sélectionnés) → **`GoogleAd`** → chargement spinner ou **liste mobile** / **table desktop** des membres Schengen avec colonnes friction / acceptation / ambassade + toggle **Comparer** par ligne.

**Source liste :** `GET /api/countries` → `normalizeCountriesApiListResponse` → filtre **`isSchengenMember(name)`** (canonical nom, pas seul `schengen_flag`).

---

## 5. Full Section Breakdown

### 5.1 Hero & recherche
- **`h1` + `ShieldCheck` :** “Schengen · Intelligence”.
- **Champ search :** filtre client sur nom pays (`filtered`).

### 5.2 Sélection comparer (2–4)
- **Barre chips :** pays sélectionnés avec `X` pour retirer ; hint si vide.
- **`toggleCompare` :** max **4** ids ; idempotence clic.

### 5.3 Table “Comparaison côte à côte”
- **Si `compareCountries.length >= 2` :** lignes `CompareRow` — Acceptation (Maroc), Score friction, Niveau de risque, Délai rendez-vous (`friction_analysis`).
- **Scroll horizontal** sur petit écran.

### 5.4 `GoogleAd slot="schengen_top"`
- **Purpose :** monétisation sous la zone décisionnelle primaire.

### 5.5 Liste mobile (`md:hidden`)
- **Carte pays :** lien `/countries/[id]` + drapeau ; barre acceptation % ; badge friction coloré (`scoreClass`) ; citation `embassy_behavior` tronquée.

### 5.6 Table desktop (`hidden md:block`)
- **Colonnes :** Pays, Acceptation, Friction RDV, Risque, Comportement ambassade, colonne **Comparer** (bouton état sélectionné).

### 5.7 Intégrité données (produit)
- **Copy possible :** rappeler que l’appartenance Schengen est **dérivée du nom canonique** (commentaire code) — encart discret si la méfiance utilisateur remonte.

### 5.8 Journeys sortants
- **Fiche pays PAGE 16 ;** **PAGE 03** compare multi (pré-remplissage futur depuis sélection).

---

## 6. UI Design Direction
Palette légèrement plus **froide / slate** pour différencier zone EU sans rompre DS global — accents bleus désaturés + même `primary` pour CTA.

---

## 7. Interaction Design
Hover carte : border `primary` ; click : navigation instantanée.

---

## 8. Responsive UX
Table desktop → cartes mobile ; recherche inline pour 30+ entrées.

---

## 9. Accessibility
Liste navigable clavier ; drapeaux avec `alt` pays.

---

## 10. Edge Cases & States
Données incomplètes pour un membre : badge “en cours d’enrichissement”.

---

## 11. User Journey Connections
Boucle avec compare multi Schengen ; renvoi home.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Carte stylisée **Europe outline** ultra-light en filigrane. Grille **badges pays** style passeport holographique subtil (micro irisation). Section “Sources officielles” comme **pliage de document officiel** (bordure perforée illustrative).

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 04]
