# PAGE 20 — “CONCIERGE”
## Délégation de demandes — catalogue services (`/services/delegated-applications`)

### File Name
`20-concierge-delegated-services.md`

### Page Type
Public

### Related User Journeys
- Passage de l’auto-service à l’humain
- Compréhension SKU / étapes

### Connected Pages
- **Précédent :** hub pays, investment, home
- **Suivant :** `/services/delegated-applications/apply`

---

## 1. Page Purpose
Présenter le **catalogue de services délégués** (`DelegatedServiceCatalog`) avec niveaux de confiance, délais indicatifs, pricing hints. Résout *“Qu’est-ce que vous pouvez faire pour moi ?”*

---

## 2. Primary User Actions
- **Primaires :** comparer offres ; démarrer demande.
- **Secondaires :** voir demandes existantes (`MyDelegatedRequests` si connecté).

---

## 3. UX Goals
- **Transparence process** (étapes, documents).
- **Réassurance** anti-arnaque (badges officiels, SLA).

---

## 4. Layout Architecture
Hero service premium → grille offres → tableau comparatif features → FAQ trust → CTA apply.

---

## 5. Full Section Breakdown

### 5.0 Routage serveur, contexte pays & catalogue
- **Page serveur :** `app/(public)/services/delegated-applications/page.tsx` (`metadata` SEO Assist).
- **`searchParams` :** `countryId`, `countryName` → bannière “Contexte pays” (`role="status"`) + liens **Revoir la fiche** / **Effacer le contexte** ; suffixe **`applyQuerySuffix`** propagé au catalogue pour **PAGE 21** (`?category=…&package=…&countryId=…`).
- **`DelegatedServiceCatalog` :** `PackageCard` (forfaits `JOB_PACKAGES` / `UNIVERSITY_PACKAGES` dans `lib/delegated-application-catalog`), `delivers` + `Check`, prix `formatPriceMad`, badge **Recommandé** si `pkg.recommended`, `ComparisonTable` (mobile critères empilés / desktop tableau), textes garantie `APPLICATION_GUARANTEE_*`.

### 5.1 Hero “Sérénité & clarté” (Stitch / copy — au-dessus du bloc garantie réel)
- **Implémentation actuelle :** le premier contenu marketing dense est le **bloc garantie 50%** dans `DelegatedServiceCatalog` ; ce hero reste **cible design** si on ajoute un bandeau émotionnel au-dessus.
- **Purpose :** processus en 3 étapes (Choisir → Décrire → Suivre), délai humain, sécurité des données ; **trust row** icônes monoline.

### 5.2 Bloc garantie & en-tête catalogue
- **Bloc `id="assist-garantie"`** (scroll-margin pour ancres) : badge **50%**, titre + `APPLICATION_GUARANTEE_SUMMARY` + microtexte — premier élément dans le catalogue.
- **Header :** kicker “Assist candidatures…”, **`h1`** “Déléguez vos candidatures…”, paragraphe valeur.

### 5.3 Section A — Emploi
- **Grille `md:grid-cols-3` :** une `PackageCard` par entrée `JOB_PACKAGES`.
- **Sous-grille :** `ComparisonTable` sur le même ensemble de forfaits.

### 5.4 Section B — Universités
- **Même pattern :** `UNIVERSITY_PACKAGES` + `ComparisonTable` dédiée.

### 5.5 Pied de page catalogue
- **Liens :** `/overview#assist-requests` (“Mes demandes”) et `/overview` — le composant **n’embarque pas** `MyDelegatedRequests` (aperçu demandes sur **PAGE 22**).

### 5.6 FAQ & objections
- **Purpose :** répondre à “Pourquoi payer ?”, “Délai”, “Remboursement”, “Données personnelles” en accordéons.
- **Ton :** factuel, non agressif commercial.

### 5.7 Promo contextuelle (optionnel)
- **Purpose :** `DelegatedApplicationsHomePromo` sur **PAGE 01** / hub pays — cohérence visuelle avec **PAGE 16** bandeau.

### 5.8 CTA final & secondaire
- **Primary :** vers **PAGE 21** avec **serviceId** pré-sélectionné si clic depuis une carte.
- **Secondary :** contact humain (mailto ou chat futur).

---

## 6. UI Design Direction
Esthétique **concierge hôtel 5* numérique** : noir profond + filets or pâle (très subtil) sur CTA zones.

---

## 7. Interaction Design
Hover carte : révèle “3 prochaines étapes” overlay léger.

---

## 8. Responsive UX
Comparatif : scroll horizontal avec hint shadow.

---

## 9. Accessibility
Tableau comparatif avec header sticky + rôles ARIA.

---

## 10. Edge Cases & States
Aucun service disponible : contact support ; maintenance : bannière.

---

## 11. User Journey Connections
Vers apply ; retour pays.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Créer **ribbon “Sérénité”** au-dessus hero. Offres comme **fiches menu gastronomique** — hiérarchie prix discrète mais lisible.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 20]
