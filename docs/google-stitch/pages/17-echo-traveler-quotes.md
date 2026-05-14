# PAGE 17 — “ECHO”
## Citations voyageurs — preuve humaine (`/countries/[id]/quotes`)

### File Name
`17-echo-traveler-quotes.md`

### Page Type
Public (template dynamique)

### Related User Journeys
- Validation émotionnelle post-scores
- Partage social snippet quote

### Connected Pages
- **Précédent :** hub pays `/countries/[id]`
- **Suivant :** hub pays, community

---

## 1. Page Purpose
Humaniser la donnée via **citations contextualisées** (`TravelerQuotesSection`). Résout *“Comment ça se vit sur place ?”*

---

## 2. Primary User Actions
- **Primaires :** lire citations ; filtrer par thème (si UI).
- **Secondaires :** signaler citation (futur).

---

## 3. UX Goals
- **Authenticité** (sources attributées).

---

## 4. Layout Architecture
**Implémentation (`app/(public)/countries/[id]/quotes/page.tsx`) :** `fetch('/api/countries/${id}')` → `materializeCountryApiRow` → contenu `buildCountryExperienceContent` + **`TravelerQuotesSection`** ; navigation retour hub via lien `ChevronLeft` + `Link` vers `/countries/[id]`.

---

## 5. Full Section Breakdown

### 5.1 États chargement / erreur
- **Loading :** spinner centré (pattern cohérent sous-pages pays).
- **Erreur API / payload invalide :** message + pas de section citations.

### 5.2 En-tête & retour hub
- **Purpose :** ancrage pays + retour **PAGE 16** sans perdre le contexte `id`.

### 5.3 `TravelerQuotesSection`
- **Purpose :** citations contextualisées, sources / attribution selon données `full_data`.
- **UX :** typographie “preuve humaine” — respiration, pas mur de texte.

### 5.4 Contenu d’expérience (`buildCountryExperienceContent`)
- **Purpose :** intro / méta autour de la section selon matérialisation pays.

### 5.5 Micro-feedback transversal (**PAGE 37**)
- **Purpose :** si `BlockFeedback` est branché sur blocs de cette route, respecter placement **sous** le bloc principal de citations, hors chemin critique retour hub.

### 5.6 Empty / données template
- **Purpose :** copy prudente + lien vers hub ou **PAGE 15** community si contribution externe un jour.

---

## 6. UI Design Direction
Typographie **citation grande** serif option ; fond légèrement différent pour segmenter du hub.

---

## 7. Interaction Design
Carousel : swipe + dots accessibles.

---

## 8. Responsive UX
Citation full width ; réduire taille police mais garder lisibilité.

---

## 9. Accessibility
Carrousel : pause ; contenu hors-carrousel dupliqué en liste plain (idéal).

---

## 10. Edge Cases & States
Aucune citation : invite contribution communautaire (prudent) ; données template.

---

## 11. User Journey Connections
Retour hub ; vers reasons.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Mise en page **magazine editorial** : citations en pull-quote, crédits en colonne fine. Filigrane **guillemet** géant à 6% opacité.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
Fichier repo : `docs/google-stitch/assets/page-17-echo-stitch-reference.png`

**Architecture livrée (Stitch v1 — magazine editorial)** : shell **cream `#FDFBF4`**. Header breadcrumb double : `← HUB {COUNTRY}` (retour `/countries/[id]`) à gauche, lien mono `DOSSIER DE RECHERCHE` à droite. **Hero featured quote** centré : filigrane `Quote` géant (10% opacité) en arrière-plan, eyebrow `ÉCHOS & EXPÉRIENCES`, citation serif xxl (la 1ère **positive** ou la 1ère du tableau si aucune positive), ligne auteur (nom + petite pill `sourceName`). **Grille editorial masonry** des citations restantes : layout **2-col** asymétrique (`md:grid-cols-2`) avec mélange de cartes pleine largeur / mi-largeur (alternance via index modulo) ; chaque carte : filigrane guillemet en coin, citation serif italique, ligne pied = avatar pastille (initiale auteur), nom + métier secondaire (auteur), chip mono pays/source (lien `sourceUrl` externe si dispo). Page **abandonne le composant `TravelerQuotesSection`** ici (toujours utilisé en mode `previewOnly` sur PAGE 16) au profit d'un layout dédié plein écran. Footer Stitch via layout public global. Empty state : copy prudente + retour hub.
