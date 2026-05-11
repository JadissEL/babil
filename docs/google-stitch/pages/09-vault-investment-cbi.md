# PAGE 09 — “VAULT”
## Investissement / CBI — programmes citoyenneté par investissement

### File Name
`09-vault-investment-cbi.md`

### Page Type
Public

### Related User Journeys
- HNW individual research
- Passage vers pays ciblés ou services délégués

### Connected Pages
- **Précédent :** `/business`
- **Suivant :** `/countries/[id]`, `/services/delegated-applications`

---

## 1. Page Purpose
Présenter **CBI / golden visa** avec prudence réglementaire + liens données pays. Résout *“Quelles options existent et comment les évaluer ?”* Business : funnel services premium.

---

## 2. Primary User Actions
- **Primaires :** explorer programmes ; filtrer par budget / région.
- **Conversion :** CTA prise de contact / délégation.

---

## 3. UX Goals
- **Transparence risque** (non-promesse ROI).
- **Sobriété** visuelle (prestige calme).

---

## 4. Layout Architecture
**Implémentation (`app/(public)/investment/page.tsx`, client) :** hero “Investissement & nationalité” + recherche → **`GoogleAd slot="investment_top"`** → soit **empty state** (“Données en cours”) avec **`ObjectiveAwareExplorerLink`** + lien `/overview`, soit **grille 1/2/3 colonnes** de cartes pays issues de `full_data.cbi_program` (champs `cost` / `investment_min`, `processing_time`, etc.) + CTA **Voir détails pays** → **`GoogleAd slot="investment_bottom"`**.

**Pas de** tableau comparatif séparé ni FAQ accordéon dans ce fichier — enrichissement futur possible.

---

## 5. Full Section Breakdown

### 5.1 Construction `programs`
- **`useMemo` :** parcourt `countries`, garde entrées où `full_data.cbi_program` est un objet ; normalise `cost`, `processing`, `benefits`, `requirements`.

### 5.2 Filtre recherche
- **Client :** sous-chaîne insensible à la casse sur nom pays.

### 5.3 Carte programme (grille)
- **Header :** nom pays, région, badge **CBI**.
- **Corps :** lignes **Coût** / **Délai** (icônes `ShieldCheck`, `Clock`).
- **Footer :** `Link` vers **`/countries/{id}`** (**PAGE 16**).

### 5.4 Empty state
- **Icône** `Sparkles` + copy dataset incomplet + CTA explorer + tableau de bord.

### 5.5 Disclaimers & risques (produit / Stitch)
- **Purpose :** même exigence narrative que spec précédente — **à ajouter** au-dessus ou sous le hero si juridique l’exige (non présent comme bloc dédié dans le TSX actuel).

### 5.6 Parcours **PAGE 20–21**
- **Purpose :** CTA “Assist” peut compléter le footer maquette ; pas codé en dur sur cette route aujourd’hui.

### 5.7 SEO
- **`metadata` :** défini dans `app/(public)/investment/layout.tsx` (titre + description indicative) ; la **page** est `'use client'` sans export metadata.

---

## 6. UI Design Direction
Métaux **or brossé numérique** (très subtil) + fond crème ; typographie élégante serif optionnelle pour titres (Stitch).

---

## 7. Interaction Design
Accordéons pour conditions ; tooltips juridiques.

---

## 8. Responsive UX
Cartes 1 colonne ; disclaimers sticky bottom mini-bar.

---

## 9. Accessibility
Disclaimers : `role="note"` ; contrastes élevés sur texte légal.

---

## 10. Edge Cases & States
Programme indisponible : badge “à confirmer”.

---

## 11. User Journey Connections
Vers apply délégué “accompagnement dossier”.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Visuels **abstract gold geometry** (pas de billets photo). Tableau comparatif **comme statement bancaire** — colonnes alignées, typographie tabulaire.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 09]
