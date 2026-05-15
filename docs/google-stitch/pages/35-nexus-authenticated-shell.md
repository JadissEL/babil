# PAGE 35 — “NEXUS”
## Shell espace connecté — `DashboardLayoutClient` + sidebars (routes `/overview`…)

### File Name
`35-nexus-authenticated-shell.md`

### Page Type
Logged-In / Transversal (enveloppe routes `(dashboard)`)

### Related User Journeys
- Navigation rapide entre outils personnels et exploration publique sans quitter le cadre “pro”
- Découverte des liens admin / modération selon droits

### Connected Pages
- **Enveloppe :** PAGE 22–27 (dashboard group)
- **Composants :** `DashboardSidebar`, `DashboardLayoutClient`, `AppSidebar`, `dashboard-nav-config`
- **Accès réseau :** routes `(dashboard)` couvertes par **`auth.protect()`** Edge — **PAGE 39** (`proxy.ts`)
- **Toasts :** même **`AppToaster`** global que le site public — **PAGE 40** (`app/layout.tsx` → `SiteChrome`)

---

## 1. Page Purpose
Définir l’**enveloppe workspace** : double rail de navigation (workspace vs explorer), zone de contenu scrollable, titre de page dynamique (`getDashboardNavTitle`), et comportement **mobile drawer**. Objectif : Stitch reproduit la **même ossature** sur overview, history, profile, etc.

---

## 2. Primary User Actions
- **Primaires :** changer de section via sidebar ; replier sidebar (desktop) ; ouvrir drawer (mobile).
- **Secondaires :** bascule thème / curseur (`ThemeCursorToggle` si exposé dans ce shell).

---

## 3. UX Goals
- **Séparation claire** “outils perso” vs “continuer à explorer le monde”.
- **Densité** légèrement supérieure au marketing mais même ADN typographique.

---

## 4. Layout Architecture
- **Gauche (desktop) :** rail fixe ou collapsible avec icônes Lucide + labels.
- **Haut :** barre titre page + actions contextuelles (sign-out Clerk `UserButton`, etc.).
- **Centre :** `main` scrollable avec padding cohérent `PageContainer` patterns.
- **Mobile :** hamburger ouvre drawer pleine hauteur avec focus trap.

---

## 5. Full Section Breakdown

### 5.1 Workspace navigation group
- Items : Aperçu, Historique, Probabilités, Moteur reco pro, Mes recommandations, Profil, Admin, Design system.
- **Active state :** fond `primary-soft` + barre verticale `primary` 3px (Stitch).

### 5.2 Explorer navigation group
- Items : Explorer, Schengen, Comparer, Communauté, Business, Investment, Education (prefix), Permis, Modération.
- **Prefix match :** highlight parent quand sous-route education active.

### 5.3 Titre de page dynamique
- **Purpose :** le titre affiché doit matcher l’item actif (évite désorientation).
- **Edge :** route inconnue → libellé générique “Espace connecté”.

### 5.4 Zone contenu
- **Purpose :** largeur max alignée marketing (`max-w-7xl` familles) ou légèrement plus étroit pour lisibilité dashboard — **choisir une règle unique** et la documenter ici pour Stitch.

### 5.5 Rôle admin / modération
- **Purpose :** entrées visibles seulement si autorisé ; sinon absentes (pas disabled grisées inutilement).

### 5.6 Transitions entre sous-pages
- **Purpose :** éviter flash sidebar : layout persistant, seul `children` swap.

---

## 6. UI Design Direction
Sidebar **surface** ou **inset** contrasté ; icônes monoline 18–20px ; labels `text-xs` uppercase tracking pour cohérence nav publique.

---

## 7. Interaction Design
Collapse sidebar : icône seule mode ; tooltip au hover pour noms pays (desktop).

---

## 8. Responsive UX
Drawer mobile : overlay 40% noir ; fermeture swipe (option) ou bouton close explicite.

---

## 9. Accessibility
Drawer : `role="dialog"` ou `navigation` avec label “Navigation espace connecté” ; focus premier lien à l’ouverture.

---

