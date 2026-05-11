# PAGE 38 — “LENS”
## Segment pays — layout RSC SEO + JSON-LD (`app/(public)/countries/[id]/layout.tsx`)

### File Name
`38-lens-country-segment-layout.md`

### Page Type
System / Segment layout (pas une URL distincte — enveloppe **`/countries/[id]/*`**)

### Related User Journeys
- Partage lien fiche pays (aperçu correct Slack / iMessage / Google)
- Confiance “site sérieux” avant clic depuis résultats de recherche

### Connected Pages
- **Enveloppe :** **PAGE 16** (hub), **PAGE 17–19** (sous-routes même segment `id`)
- **Amont :** **PAGE 34** (layout racine, `SiteChrome`)
- **Données :** `resolveCountryLayoutMeta`, `buildCountryPageJsonLd`, `getPublicSiteOrigin` (`lib/`)

---

## 1. Page Purpose
Isoler tout ce qui concerne la **couche SEO & structured data** du segment dynamique **`/countries/[id]`** : métadonnées par pays, canonical, Open Graph / Twitter card, et **JSON-LD** injecté une fois pour les enfants du segment. Résout *“Comment Stitch / marketing raisonnent sur la fiche sans relire 900 lignes de `page.tsx` ?”*

---

## 2. Primary User Actions
- **Primaires :** aucune interaction directe — le layout ne rend que `children` + éventuellement `<script type="application/ld+json">`.
- **Secondaires (ingénierie) :** valider titres/descriptions pour pays Schengen vs non-Schengen ; vérifier canonical absolu quand `getPublicSiteOrigin()` est défini.

---

## 3. UX Goals
- **Cohérence titres** : pattern `"{name} — visa & mobilité"` + suffixe Schengen quand `isSchengenMember(name)`.
- **Pas de flash SEO** : métadonnées résolues côté serveur (`generateMetadata`).
- **JSON-LD sûr** : échappement `</` → `\u003c` dans la sérialisation pour éviter XSS.

---

## 4. Layout Architecture
**Fichier :** `app/(public)/countries/[id]/layout.tsx` (Server Component).

**Flux :** résoudre `params.id` → si id invalide (`<1` ou non numérique) → **metadata fallback** “Fiche pays” / “Pays introuvable” → sinon **`resolveCountryLayoutMeta(id)`** → si meta absente → titre “Pays introuvable” → si meta présente → **`metadataFromNameRegion`** (title, description, OG, Twitter, **canonical** si `origin`).

**Corps :** fragment `<> {jsonLd ? <script … /> : null} {children} </>` — le script précède les enfants pour que les crawlers voient le bloc tôt dans le HTML.

---

## 5. Full Section Breakdown

### 5.1 `generateMetadata`
- **Purpose :** `export async function generateMetadata({ params })` — point d’entrée Next pour titre & description par pays.
- **Edge :** id non parseable → metadata générique courte (pas d’appel DB coûteux inutile).

### 5.2 `resolveCountryLayoutMeta(id)`
- **Purpose :** charger nom + région (et champs nécessaires) pour construire title/description — voir implémentation `lib/country-layout-meta`.

### 5.3 `metadataFromNameRegion(name, region, countryId)`
- **Purpose :** description enrichie si Schengen (`regionLabel` “espace Schengen”) ; **OpenGraph** `locale: fr_FR`, `type: website` ; **Twitter** `summary_large_image`.
- **Canonical :** `${origin}/countries/${countryId}` quand `getPublicSiteOrigin()` retourne une base ; sinon pas d’`alternates`.

### 5.4 `buildCountryPageJsonLd`
- **Purpose :** objet JSON-LD (schéma défini dans `lib/country-page-json-ld`) avec `origin`, `countryId`, `name`, `region`, `title`, `description`.
- **Condition :** `origin` valide + meta résolue — sinon pas de script.

### 5.5 Slot `children`
- **Purpose :** **PAGE 16** ou sous-pages **17–19** — aucun wrapper visuel obligatoire ici ; le layout est **transparent** sauf script.

### 5.6 Cohérence avec **PAGE 16** §5.17
- **Règle doc :** le détail **fonctionnel** du contenu fiche reste sur **PAGE 16** ; **PAGE 38** porte uniquement **enveloppe SEO + JSON-LD** du segment.

---

## 6. UI Design Direction
Pas d’UI propre au layout — toute maquette Stitch “partage social” doit utiliser **captures OG** générées côté plateforme (ou mock frame navigateur avec titre + description issus de ce layout).

---

## 7. Interaction Design
N/A (pas d’interactions utilisateur sur ce layout).

---

## 8. Responsive UX
N/A — les enfants gèrent le responsive.

---

## 9. Accessibility
Le **script JSON-LD** ne doit pas polluer la lecture écran : rester hors arbre interactif ; pas de `aria` requis sur le script.

---

## 10. Edge Cases & States
- **Pays inconnu en DB :** metadata “Pays introuvable” ; pas de JSON-LD (ou script minimal selon évolution — suivre code).
- **`origin` absent** (env local / preview mal configuré) : pas de canonical absolu ; risque partages relatifs — documenter en ops.

---

## 11. User Journey Connections
Renforce découverte organique vers **PAGE 16** ; sous-routes héritent des mêmes titres de base si non surchargées au niveau page (vérifier `generateMetadata` sur sous-routes si ajoutées).

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Produire un **mock “résultat Google”** + **carte Twitter** utilisant exactement title/description du layout ; optionnellement une **frame “JSON-LD”** en monospace dans une planche technique (pas pour utilisateurs finaux).

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 38]
