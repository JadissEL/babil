# PAGE 32 — “BEACON”
## Glossaire intelligence fieldPath — `/intelligence-fieldpaths`

### File Name
`32-beacon-intelligence-fieldpaths.md`

### Page Type
Public (documentation produit transparence)

### Related User Journeys
- Compréhension provenance données pays
- Support / power user

### Connected Pages
- **Précédent :** provenance pays, explorer
- **Suivant :** hub pays

---

## 1. Page Purpose
Expliquer **sémantique technique** des `fieldPath` liant `CountryObservation` et `full_data`. Résout *“Que signifie ce code dans la provenance ?”* Business : confiance data & conformité explicable.

---

## 2. Primary User Actions
- **Primaires :** rechercher / scanner tableau glossaire.
- **Secondaires :** copier identifiant pour ticket support.

---

## 3. UX Goals
- **Pédagogie** sans infantiliser expert.

---

## 4. Layout Architecture
Intro + table scroll horizontal (`min-w` pattern) + lien retour explorer.

---

## 5. Full Section Breakdown

### 5.1 Intro & lexique
- **Purpose :** définir en 2 phrases `fieldPath`, `CountryObservation`, `full_data` (cache lecture) — public technique mais lisible.
- **Lien :** retour explorer + ancre “Lire la provenance sur une fiche pays”.

### 5.2 Barre de recherche inline (futur)
- **Purpose :** filtre client-side sur colonne `fieldPath` + description ; highlight matches.
- **Empty search :** message “Aucun champ — élargir la recherche”.

### 5.3 Tableau principal
- **Colonnes suggérées :** `fieldPath` (mono), **Description** (FR), **Exemple**, **Source** (agent / World Bank / …), **Dernière mise à jour** (si exposée).
- **Zebra + hover :** ligne surlignée ; copier fieldPath au clic icône avec toast (PAGE 34).

### 5.4 Icônes source (scan visuel)
- **Purpose :** pictogramme cohérent par famille de pipeline (`lib/intelligence-pipeline` mental model).
- **Légende :** ligne sous header table.

### 5.5 Encart “Relation avec la provenance UI”
- **Purpose :** capture d’écran ou wireframe du collapsible provenance sur **PAGE 16** pour relier jargon ↔ UI.

### 5.6 Bloc glossaire étendu (optional)
- **Purpose :** termes transverses (matérialisation, observation, merge) — glossaire secondaire repliable.

### 5.7 Performance & volumétrie
- **Purpose :** pagination ou virtualisation si >200 lignes ; note perf pour mobile.

### 5.8 Télémétrie / feedback (futur)
- **Purpose :** lien “Cette description est-elle claire ?” → **PAGE 37** micro-feedback.

---

## 6. UI Design Direction
**Doc technique élégante** : monospace contrôlé, zebra rows doux.

---

## 7. Interaction Design
Sticky header colonnes table ; hover row highlight.

---

## 8. Responsive UX
Scroll snap horizontal indicator shadow.

---

## 9. Accessibility
`caption` table ; abbreviations `abbr`.

---

## 10. Edge Cases & States
Glossaire long : recherche inline future.

---

## 11. User Journey Connections
Retour pays pour relire provenance avec compréhension.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Ajouter **colonne “icône source”** minimaliste (globe, agent, banque) pour scanner visuellement. Header sticky avec **légère transparence blur**.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
Fichier repo : `docs/google-stitch/assets/page-32-beacon-stitch-reference.png`

**Architecture livrée (Stitch v1 — Beacon Glossaire des Données)** : page client `/intelligence-fieldpaths` réécrite en layout 2 colonnes éditorial sur cream `#FAF7EE`. Header / footer fournis par `SiteChrome` racine.

- **Hero** : eyebrow mono `Documentation Technique` + serif `h1` `Glossaire des Données` + paragraphe intro mentionnant `fieldPath`, `CountryObservation`, `full_data` en mono inline chips. 2 liens d'accroche : `← Retour à l'explorateur` (`ObjectiveAwareExplorerLink`) + `(Info) Comprendre la provenance sur un profil` (ancre conceptuelle vers `/countries/[id]`).
- **Layout** : `lg:grid-cols-[1fr_320px]` — main glossaire à gauche, sidebar architecture sticky à droite.
- **Toolbar main** : `Input` recherche `Search` icon (filtre client-side temps réel sur `fieldPath` + `labelFr` + `descriptionFr`) + **3 chips source toggle** : `Publique` (`Globe`), `Institutionnelle` (`Landmark`), `Agent IA` (`Cpu`). Active state = navy filled, inactive = white border.
- **Tableau** white card border `#0D1B3E/10` :
  - colonnes **SRC** (icône source 16×16) · **FIELDPATH** mono · **DESCRIPTION** serif · **EXEMPLE** mono · **SOURCE** (`labelShort` + libellé secondaire si présent) · **MISE À JOUR** mono.
  - Header sticky avec léger blur (Stitch §12).
  - Zebra rows alterné `#0D1B3E/[0.02]`, hover row navy soft tint.
  - Clic sur `fieldPath` ⇒ `navigator.clipboard.writeText` + `appToast.success` "Identifiant copié" (Stitch §5.3).
  - Empty state si filtres ⇒ aucun résultat : message *« Aucun champ — élargir la recherche »*.
- **Sidebar `Architecture`** sticky `lg:top-24` : eyebrow mono + serif title `Relation avec la provenance UI` + paragraphe + **mini wireframe** (carte UI `Page 16 · Taux d'acceptation` avec lien `Source`, flèche `ArrowDown`, carte dark mono `SELECT value FROM full_data WHERE path = 'visa.accept_rate'`).
- **Glossaire `FieldPathGlossaryEntry`** étendu (optional fields) : `sourceKind: 'publique' | 'institutionnelle' | 'agent'`, `exampleFr`, `sourceLabelFr`, `updatedAtFr`. 7 entrées existantes enrichies avec valeurs réalistes (World Bank `2024-Q1`, ILO `Live`, etc.). Aucun changement breaking — fonctions existantes (`getIntelligenceFieldPathGlossaryEntry`) continuent d'opérer.
