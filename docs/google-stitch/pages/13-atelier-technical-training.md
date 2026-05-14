# PAGE 13 — “ATELIER”
## Formations techniques & métiers — voies professionnelles

### File Name
`13-atelier-technical-training.md`

### Page Type
Public

### Related User Journeys
- Mobilité travail qualifié
- Alignement avec scoring work mobility pays

### Connected Pages
- **Précédent :** `/education`
- **Suivant :** `/countries/[id]`, `/business`

---

## 1. Page Purpose
Présenter **métiers techniques** et passerelles visa travail / permis (informationnel). Résout *“Comment mon skillset se mappe à l’étranger ?”*

---

## 2. Primary User Actions
- **Primaires :** explorer filières ; ouvrir pays à fort score emploi.
- **Secondaires :** lien probability work-oriented.

---

## 3. UX Goals
- **Pragmatisme** (débouchés, délais) plutôt que marketing.

---

## 4. Layout Architecture
**Implémentation (`app/(public)/education/technical-training/page.tsx`, client) :** retour hub → filtres (**recherche**, accès bac / sans bac, **domaine** `types`, droits au travail bucket, coût) sur `full_data.education_mobility.technical_training` → résultats → **`GoogleAd`** → lien explorateur.

---

## 5. Full Section Breakdown

### 5.1 Pipeline `technical_training`
- **Champs :** `types[]` (domaines), `access_bac` / `access_no_bac` booléens, `work_rights` → bucket (`autorisé` / `limité` / `interdit`), `visa`, `cost`, `access`, `insight`.

### 5.2 Filtres spécifiques
- **`bacAccess` / `noBacAccess` :** oui/non/all.
- **`work` :** droits travail agrégés pour réduire la liste.

### 5.3 Badges visuels
- **Purpose :** `BadgeCheck` / `BadgeX` (voir TSX) pour accès bac / sans bac — renforcer scannabilité.

### 5.4 Empty & journeys
- **Vers PAGE 08** business ou **PAGE 16** pays à fort score emploi (copy CTA dans maquette).

---

## 6. UI Design Direction
Esthétique **workshop** : textures béton léger, ligne grid technique.

---

## 7. Interaction Design
Hover matrice : tooltip pays top.

---

## 8. Responsive UX
Matrice → liste filières avec sous-liste pays.

---

## 9. Accessibility
Matrice : alternative liste.

---

## 10. Edge Cases & States
Données partielles : N/A explicite.

---

## 11. User Journey Connections
Vers permis / business selon profil.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Introduire **schémas isométriques abstraits** (outils, engrenages soft). Palette **acier + ambre** pour chaleur humaine.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
Fichier repo : `docs/google-stitch/assets/page-13-atelier-stitch-reference.png`

**Architecture livrée (Stitch v1)** : shell **cream `#FDFBF4`** + grille technique fine (cohérent pages 02–12). Hero centré avec micro-label **`⚙ PÔLE ATELIER`**, titre serif **« Formations techniques & métiers »**, paragraphe analytique (filières professionnalisantes / requis académiques / opportunités emploi internationales) ; coins décorés engrenages SVG subtils. Filter bar : `RECHERCHE GLOBALE` (input), `NIVEAU REQUIS` (select bac), `DOMAINE D'ACTIVITÉ` (select `programType`), `DROITS AU TRAVAIL` (select `workRightsBucket`) ; bouton plein navy **`FILTRER LA MATRICE`** aligné à droite sous les filtres. Heading **« Matrice des destinations »** avec compteur **`N OPPORTUNITÉS IDENTIFIÉES`**. Cartes pays = eyebrow `PAYS UPPERCASE` + pill **code ISO2** (via `iso2ForCountryNameOrEmpty`), titre serif (issu de `programType`), liste structurée à 4 rangs (icons + labels : `REQUIS ACADÉMIQUE`, `DROITS AU TRAVAIL`, `COÛT ESTIMÉ`, `TYPE DE VISA`), citation `insight` italique en pied. Le tout alimenté par **`GET /api/education/programs?kind=TECHNICAL_TRAINING`** avec filtres serveur `bac`, `work`, `programType`, `q` sur `CountryEducationProgram` (indexes `kind`, `kind_bacBucket`, `kind_costBucket`). Bandeau ad + bloc **« Poursuivre l'analyse sectorielle »** = lien dual `OUVRIR L'EXPLORER` (objectif-aware) + `CONSULTER LE BUSINESS HUB` vers `/business`. Footer Stitch.
