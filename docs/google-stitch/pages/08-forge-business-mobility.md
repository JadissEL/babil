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
Hero métier → piliers (3–4) → preuves / logos (futur) → CTA double (explorer, compare).

---

## 5. Full Section Breakdown

### 5.1 Hero business
- **Purpose :** ancrer la promesse “mobilité pour l’activité” (déplacements, implantation, partenaires).
- **Content :** titre fort, sous-texte orienté résultats (temps, coût, risque), CTA primaire vers `/explorer` avec objectif business pré-sélectionné si le provider d’objectif le permet.
- **Empty state :** si aucun contenu CMS : copy statique + illustration abstraite réseau.

### 5.2 Piliers (3–4 blocs)
- **Purpose :** segmenter les cas d’usage (vols fréquents, installation longue durée, événements, fiscalité indicative **non conseil**).
- **Interactions :** chaque bloc lien “Voir pays recommandés” vers explorer filtré ou compare pré-rempli.
- **Responsive :** grille 2×2 desktop → une colonne mobile.

### 5.3 Encart données (SSR optionnel)
- **Purpose :** montrer que VisaFlow **mesure** (scores business mobility) sans noyer.
- **Micro-chart :** sparkline ou top-3 pays pour l’objectif business (données réelles si disponibles).
- **Loading :** skeleton encart 16:9.

### 5.4 Bande logos / preuves (futur)
- **Purpose :** crédibilité B2B ; placeholders gris neutres si vides.
- **Accessibility :** logos avec `alt` entreprise.

### 5.5 Double CTA footer
- **Primary :** Explorer.
- **Secondary :** Comparer (deep link `cta-hrefs` mental model).

### 5.6 Navigation shell
- **AppNavbar** sticky ; cohérence titre page avec entrée sidebar “Business & investissement”.

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
