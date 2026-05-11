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
- **Précédent :** **PAGE 02** (explorer), home, compare (sans lien direct codé sur la fiche)
- **Suivant :** **PAGE 17** / **PAGE 19** / **PAGE 18** (sous-routes), **PAGE 04** (Schengen), **PAGE 20** (Assist — parcours externes / promos)

---

## 1. Page Purpose
La fiche pays est le **récipient maximal d’intelligence** : scores, sections thématiques, sources officielles, provenance agents, CTA secondaires. Résout *“Tout savoir sur cette destination en un seul parcours cohérent.”* Business : temps page, confiance, conversion services.

---

## 2. Primary User Actions
- **Primaires :** lire **Décision rapide** + **Réalité terrain** ; parcourir barres visa (`ScoreBar` local) ; ouvrir **PAGE 04** (Schengen) ; **imprimer / PDF** ; suivre liens **quotes / doctorat / reasons** (sections `previewOnly` ou bannière PhD).
- **Secondaires :** déplier **IntelligenceProvenanceCollapsible** & **CountryDbInsightsCollapsible** ; **favoris** (`POST /api/user/favorites`, `GET` état) si connecté (**PAGE 33**) ; **micro-feedback** (**PAGE 37**, `blockId` stables).
- **Télémétrie :** `POST /api/user/history` `{ type: 'VIEW_COUNTRY', payload: { countryId } }` (best-effort, utilisateur connecté).
- **Conversion :** **`DeepReportTeaser`** (monétisation) ; commentaires **`POST /api/comments`** (modération).

---

## 3. UX Goals
- **Autorité** sans intimidation.
- **Granularité** accessible via replis.
- **Orientation** : sous-navigation claire vers sous-pages.

---

## 4. Layout Architecture
**Fichier :** `app/(public)/countries/[id]/page.tsx` (`'use client'`, `useParams`, `useUser` Clerk).

**Flux vertical (écran) :** `ObjectiveAwareExplorerLink` retour explorer → bandeau **Décision rapide** (copy + badge score final + lien **PAGE 04** Schengen + **Imprimer**) → **`OfficialSourcesCard`** (si `officialSourcesForCountry` non vide) → encart **signaux qualité données** (`parseDataQualityAnomaliesPayload`) → **bannière PhD** (lien **PAGE 18**) si `hasCountryPhdStoredData` → **grille `lg:grid-cols-3`** : **colonne principale 2/3** + **sidebar sticky 1/3**.

**Colonne principale :** `h1` pays + région + badge Schengen + **favori** (si `user`) → carte **Réalité terrain** (citation `morocco_insights`, tuiles score, indicateurs World Bank si présents, **`IntelligenceProvenanceCollapsible`**, **`CountryDbInsightsCollapsible`**, quatre **`ScoreBar`** locaux visa, **`BlockFeedback` `country-reality`**) → **`DeepReportTeaser`** → **`GoogleAd`** `country_detail_mid` → section **Audit des rendez-vous** (`appointment_audit`) + **`BlockFeedback` `country-appointment-audit`** → **`DrivingRightsIntelSection`** (`materializeDrivingRightsIntel`) → **`PhDStudiesCountryTeaser`** (si données) → **`VisitReasonsSection`** + **`TravelerQuotesSection`** (`buildCountryExperienceContent`, `previewOnly`) → **Commentaires** (formulaire `textarea` + `POST /api/comments` + liste `country.comments`).

**Sidebar :** **Contexte ambassade** (`embassy_behavior`, résumé visa tourisme/travail, barres **`SidebarBar`**, encart **Conseil Darija** + **`BlockFeedback` `country-darija-tip`**) → **`GoogleAd`** `country_detail_sidebar`.

**Impression :** bloc `print:block` séparé (résumé textuel + table scores + disclaimer) ; conteneur principal `print:hidden`.

**Non présent sur cette route :** pas de `DelegatedApplicationsHomePromo` ni lien direct **PAGE 03** dans le TSX actuel — ajout produit futur possible sous la bande Décision rapide.

---

## 5. Full Section Breakdown

### 5.1 Chargement & matérialisation
- **`GET /api/countries/${id}`** ; validation `name` string ; états erreur / spinner.
- **`materializeCountryApiRow`** + **`enrichCountryApiRecord`** pour scores (`_visa`, `_friction`, `_finalScore`) et helpers carte.

### 5.2 Bandeau « Décision rapide »
- **Copy dynamique :** orientation études vs tourisme vs mixte selon scores ; **Données fraîches** si `isEconomyIntelFresh` ; **Score final** avec `scoreTone` ; actions Schengen + print.

