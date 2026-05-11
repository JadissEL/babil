# PAGE 41 — “AZIMUTH”
## Objectif de mobilité global — `AppObjectiveRoot`, wizard premier passage, `SiteObjectiveDock`

### File Name
`41-azimuth-global-mobility-objective.md`

### Page Type
System / Transversal (contexte React + UI dock + overlay wizard)

### Related User Journeys
- Première visite : “pourquoi je suis ici ?” → choix d’objectif (tourisme, travail, études…)
- Retour : changer l’objectif sans refaire tout le parcours — accueil / explorateur / compare **biaisés** par le slug courant

### Connected Pages
- **Montage :** `app/layout.tsx` — **`AppObjectiveRoot`** enveloppe **`SiteChrome`** (**PAGE 34**).
- **Dock & layout :** **`VF_OBJECTIVE_DOCK_HEIGHT_VAR`** (`--vf-objective-dock-height`) — partagé avec padding `main` et position **toasts** (**PAGE 40**).
- **Profil :** slugs alignés `lib/user-objectives/registry` — cohérence **PAGE 24** si objectifs profil croisent ce state.

---

## 1. Page Purpose
Centraliser la spec **produit + technique** de l’**objectif principal** persistant : où il est stocké, comment il se synchronise (local + API utilisateur connecté), comment l’utilisateur le change depuis le dock, et comment le **wizard première visite** s’affiche au-dessus de tout.

---

## 2. Primary User Actions
- **Wizard (si `wizardCompletedAt` absent) :** choisir un objectif dans la grille catégories **ou** fermer sans choisir (`dismissObjectiveWizard`).
- **Dock (après `ready`) :** ouvrir le panneau `DockObjectivePicker` → parcourir groupes (`USER_OBJECTIVE_CATEGORY_ORDER`) → sélectionner un slug → `setPrimaryObjective` (fermeture panneau + persistance).
- **Lecture seule :** libellé courant sous “Objectif principal” ; état chargement = skeleton pulse (`aria-hidden`).

---

## 3. UX Goals
- **Une seule vérité** : `ObjectivePreferenceProvider` — pas de second state objectif concurrent dans les maquettes.
- **Continuité** : copy dock *“L’accueil, l’explorateur et les raccourcis s’alignent sur votre choix.”* (implémentée dans le panneau listbox).
- **Non bloquant après onboarding** : dock compact ; wizard est modal plein écran une seule fois (tant que non complété / non dismiss).

---

## 4. Layout Architecture

### 4.1 `AppObjectiveRoot` (`components/layout/AppObjectiveRoot.tsx`)
- **`ObjectivePreferenceProvider`** enveloppe `children` dans une colonne flex `min-h-0 flex-1`.
- **`FirstVisitObjectiveWizard`** rendu **après** les enfants (sibling) pour empiler au-dessus sans wrapper inutile.

### 4.2 `ObjectivePreferenceProvider`
- **Hydratation :** `readObjectivePreference()` (`lib/objective-preference-storage`) au mount ; écoute événement custom + `storage` pour resync.
- **Clerk :** si `user` chargé → `GET /api/user/profile` pour réconcilier objectif serveur (champs profil) avec le local — détails dans le fichier source.
- **API exposée :** `ready`, `preference`, `primaryDefinition`, `setPrimaryObjective`, `setSecondaryObjectives`, `dismissObjectiveWizard`, `reopenWizard`.

### 4.3 `FirstVisitObjectiveWizard`
- **Visibilité :** `ready && !preference.wizardCompletedAt`.
- **Overlay :** `fixed inset-0 z-[200]`, `role="dialog"`, `aria-modal="true"`, scroll body lock quand visible.
- **Actions :** même grille d’objectifs que le wizard interne ; bouton ✕ “Fermer sans choisir” → `dismissObjectiveWizard`.

### 4.4 `SiteObjectiveDock` (`components/layout/SiteObjectiveDock.tsx`)
- **Position :** `fixed bottom-0 left-0 right-0 z-30` ; **`lg:left-56`** pour laisser place au rail primaire desktop.
- **Mesure hauteur :** `ResizeObserver` sur la section → écrit `document.documentElement.style.setProperty('--vf-objective-dock-height', …)` (minimum **48px**) ; cleanup retire la propriété.
- **Contenu :** `DockObjectivePicker` ; `aria-label="Objectif principal"` sur la `<section>`.

### 4.5 `DockObjectivePicker`
- **Bouton déclencheur :** “Objectif principal” + libellé ou *“Choisir votre objectif…”* ; `aria-expanded` / `aria-haspopup="listbox"`.
- **Panneau :** `role="listbox"`, ancré **`bottom-full`** (s’ouvre vers le haut), `z-[80]`, scroll interne `max-h-[min(60dvh,22rem)]`.
- **Outside click :** `mousedown` sur document ferme le panneau.

---

## 5. Full Section Breakdown

### 5.1 Persistance (`objective-preference-storage`)
- **Purpose :** schéma versionné `StoredObjectivePreferenceV1` (`primarySlug`, `secondarySlugs`, `wizardCompletedAt`).
- **Stitch :** ne pas inventer de clés storage — toute nouvelle étape wizard doit passer par ce module.

### 5.2 Registre métier (`lib/user-objectives/registry`)
- **Purpose :** slugs typés, libellés FR, groupement `listObjectivesGrouped` — source des cartes wizard + entrées listbox.

### 5.3 Impact navigation (rappel produit)
- Objectif influence **CTA** et deep links (ex. compare / explorer — voir **PAGE 02**, **PAGE 03**, **PAGE 01** dans leurs specs respectives).

### 5.4 Z-index relatif
- **Dock** `z-30` ; panneau picker `z-[80]` ; wizard `z-[200]` ; toasts **`z-[100]`** (**PAGE 40**) — le wizard masque toasts si ouvert simultanément (cas rare).

---

## 6. UI Design Direction
Palette dock / wizard alignée **papier chaud** `#fdf8ef` / bordures `border-line` — cohérent avec **PAGE 34** ; pas de dark mode séparé pour ces surfaces sauf décision design system.

---

## 7. Interaction Design
- Wizard : scroll interne carte max-height ; **XS** `items-start` pour éviter rognage en haut fort zoom (**commentaire code**).
- Dock : chevron indique ouverture panneau vers le haut (`rotate-180` quand ouvert).

---

## 8. Responsive UX
Safe-area sur dock (`pl`/`pr`/`pb` avec `env(safe-area-inset-*)`) ; wizard padding top/bottom safe-area.

---

## 9. Accessibility
Wizard titre `aria-labelledby` ; fermeture clavier focusable ; listbox roles cohérents sur picker.

---

## 10. Edge Cases & States
- **`!ready` :** skeleton dock uniquement — pas de flash “Choisir…” avant hydratation locale.
- **Utilisateur connecté avec profil serveur :** merge peut écraser / compléter le local — suivre logique `ObjectivePreferenceProvider`.

---

## 11. User Journey Connections
Conditionne la pertinence perçue des scores et liens sur **PAGE 01–03** ; renforce personnalisation avant **PAGE 24**.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Trois planches : (1) **wizard** desktop + mobile avec grille objectifs ; (2) **dock fermé** avec libellé long tronqué ; (3) **dock ouvert** listbox au-dessus du contenu avec **ombre** séparant du scroll page.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 41]
