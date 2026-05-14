# PAGE 36 — “ANCHOR”
## Suite confiance & légal — mentions, confidentialité, cookies (routes **futures** / contenu à brancher)

### File Name
`36-anchor-trust-legal-suite.md`

### Page Type
Public (spec **anticipée** — pas encore de routes dédiées dans `app/` au moment de la rédaction)

### Related User Journeys
- Transparence RGPD / ePrivacy
- Réduction friction “est-ce sérieux ?” avant conversion services

### Connected Pages
- **Liens depuis :** `SiteFooter` (**PAGE 43** / parent **PAGE 34**), formulaire délégué (PAGE 21), emails transactionnels futurs
- **Liées :** PAGE 32 (transparence données techniques)

---

## 1. Page Purpose
Préparer **l’architecture UX légale minimale viable** pour VisaFlow : pages statiques ou CMS pour **Mentions légales**, **Politique de confidentialité**, **Politique cookies** (+ bannière consentement). Aujourd’hui absentes du routeur — ce document permet à Stitch / produit de **livrer un bloc cohérent** sans refonte ultérieure des maquettes.

---

## 2. Primary User Actions
- **Primaires :** lire ; accepter / personnaliser cookies (bannière).
- **Secondaires :** télécharger politique PDF (futur) ; contact DPO (mailto).

---

## 3. UX Goals
- **Clarté juridique** sans intimidation (titres courts, sections numérotées, sommaire sticky).
- **Confiance** : dernière mise à jour visible en haut de chaque document.

---

## 4. Layout Architecture
- **Template unique “legal document”** : sommaire gauche (desktop) + corps scrollable ; mobile : sommaire collapsible top.
- **Bannière cookies** : fix bas au-dessus du `SiteObjectiveDock` (z-index coordonné avec PAGE 34) ou bandeau haut si dock trop chargé.

---

## 5. Full Section Breakdown

### 5.1 Mentions légales
- **Contenu :** éditeur / société, hébergeur, contact, numéro d’immatriculation si applicable.
- **Visuel :** typographie serif option pour longues lectures ; `max-w-prose` centré.

### 5.2 Politique de confidentialité
- **Sections :** données collectées (compte Clerk, formulaires délégués, analytics), finalités, durées, sous-traitants (Vercel, Render, Sentry… à lister factuellement), droits utilisateur.
- **Interlinking :** lien vers glossaire intelligence (PAGE 32) pour utilisateurs techniques.

### 5.3 Politique cookies
- **Matrice :** nom cookie, finalité, durée, opt-in/out.
- **Boutons :** “Tout accepter”, “Tout refuser”, “Personnaliser” (modale secondaire).

### 5.4 Bannière consentement (premier visit)
- **Purpose :** non bloquante pour lecture ; bloquante pour scripts non essentiels jusqu’à choix.
- **A11y :** focus trap dans modale “Personnaliser” ; bouton fermer explicite.

### 5.5 Liens footer (`SiteFooter`)
- **Ordre suggéré :** Mentions · Confidentialité · Cookies · (Contact) — alignés à gauche sur mobile, centrés desktop.

### 5.6 États localisés
- **FR uniquement** au départ ; structure prête pour `en` (toggle futur en footer).

### 5.7 Alignement exports & compte (**PAGE 24**)
- **Purpose :** la politique de confidentialité doit **référencer** l’export JSON RGPD (`/api/user/data-export`) et le **périmètre Clerk** (données hors export Babil) — même langage que la section “Vos données” du profil.

### 5.8 Assist & données dossiers (**PAGE 20–21**)
- **Purpose :** finalités traitement des champs formulaire délégué, durée conservation dossiers, destinataires internes — cohérent `delegated-application-*` libs.

### 5.9 Intelligence & provenance (**PAGE 32** / **PAGE 16**)
- **Purpose :** mentionner observations / sources agrégées ; lien vers glossaire ou doc technique pour utilisateurs avancés.

---

## 6. UI Design Direction
Même tokens que le marketing mais **fond `surface` ou blanc pur** pour lisibilité longue ; liens `primary` soulignés.

---

## 7. Interaction Design
Sommaire : clic scroll smooth vers ancre ; URL hash pour partage section (`#traitement-des-donnees`).

---

## 8. Responsive UX
Modale cookies pleine largeur mobile ; table cookie horizontale scroll avec header sticky.

---

## 9. Accessibility
Hiérarchie `h1` par page légale ; sous-sections `h2` ; listes de définitions pour termes juridiques fréquents.

---

## 10. Edge Cases & States
Utilisateur a déjà consenti : bannière absente ; ré-ouverture via lien “Gérer mes cookies” dans footer.

