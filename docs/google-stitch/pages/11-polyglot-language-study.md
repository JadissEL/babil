# PAGE 11 — “POLYGLOT”
## Étude de langues — mobilité linguistique

### File Name
`11-polyglot-language-study.md`

### Page Type
Public

### Related User Journeys
- Préparation séjour linguistique
- Lien vers pays / programmes

### Connected Pages
- **Précédent :** `/education`
- **Suivant :** `/explorer`, `/countries/[id]`

---

## 1. Page Purpose
Détailler **parcours langue** : destinations, coûts indicatifs, visa études court vs long (niveau informationnel). Résout *“Où apprendre la langue efficacement ?”*

---

## 2. Primary User Actions
- **Primaires :** filtrer destinations ; ouvrir pays.
- **Secondaires :** comparer coûts vie.

---

## 3. UX Goals
- **Motivation** positive (progression).

---

## 4. Layout Architecture
**Implémentation (`app/(public)/education/language-study/page.tsx`, client) :** en-tête + lien retour **hub** `/education` → filtres (**recherche**, bac, coût, type de programme, type de visa) → tableau / cartes des pays ayant `full_data.education_mobility.language_study` → **`GoogleAd`** → CTA **`educationHubExplorerHref(preference.primarySlug)`** (`ObjectivePreferenceProvider`).

---

## 5. Full Section Breakdown

### 5.1 Chargement données
- **`GET /api/countries`** → `normalizeCountriesApiListResponse`.
- **Rows :** extraction objet `language_study` ; pays sans bloc → exclus de la liste.

### 5.2 Dérivation champs
- **`bac_required`**, `estimated_cost` → bucket coût (`Bas` / `Moyen` / `Élevé`), `program_type`, `visa_type`/`visa`, `access`.

### 5.3 Filtres dynamiques
- **Sets :** `programTypes`, `visaTypes` construits depuis les lignes ; valeurs `all` + tri FR.

### 5.4 Tableau résultats
- **Colonnes alignées produit :** pays, programme, visa, bac, coût, accès (voir rendu TSX pour libellés exacts).
- **Empty :** copy invitant à élargir filtres ou ouvrir l’explorateur.

### 5.5 `GoogleAd`
- **Placement :** sous le bloc principal filtres+table ou selon slot défini dans le fichier.

### 5.6 CTA explorateur
- **Purpose :** sortie vers **PAGE 02** avec objectif préservé.

---

## 6. UI Design Direction
Accent **bleu encre** + illustrations abstraites ondes sonores.

---

## 7. Interaction Design
Tabs internes si multiples sous-modules.

---

## 8. Responsive UX
Sections accordion mobile.

---

## 9. Accessibility
Vidéos (futur) : sous-titres ; transcripts.

---

## 10. Edge Cases & States
Aucun pays match : élargir critères suggestion.

---

## 11. User Journey Connections
Vers reco study mobility.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Graphismes **waveforms** abstraits liés à la phonétique. Cartes pays avec **badge niveau langue** (A1–C2) fictif indicatif si données.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
Fichier repo : `docs/google-stitch/assets/page-11-polyglot-stitch-reference.png`

**Architecture livrée (Stitch v1)** : shell **cream `#FDFBF4`** avec grille subtile (cohérent pages 02–10). En-tête **`SECTION 04 / LANGUAGE PROGRAMS`** + titre serif **« Apprendre une langue. »** et sous-titre éditorial. Barre de filtres = `Sélectionner une langue` (select global icône `Globe`) + `Type de programme` (select alimenté par `/api/education/programs?kind=LANGUAGE_STUDY`) + bouton plein `FILTRER` (navy). Section **« Préparation aux Certifications »** éditoriale (4 cartes — IELTS Academic, TOEFL iBT, DELF/DALF, TestDaF) + tuile statistique navy plein `85%`. Section **« Destinations d'Immersion »** dynamique : cartes pays issues de **`GET /api/education/programs?kind=LANGUAGE_STUDY`** (filtres `programType`, `cost`, `bac`, `q` côté serveur grâce aux index `kind_*` du modèle `CountryEducationProgram`). Carte = bandeau gris (placeholder image), `country.name`, tag accès, `Coût mensuel moyen`, `Type de visa`, citation `insight` italique. CTA explorateur en bas via `educationHubExplorerHref(preference.primarySlug)`.