## 10. Edge Cases & States
Contenu plus haut que viewport : seul `main` scroll, pas la sidebar.

---

## 11. User Journey Connections
Toutes les routes produit Nexus (`lib/nexus-shell-routes.ts` : `/`, outils workspace, explorer, etc.) partagent ce shell via `NexusShellGate` + `DashboardLayoutClient`. Seules les routes marketing résiduelles (`/countries/*`, `/legal`, …) conservent le shell public PAGE 34. Visiteurs non connectés : redirection Clerk vers `/sign-in?redirect_url=…`.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Générer **un frame maître “Dashboard shell”** réutilisable dans Figma/Stitch : sidebar + header + zone contenu vide en placeholder **“CONTENT SLOT”**. Toutes les captures PAGE 22–27 doivent **insérer le contenu dans ce slot** sans redessiner la sidebar.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
Fichier repo : `docs/google-stitch/assets/page-35-nexus-stitch-reference.png`

**Architecture livrée (Stitch v1 — Nexus workspace shell exclusif)** : rewrite complet du shell `(dashboard)` pour qu'il **remplace** entièrement le `SiteChrome` public sur les routes connectées (Stitch §11 « les pages publiques hors `(dashboard)` reviennent au PAGE 34 »).

**`SiteChrome` (`components/layout/SiteChrome.tsx`)** : `isNexusPath()` depuis `lib/nexus-shell-routes.ts` — **aucun** SiteHeader, SitePrimaryNav, SiteFooter sur les routes Nexus ; `NexusShellGate` monte le shell Mobility Intel. Toaster `AppToaster` + cookies conservés.

**`DashboardLayoutClient`** : cream `#FAF7EE` shell flex avec sidebar gauche + main droit, top bar collée en haut (desktop). Mobile : hamburger button ouvre le drawer sidebar avec overlay 45 % navy + ESC + scroll-lock préservés.

**`DashboardSidebar`** (rewrite complet, parité Stitch §5.1–5.2) :
- Header rail : serif `Mobility Intel` + mono `Premium Access` (Stitch parle directement marque produit interne).
- 2 groupes typographiques : `Workspace` (Aperçu, Historique, Mon profil, Moteur probabilités, Moteur reco pro, Mes recommandations, Administration, Design system) puis `Data & Analysis` (Explorer global avec href objectif-aware, Vue Schengen, Comparer pays avec href objectif-aware, Communauté, Business, Investment, Education prefix, Permis, Modération).
- Active state : background `bg-white` + accent vertical navy 3px gauche + texte navy + icône navy. Inactive : texte navy/60 + hover navy soft tint.
- CTA primaire bas du rail : navy filled `Nouvelle exploration` (lien `ctaExploreHref(preference.primarySlug)`).
- Footer rail : 2 liens mono uppercase tracking : `Settings` (Settings icon) → `/profile` ; `Support` (LifeBuoy icon) → `mailto:support@visaflow.com?subject=Support%20VisaFlow`.
- Mobile drawer : même rendu, surface white pleine hauteur, `BrandBlock` + bouton close `X` ; ARIA `role="navigation"` + label « Navigation espace connecté » (Stitch §9).

**Top bar `DashboardTopBar`** (desktop, sticky) :
- Eyebrow gauche mono `Espace connecté`.
- Liens secondaires centre : `Tendances mondiales` → `/explorer`, `Mises à jour de politique` → `/community`.
- Actions droite : outlined `Export Data` → `/profile` (déclenche flux GDPR existant), bouton `Bell` aria-labellisé (notifications stub — toast `appToast.info` "Aucune notification" si cliqué), Clerk `<UserButton afterSignOutUrl="/" />`.

**Slot contenu `main`** : padding cohérent + watermark subtil grille technique 48 px (Stitch §12 « content slot »), placeholder visible uniquement si aucune route active. Quand une route dashboard rend `children`, ils prennent le slot.

Titre dynamique préservé : `getDashboardNavTitle(pathname)` continue d'alimenter le `<h1>` mobile et le `<title>` HTML via metadata du layout serveur.
