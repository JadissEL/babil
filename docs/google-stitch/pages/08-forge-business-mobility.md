# PAGE 08 — “FORGE”
## Business & mobilité — hub contenus mobilité affaires

### File Name
`08-forge-business-mobility.md`

### Page Type
Public

### Related User Journeys
- Entrepreneur / transfert / réunion
- Passage vers investment ou pays

### Connected Pages
- **Précédent :** sidebar explorer, `/`
- **Suivant :** `/investment`, `/explorer`, `/countries/[id]`

---

## 1. Page Purpose
Agréger **storytelling + liens moteurs** pour l’utilisateur business. Résout *“Quels leviers VisaFlow pour mon activité ?”* Business : positionnement B2B2C futur.

---

## 2. Primary User Actions
- **Primaires :** lire sections ; CTA vers explorer objectif business.
- **Secondaires :** télécharger ressource (futur).

---

## 3. UX Goals
- **Crédibilité** pro (ton sobre, chiffres sourcés).

---

## 4. Layout Architecture
**Implémentation (`app/(public)/business/page.tsx`, client ; `metadata` dans `app/(public)/business/layout.tsx`) :** hero “Business & investissement” + **recherche** pays → **carte lien explorateur** `businessHubExplorerHref(preference.primarySlug)` (`ObjectivePreferenceProvider`) → **`GoogleAd slot="business_top"`** → grille **2 colonnes** (`lg:grid-cols-2`) : une **carte par pays** (`filtered` sur nom) avec données **`enrichCountryApiRecord`**, `full_data.visa_system.business`, `street_food`, encart optionnel **`cbi_program`**.

**Pas de** sections “piliers” CMS ni timeline entrepreneur dans le code actuel — le contenu est **data-driven par pays**.

---

## 5. Full Section Breakdown

### 5.1 Chargement
- **`GET /api/countries`** → `normalizeCountriesApiListResponse` ; spinner vert (`border-success`) si loading.

### 5.2 Carte pays (header)
- **Titre pays** + badge “Mobilité économique” + **indice affaires** `/100` (`enriched._visa.business`).

### 5.3 Colonnes “Création d’entreprise”
- **Encarts :** `rights` (droit d’investir), `setup` (mise en place) depuis `visa_system.business`.

### 5.4 Colonnes “Micro-activité & food”
- **`street_food` :** opportunité, invest. min, citation `barriers`.

### 5.5 Bloc CBI conditionnel
- **Si `full_data.cbi_program` :** carte verte “Nationalité par investissement”, champs `cost_min`, `time`, `type`.

### 5.6 CTA vers fiche pays
- **Implémentation actuelle :** pas de `Link` explicite vers **`/countries/{id}`** en bas de carte — le nom pays est titre texte seul ; **Stitch** peut proposer CTA “Voir la fiche” aligné **PAGE 16** sans inventer de route.

### 5.7 Écart maquette “piliers / logos”
- **Note Stitch :** matérialiser piliers **au-dessus** de la grille si le brief l’exige — la spec produit **PAGE 08** décrit l’UI réelle comme **catalogue pays business**.

---

## 6. UI Design Direction
Noir & sable chaud ; accents **graphite** ; pictos Lucide `Briefcase`.

---

## 7. Interaction Design
Hover encarts : léger zoom image abstraite.

---

## 8. Responsive UX
Colonnes → stack ; CTA full width mobile.

---

## 9. Accessibility
Hiérarchie titres stricte ; liens explicites (“Comparer les pays pour objectif business”).

---

## 10. Edge Cases & States
Données dynamiques absentes : fallback statique.

---

## 11. User Journey Connections
Vers investment CBI ; vers compare.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Mood **private banking mobility** : photographies abstraites architecture + réseaux. Introduire **ligne temporelle parcours entrepreneur** (4 étapes) comme storytelling horizontal scroll snap.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 08]