---

## 11. User Journey Connections
Renforce conversion **PAGE 20–21** ; complète narrative transparence **PAGE 16** (provenance pays).

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Créer un **“legal reader”** premium : colonne sommaire fine grisée, corps blanc avec **filet marge gauche** type document notarié. Bannière cookies en **glass dark** compacte, CTA primaire “Accepter” à droite (LTR).

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
Fichier repo : `docs/google-stitch/assets/page-36-anchor-stitch-reference.png`

**Architecture livrée (Stitch v1 — Anchor legal reader + cookie consent)** :
- **Route `/legal`** créée comme single-page reader. Layout serveur (`app/(public)/legal/layout.tsx`) porte les `metadata` (titre, description). Page client (`app/(public)/legal/page.tsx`) implémente le 2-col cream Stitch :
  - **Sommaire sticky gauche** (`lg:sticky lg:top-24`) sur surface cream `#F5F0E3`, eyebrow mono « Sommaire légal », 4 entrées (`Mentions Légales`, `Politique de Confidentialité`, `Gestion des Cookies`, `CGU`). Active state pill white + accent vertical navy 3px gauche (mêmes tokens que PAGE 35). Scroll-spy via `IntersectionObserver`.
  - **Header article** : chip blanche `Mise à jour : 15 Octobre 2024` + serif `h1` `Mentions Légales & Confidentialité` (fluid clamp 2.2–3rem) + intro paragraphe.
  - **Section 01 Mentions Légales** : héritage loi 2004-575, white card `Éditeur du site` (dl mono labels / valeurs), white card `Hébergement` (Vercel / Render / Neon) — Stitch §5.1.
  - **Section 02 Politique de Confidentialité** : intro RGPD, h3 `Collecte des Données` avec checkmarks accent bleu (5 lignes : identification, connexion, requêtes, profil mobilité, dossiers délégués — couvre Stitch §5.2 + §5.7 + §5.8). h3 `Sous-traitants techniques` (Clerk, Vercel, Render+Neon, Sentry). Callout bleu pâle « Vos droits RGPD » avec lien `/profile` + mail `dpo@visaflow.com`. Note finale liant `/intelligence-fieldpaths` (PAGE 32 / §5.9).
  - **Section 03 Gestion des Cookies** : table 4 colonnes (Nom · Finalité · Durée · Statut) avec status pill `Essentiel` (emerald) ou `Opt-in` (amber). 4 cookies déclarés : `__clerk_session`, `vf.cookies.v1`, `vf.objective.v1`, `_vercel_speed_insights`. CTA navy « Gérer mes préférences cookies » → réouvre la bannière (event bus `vf:cookies:open`).
  - **Section 04 CGU** : engagements utilisateur (checklist 4 items), limitation de responsabilité, white card finale `legal@visaflow.com` + clause de compétence territoriale Paris.
  - Footer d'article : ligne fine + mono « Document maintenu par l'équipe Légal & Confidentialité — version du 15 Octobre 2024 ».
- **Bannière consentement `CookieConsentBanner`** (`components/cookies/CookieConsentBanner.tsx`) : glass dark `#0E141F/95` backdrop-blur, fixed bottom centré largeur `min(46rem,100vw-2rem)`, role="dialog". Titre serif `Préférences de navigation` + icône `ShieldCheck` or. Body 12.5px. 3 boutons : outline `Personnaliser` (navigue `/legal#cookies`), outline `Refuser`, bleu `Accepter`. Stockage `localStorage` `vf.cookies.v1` = `{ status, ts }`. Apparaît seulement si pas de consent ; réouverture via event `vf:cookies:open` (helper exporté `openCookiePreferences()`).
- **`SiteChrome`** monte `<CookieConsentBanner />` dans la branche publique (pas standalone) — il ne pollue donc pas les routes `/sign-in`, `/sign-up`, et dashboard.
- **`SiteFooter`** restylé en bloc Anchor :
  - Ligne 1 : logo VisaFlow + nav légale mono uppercase tracking (`Legal`, `Support` mailto, `Privacy Policy`, `Terms of Service`, bouton `Gérer les cookies` qui ré-ouvre la bannière) + copyright droite « © {year} VisaFlow Intelligence. Tous droits réservés ».
  - Ligne 2 (séparée par filet) : signature `Réalisé par JADISS EL ANTAKI` + CTA PayPal Don préservé.
- **A11y** : `role="dialog"` + `aria-labelledby` + `aria-describedby` sur la bannière, scroll-mt-28 sur chaque section pour ancres hash, `aria-current="true"` sur item TOC actif, h1/h2/h3 hiérarchiques.
