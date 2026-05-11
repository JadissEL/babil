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
Hero campus → 3 grandes cartes → bande “pourquoi VisaFlow” → CTA explorer filtré études.

---

## 5. Full Section Breakdown

### 5.1 Hero éducation
- **Purpose :** segmenter en une phrase les **trois piliers** (langue, court, technique) + public cible (étudiant, pro, reconversion).
- **CTA dual :** “Explorer pays pour études” (deep link objectif) + “Comparer destinations”.

### 5.2 Grille des trois piliers (`EducationCard` / tabs)
- **Carte pilier :** icône distincte (langue / horloge courte / outil technique), titre, **2 lignes max** bénéfice, **chips** durée & coût relatif (échelle qualitative L/M/H si pas de chiffre).
- **Interactions :** carte entière cliquable vers sous-route ; hover élévation + flèche “Découvrir”.
- **Equal height :** forcer hauteur minimale identique pour alignement visuel Stitch.

### 5.3 Bandeau “Pourquoi VisaFlow pour l’éducation”
- **Purpose :** relier scores **study mobility** et contenus pays (PhD, langue) sans liste technique.
- **Proof :** 3 bullets max (scores, sources, comparateur).

### 5.4 Pont vers pays phares (optionnel SSR)
- **Purpose :** strip horizontal 4–6 `CountryCard` mini “souvent consultés pour études” si données.
- **Empty :** masquer le strip.

### 5.5 Rappel navigation globale
- **Purpose :** lien discret vers `/education` dans fil d’Ariane mental (breadcrumb visuel léger) si utilisateur arrive d’un sous-pilier.

### 5.6 Accessibilité pédagogique
- **Purpose :** glossaire tooltip sur acronymes (CBI n’applique pas ici mais Erasmus+, TCF, etc. si mentionnés).

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
