# PAGE 12 — “SPRINT”
## Formations courtes — bootcamps et certificats rapides

### File Name
`12-sprint-short-courses.md`

### Page Type
Public

### Related User Journeys
- Upskilling rapide à l’étranger
- Comparaison pays pour coût/délai

### Connected Pages
- **Précédent :** `/education`
- **Suivant :** `/explorer`, `/compare`

---

## 1. Page Purpose
Mettre en avant **formats courts** (durée, intensité, ROI temps). Résout *“Je n’ai pas 3 ans, quelles options ?”*

---

## 2. Primary User Actions
- **Primaires :** parcourir programmes ; clic pays.
- **Secondaires :** sauvegarder (auth).

---

## 3. UX Goals
- **Urgence positive** sans marketing agressif.

---

## 4. Layout Architecture
**Implémentation (`app/(public)/education/short-courses/page.tsx`, client) :** même squelette que **PAGE 11** : retour hub → filtres (**recherche**, bac oui/non, **durée** bucket, coût, type, visa) sur lignes issues de `full_data.education_mobility.short_courses` → résultats tabulaires / cards → **`GoogleAd`** → lien explorateur objectif-aware.

---

## 5. Full Section Breakdown

### 5.1 Pipeline `short_courses`
- **Champs typiques :** `types[]`, `bac_required`, `duration` → `durationBucket` (2 semaines / 1 mois / flexible), `visa`, `cost` → niveau coût, `access`, texte `insight` si présent.

### 5.2 Filtres
- **`duration` filter** : mappe texte brut vers buckets (heuristique `durationBucket`).

### 5.3 Affichage & empty
- **Purpose :** liste dérivée `rows` après filtres ; message si aucun pays ne publie de données short courses.

### 5.4 Parcours
- **Précédent :** **PAGE 10** ; **suivant :** pays **PAGE 16** ou **PAGE 03** / **PAGE 02**.

### 5.5 Écart maquette “timeline”
- **Note Stitch :** la timeline marketing n’est **pas** dans le code actuel ; traiter comme variante éditoriale future au-dessus du tableau.

---

## 6. UI Design Direction
Accents **orange brûlé** désaturé pour énergie contrôlée.

---

## 7. Interaction Design
Scroll snap sur timeline.

---

## 8. Responsive UX
Timeline devient colonne avec nodes.

---

## 9. Accessibility
Timeline annoncée comme liste ordonnée.

---

## 10. Edge Cases & States
Programmes vides : CTA explorer.

---

## 11. User Journey Connections
Vers technical training pour complément.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Visual **stopwatch géométrique** intégré au hero. Cartes programmes avec **chip durée** en premier plan.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 12]