### 5.3 `OfficialSourcesCard`
- **Source :** `officialSourcesForCountry(name, region)` ; masqué si liste vide.

### 5.4 Signaux qualité données
- **`dataQualityAnomalies` :** liste `messageFr` ; rôle `status` ; ton ambre — alerte contrôle, pas refus dossier.

### 5.5 Bannière PhD (au-dessus de la grille)
- **Condition :** `hasCountryPhdStoredData` ; CTA vers **`/countries/{id}/doctorat`** (**PAGE 18**).

### 5.6 Hero & favoris
- **Globe + `h1` + `MapPin` + Schengen** (`isSchengenMember`) ; bouton cœur si **`user`** (toggle API favoris, toasts).

### 5.7 Section « Réalité terrain »
- **Citation** `morocco_insights.reality` ; tuiles brutalité / acceptation / friction / confiance + **agrégat observation** (`formatObservationConfidenceSidebarFr`) ; légende `SCORE_SCALE_LEGEND_FR.terrainTilesCaption`.
- **Bloc WB :** population, PIB, PIB/hab., espérance de vie, chômage, urbain — date `intelLatest` si dispo.
- **Collapsibles :** provenance (`countryId`), insights DB (`filterPublicCountryInsights`).
- **Visa :** quatre `ScoreBar` + sous-titre `SCORE_SCALE_LEGEND_FR.visaBarsSubtitle`.
- **`BlockFeedback` :** `blockId="country-reality"`.

### 5.8 Monétisation & pub
- **`DeepReportTeaser`** (`countryName`, `countryId`).
- **`GoogleAd slot="country_detail_mid"`** entre sections majeures.

### 5.9 Audit rendez-vous
- **Données :** `full_data.appointment_audit` (plateforme, difficulté, délai, liste `issues`).
- **`BlockFeedback` :** `blockId="country-appointment-audit"`.

### 5.10 `DrivingRightsIntelSection`
- **Props :** `intel` pré-calculé ; lien narratif **PAGE 14**.

### 5.11 `PhDStudiesCountryTeaser` (colonne principale)
- **Modèle :** `buildPhdStudies` ; duplique la thématique PhD avec la bannière §5.5 (deux niveaux d’accroche).

### 5.12 `VisitReasonsSection` & `TravelerQuotesSection`
- **`previewOnly`** + contenus `experienceContent.reasons` / `.quotes` ; pages complètes **PAGE 19** / **PAGE 17**.

### 5.13 Commentaires communauté
- **Formulaire inline** (pas composant `CommentBox` dédié dans ce fichier) : `textarea`, `POST /api/comments`, message modération, **`CommentList`** = map simple des `country.comments` (cartes auteur + date).
- **Anonyme :** encart « Connectez-vous…» (**PAGE 33**).

### 5.14 Sidebar « Contexte ambassade »
- **Comportement consulaire** ; **système visa** (extraits `visa_system.tourism` / `.work`) ; **`SidebarBar`** moyenne visas, friction, score global ; **Darija** + **`BlockFeedback` `country-darija-tip`** (`className` compact).
- **`GoogleAd slot="country_detail_sidebar"`** en pied de sidebar.

### 5.15 Vue impression (`print:block`)
- **Contenu :** en-tête pays, anomalies, tableau scores, signaux `formatCountrySheetSignalsSummary(buildCountrySheetSignals(full))`, citation réalité, **footer légal** (non conseil juridique).

### 5.16 Micro-feedback — **PAGE 37**
- **Instances codées :** `country-reality`, `country-appointment-audit`, `country-darija-tip` — ne pas en ajouter arbitrairement au-delà sans revue produit.

### 5.17 SEO & JSON-LD (layout segment)
- **Détail Stitch / produit :** **PAGE 38** (`app/(public)/countries/[id]/layout.tsx`) — `generateMetadata`, canonical, Open Graph, script **JSON-LD** (`buildCountryPageJsonLd`).

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
- **Chargement :** spinner centré.
- **Erreur API / payload invalide :** message texte (`Pays non trouvé.` ou `Erreur: …`).
- **Champs manquants :** fallbacks `—` / copy “Analyse en cours” sur insights Maroc ; sections conditionnelles (PhD, WB, `OfficialSourcesCard`, anomalies).
- **Favoris / historique :** échecs réseau → toasts `appToast` ; pas de blocage lecture fiche.

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
