# PAGE 18 — “THESIS”
## Doctorat & études doctorales — pays (`/countries/[id]/doctorat`)

### File Name
`18-thesis-phd-studies.md`

### Page Type
Public (template dynamique)

### Related User Journeys
- Parcours doctoral international
- Croisement avec score study mobility

### Connected Pages
- **Précédent :** hub pays
- **Suivant :** `/education`, hub pays

---

## 1. Page Purpose
Présenter **offre doctorale** et friction visa études avancée (`PhDStudiesSection`). Résout *“Ce pays est-il réaliste pour mon doctorat ?”*

---

## 2. Primary User Actions
- **Primaires :** lire programmes / universités clés ; retour scores hub.
- **Secondaires :** CTA contact académique (futur).

---

## 3. UX Goals
- **Rigueur académique** sans elitisme condescendant.

---

## 4. Layout Architecture
**Implémentation (`app/(public)/countries/[id]/doctorat/page.tsx`) :** chargement `full_data` via `/api/countries/${id}` → `hasCountryPhdStoredData` / `buildPhdStudies` → rendu **`PhDStudiesSection`** ; possibles **`GoogleAd`** + liens objectif-aware vers l’explorateur ; retour hub `ChevronLeft`.

---

## 5. Full Section Breakdown

### 5.1 Pipeline données
- **Materialize :** `materializeCountryApiRow` assure `full_data` exploitable.
- **Garde `hasPhdData` :** si aucune donnée doctorale stockée → UI dédiée (message + CTA **PAGE 10** / hub).

### 5.2 `PhDStudiesSection`
- **Purpose :** programmes, friction visa études avancée, ton rigoureux mais accessible.
- **Visuel :** cartes / listes — cohérent **PAGE 16** (typo, `surface`, bordures).

### 5.3 Monétisation / discovery (`GoogleAd`)
- **Purpose :** slot pub si activé — ne pas casser la hiérarchie “contenu d’abord”.

### 5.4 Liens transverses
- **`ObjectiveAwareExplorerLink` :** ramener vers l’explorateur avec objectif cohérent (études / recherche).

### 5.5 Micro-feedback (**PAGE 37**)
- **Placement :** après le bloc PhD principal ou par sous-bloc si le composant est instancié plusieurs fois — éviter entre titre et premier paragraphe critique.

### 5.6 Edge SEO / confiance
- **Sources :** renvoyer vers **PAGE 16** “sources officielles” / intelligence si utilisateur veut creuser visa vs université.

---

## 6. UI Design Direction
Palette **bordeaux / ivoire** académique moderne ; lignes séparatrices fines.

---

## 7. Interaction Design
Hover références : tooltip citation APA light.

---

## 8. Responsive UX
Listes programmes : cards 1 col.

---

## 9. Accessibility
Listes longues : saut ancres.

---

## 10. Edge Cases & States
Pas de données PhD : message + lien education hub.

---

## 11. User Journey Connections
Vers technical training / language study.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Visuel **laboratoire lumineux** abstrait (verrerie, lignes spectrales). Timeline **parcours these 3–5 ans** stylisée.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 18]
