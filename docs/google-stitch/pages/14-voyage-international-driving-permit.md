# PAGE 14 — “VOYAGE”
## Permis international — conduite à l’étranger

### File Name
`14-voyage-international-driving-permit.md`

### Page Type
Public

### Related User Journeys
- Road trip / expatriation courte
- Complément pays `DrivingRightsIntelSection`

### Connected Pages
- **Précédent :** sidebar explorer
- **Suivant :** `/countries/[id]`, `/explorer`

---

## 1. Page Purpose
Expliquer **IDP / droits de conduie** avec liens intelligence pays. Résout *“Puis-je conduire là-bas ?”* sans conseil juridique directif.

---

## 2. Primary User Actions
- **Primaires :** lire règles générales ; accéder pays.
- **Secondaires :** checklist voyage (futur PDF).

---

## 3. UX Goals
- **Clarté légale** (disclaimers) + **action pratique**.

---

## 4. Layout Architecture
**Implémentation (`app/(public)/permis/page.tsx`) :** `Suspense` + inner avec **`useSearchParams`** : hero permis marocain → **encadré disclaimer** (ambre) → filtres **recherche** + **profil résidence** (`RESIDENCY_OPTIONS` : tourist, student, worker, …) → **comparaison deep-link** `?compare=id,id` (jusqu’à 4) → liste pays matérialisée avec **`DrivingRightsIntelSection`** + helpers `materializeDrivingRightsIntel`, `deriveDrivingRightsVisual`, `visualLabelFr` → **`GoogleAd`**.

**Données :** `GET /api/countries` + `normalizeCountriesApiListResponse` ; filtre par nom + règles résidence.

---

## 5. Full Section Breakdown

### 5.1 Wrapper `Suspense`
- **Purpose :** éviter erreurs static render sur `useSearchParams` ; fallback spinner centré.

### 5.2 Disclaimer légal / méthodo
- **Purpose :** bannière ambre : contenu structuré schéma v1, sources officielles à brancher — **non avis juridique**.

### 5.3 Filtre résidence
- **Purpose :** `residencyCategoryMatchesFilter` sur `intel.residencyRules` — masque pays sans règle applicable au profil choisi.

### 5.4 Mode comparer (`compare` query)
- **Purpose :** lignes `compareRows` résolues par id ; affichage parallèle des fiches intel (voir layout TSX).

### 5.5 `DrivingRightsIntelSection` (macro liste)
- **Purpose :** même composant que sous **PAGE 16** mais en **catalogue** pays filtrable.

### 5.6 Cohérence **PAGE 37**
- **Option :** micro-feedback sur blocs intel longs — placement bas de section.

---

## 6. UI Design Direction
Motifs **route dashed** subtils ; palette asphalt + jaune signalisation très désaturé.

---

## 7. Interaction Design
Accordion FAQ avec animation hauteur.

---

## 8. Responsive UX
FAQ full width ; cartes pays 2 colonnes tablette.

---

## 9. Accessibility
Questions `button` + `aria-expanded`.

---

## 10. Edge Cases & States
Pays sans données conduite : message + suggestion contact service.

---

## 11. User Journey Connections
Vers hub pays puis section conduite.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Hero avec **volant stylisé wireframe** (pas photo volant cuir cheap). Ajouter **carte européenne abstraite** avec routes lumineuses pour Schengen + road trips.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
Fichier repo : `docs/google-stitch/assets/page-14-voyage-stitch-reference.png`

**Architecture livrée (Stitch v1)** : shell **cream `#FDFBF4`** ; **hero immersif sombre** = panneau radial-gradient navy `#0D1B3E → #1f2d52` simulant une « night earth » (multiples radial gradients pour points lumineux), label mono `VOYAGE — PERMIS INTERNATIONAL & CONDUITE`, titre serif blanc **« Conduire à l'étranger : Droits et Formalités »**, sous-titre crème. **Bandeau disclaimer** rose pâle (`bg-rose-50` + `text-rose-900`) avec icône `Info` et label `DISCLAIMER` : « Les informations fournies sont à titre indicatif et ne constituent pas un avis juridique officiel. Vérifiez toujours auprès des autorités locales. ». Filtres double-colonne : `RECHERCHE DE DESTINATION` (input "Entrez un pays…") + `PROFIL DE RÉSIDENCE` (select `RESIDENCY_OPTIONS` : Touriste/Étudiant/Travail/Résidence temporaire/permanente/protection internationale). Section **`Matrice des Droits de Conduite`** = **table-comparaison** rows×cols (rows = 4 critères : `Validité Permis National`, `Permis International (IDP) Requis`, `Échange de Permis`, `Délai de Conversion` ; cols = pays sélectionnés). Sélection alimentée par : `?compare=id,id,id,id` (deep-link préservé) → sinon 3 premiers pays filtrés par `query` + `residency` via `materializeDrivingRightsIntel`. Chaque colonne porte un bouton `×` ghost pour la retirer. Recherche = typeahead avec dropdown suggestions ; clic ajoute une colonne (max 4). Cellules `IDP Requis` colorées (`text-rose-700` Obligatoire / `text-blue-700` Recommandé). Ligne `Validité Permis National` lit `durations[residency]` ; ligne `Échange` lit `conversion.summary`/`requirements` ; ligne `Délai` lit `conversion.deadlineNotes`. Below matrix : compteur `N autres pays disponibles` + ad slot. Footer Stitch globalement géré par layout public.
