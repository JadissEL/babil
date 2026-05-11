# PAGE 16 — “TERRA”
## Fiche pays — hub intelligence mobilité (route dynamique `/countries/[id]`)

### File Name
`16-terra-country-intelligence-hub.md`

### Page Type
Public (template dynamique — une instance par pays)

### Related User Journeys
- Recherche approfondie post-explorer
- Partage lien SEO pays

### Connected Pages
- **Précédent :** `/explorer`, `/compare`, home
- **Suivant :** `/countries/[id]/quotes`, `/reasons`, `/doctorat`, compare pré-rempli

---

## 1. Page Purpose
La fiche pays est le **récipient maximal d’intelligence** : scores, sections thématiques, sources officielles, provenance agents, CTA secondaires. Résout *“Tout savoir sur cette destination en un seul parcours cohérent.”* Business : temps page, confiance, conversion services.

---

## 2. Primary User Actions
- **Primaires :** lire scores ; ouvrir sous-pages (quotes, doctorat, reasons) ; lancer compare avec ce pays.
- **Secondaires :** déplier provenance (`IntelligenceProvenanceCollapsible`) ; favoris (auth).
- **Conversion :** CTA services délégués / deep report teaser.

---

## 3. UX Goals
- **Autorité** sans intimidation.
- **Granularité** accessible via replis.
- **Orientation** : sous-navigation claire vers sous-pages.

---

## 4. Layout Architecture
Hero pays (drapeau + nom + score global) → barre actions → sections modulaires (visa, coût, risque, street food, etc. selon données) → sources officielles → commentaires (si présents) → footer liens.

---

## 5. Full Section Breakdown

### 5.1 Hero pays
`CountryFlag`, badges région, score principal.

### 5.2 Score bars
`CountryScoreBar` répétés — légende unifiée.

### 5.3 Collapsible intelligence
`CountryDbInsightsCollapsible`, `IntelligenceProvenanceCollapsible`.

### 5.4 Official sources
`OfficialSourcesCard`.

### 5.5 Comments
`CommentBox` + `CommentList` si intégrés — états modération.

### 5.6 Teasers sous-pages
Cartes vers quotes / doctorat / reasons.

### 5.7 PhD & doctorat (aperçu in-page)
- **Purpose :** `PhDStudiesCountryTeaser` / section doctorat condensée pour orienter sans dupliquer la route `/doctorat`.
- **Interaction :** “Voir tout le parcours doctoral” → PAGE 18.
- **Empty :** masquer le bloc si données absentes du contrat pays.

### 5.8 Raisons de visite (aperçu)
- **Purpose :** extraits `VisitReasonsSection` ou teaser mosaïque limitée à 3 tuiles + lien “Voir toutes les raisons”.
- **Conversion :** renforcer objectif tourisme avant CTA compare.

### 5.9 Conduite & permis (`DrivingRightsIntelSection`)
- **Purpose :** bloc pragmatique distinct (icône véhicule) pour ne pas mélanger avec visa tourisme.
- **Disclaimer :** rappel indicatif non-juridique ; lien PAGE 14 pour contexte global permis.

### 5.10 Complétude & fraîcheur (`country-completeness` patterns)
- **Purpose :** badge ou ligne “Couverture données X%” si exposé — renforce confiance honnête.
- **Edge :** score bas dû à manque de données ≠ “mauvais pays” ; copy explicite.

### 5.11 Promotions services délégués
- **Purpose :** `DelegatedApplicationsHomePromo` ou bandeau contextuel “Besoin d’aide pour ce pays ?”
- **Placement :** après scores clés, avant commentaires pour ne pas interrompre lecture factuelle.

### 5.12 Commentaires & confiance sociale
- **Purpose :** `CommentBox` + `CommentList` ; modération visible (états pending / refusé).
- **Auth :** utilisateur non connecté voit preview + CTA sign-in (KEYHOLE).
- **Anti-spam UX :** message rate limit humain si erreur API.

### 5.13 SEO & partage (hors Stitch visuel mais brief)
- **JSON-LD / meta :** titre = pays + VisaFlow ; image OG drapeau ou hero pays.
- **Open graph :** description courte score + disclaimer une ligne.

---

## 6. UI Design Direction
**Atlas premium** : grandes marges, respiration, séparations `border-line`. Score comme **jewelry bar** fin.

---

## 7. Interaction Design
Collapsibles : animation hauteur + icône chevron ; ancres profondes `#section`.

---

## 8. Responsive UX
Sections stack ; sticky mini-nav sections (Stitch) sur mobile pour saut rapide.

---

## 9. Accessibility
Score aussi rendu textuellement ; collapsibles boutons accessibles.

---

## 10. Edge Cases & States
Pays inconnu : 404 ; données partielles : bande “enrichissement en cours” ; commentaires désactivés : message.

---

## 11. User Journey Connections
Hub central ; toutes routes pays rayonnent.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Concevoir un **“passport spread”** layout : gauche identité pays + drapeau pleine marge ; droite scores empilés. Sections comme **pages passport timbrées** (léger cadre perforé). Provenance comme **tampon “verified”** mais élégant, pas cartoon.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 16]
