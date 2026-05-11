# PAGE 10 — “CAMPUS”
## Éducation & formation — hub piliers pédagogiques

### File Name
`10-campus-education-hub.md`

### Page Type
Public

### Related User Journeys
- Étudiant / professionnel en reconversion
- Navigation vers sous-piliers

### Connected Pages
- **Précédent :** sidebar `/education` prefix
- **Suivant :** `/education/language-study`, `/education/short-courses`, `/education/technical-training`

---

## 1. Page Purpose
**Orchestrer** les trois branches éducation avec cartes explicatives (`EducationTabs` / cards). Résout *“Quel track me concerne ?”*

---

## 2. Primary User Actions
- **Primaires :** choisir pilier ; lire aperçu.
- **Secondaires :** retour explorer global.

---

## 3. UX Goals
- **Clarté pédagogique** immédiate (icônes + 2 phrases max par pilier).

---

## 4. Layout Architecture
**Implémentation (`app/(public)/education/page.tsx`, client ; `metadata` dans `app/(public)/education/layout.tsx`) :** hero “Hub éducation & formation” + recherche → **carte lien Doctorat / PhD** (copy + `educationHubExplorerHref`) → **3 liens “Page dédiée”** (`/education/language-study`, `technical-training`, `short-courses`) → **onglets** internes (`languages` | `technical` | `short`) stylés → **`GoogleAd slot="education_top"`** → grille pays **filtrée par recherche** ; par pays : badges accès, lignes Bac / Coût / Visa, **insight** scrollable, liens **fiche pays** et **optionnel** `/countries/{id}/doctorat` si `hasCountryPhdStoredData`.

**Données :** `full_data.education_mobility` avec clés `language_study` | `technical_training` | `short_courses` selon onglet actif ; fallback texte “Données en cours de collecte…”.

---

## 5. Full Section Breakdown

### 5.1 Chargement & liste
- **`GET /api/countries`** → `normalizeCountriesApiListResponse` ; spinner pendant fetch.

### 5.2 Onglets (`tabs` constant)
- **Trois boutons :** “Apprendre une langue”, “Formation technique”, “Formations courtes” — états visuels `tab.active` (bleu / émeraude / violet).

### 5.3 `getEducationData`
- **Purpose :** lit le bloc `education_mobility[EDUCATION_MOBILITY_TAB_KEY[activeTab]]` ; sinon valeurs par défaut (`access`, `bac_required`, `cost`, `visa`, `insight`).

### 5.4 Carte pays
- **Badge accès :** `Facile` / `Moyen` / `Difficile` (couleurs distinctes).
- **Insight :** zone max-h scroll avec citation.
- **CTA :** lien hub **PAGE 16** ; second lien **PAGE 18** si données PhD.

### 5.5 Liens vers **PAGE 11–13**
- **Purpose :** les trois cartes “Page dédiée” remplacent un composant unique `EducationTabs` / `EducationCard` nommé en spec historique.

### 5.6 Bande “Pourquoi VisaFlow” (Stitch)
- **Note :** non présent comme section dédiée dans le TSX — **option** maquette au-dessus des onglets.

---

## 6. UI Design Direction
Couleurs **vert sauge** secondaires pour différenciation douce du reste produit.

---

## 7. Interaction Design
Hover carte : translation Y -2px + ombre.

---

## 8. Responsive UX
Cartes empilées ; hauteur égale forcée.

---

## 9. Accessibility
Liens “en savoir plus” textuels explicites.

---

## 10. Edge Cases & States
Contenu CMS absent : placeholders éditoriaux.

---

## 11. User Journey Connections
Vers pays avec score study mobility.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Créer **3 portes curriculum** visuellement distinctes (couleur accent différente par pilier) mais même squelette carte. Ajouter **filigrane motif cahier** 3% opacité sur fond.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 10]
