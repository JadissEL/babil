# PAGE 44 — “QUAY”
## Navigation primaire — rail desktop + drawer mobile (`SitePrimaryNavColumn`, `useSitePrimaryNavState`)

### File Name
`44-quay-site-primary-navigation-rail.md`

### Page Type
System / Transversal (composants **`components/layout/SitePrimaryNav.tsx`**)

### Related User Journeys
- Passer d’une grande section produit à l’autre sans repasser par l’accueil
- Sur mobile : ouvrir / fermer le menu latéral depuis le header (**PAGE 43**)

### Connected Pages
- **Parent :** **PAGE 34** (`SiteChrome` — flex `SitePrimaryNavColumn` + `main`).
- **Déclencheur :** **PAGE 43** (`SiteHeaderMenuButton`, `lg:hidden`).
- **Objectif global :** **PAGE 41** — liens **Explorer** et **Comparer** sont **dynamiques** (`ctaExploreHref` / `ctaCompareHref` depuis `preference.primarySlug`).
- **Routes cibles :** **PAGE 02** (Explorer), **PAGE 03** (Comparer), **PAGE 04** (Schengen), **PAGE 05–07**, **PAGE 10**, **PAGE 15**, **PAGE 08**, **PAGE 14**, **PAGE 09**, **PAGE 20** (libellés du rail — aligner specs par PAGE si besoin).

---

## 1. Page Purpose
Spécifier le **menu latéral principal** : liste des entrées, état actif (`aria-current`), comportement **off-canvas** mobile (backdrop, Escape, scroll lock), et cohabitation **sticky** desktop sous le header (`top-16`).

---

## 2. Primary User Actions
- **Desktop (lg+) :** clic lien dans le rail fixe à gauche du `main`.
- **Mobile (<lg) :** ouvrir via burger → tiroir ; fermer via backdrop, bouton ✕, **Escape**, ou navigation ( **`onClick` sur chaque `Link`** appelle `onMobileClose`).

---

## 3. UX Goals
- **Lien actif lisible** : fond `bg-primary-soft`, `text-primary`, `ring-1 ring-primary/25`.
- **Pas de double Schengen** : la liste est construite comme `[Explorer, Schengen, Comparer, …STATIC_LINKS.slice(1)]` — `STATIC_LINKS[0]` (Schengen dupliqué) est **omis** de la slice.
- **Cohérence objectif** : Explorer / Comparer reflètent le slug courant — message aligné **PAGE 41** (dock copy).

---

## 4. Layout Architecture

### 4.1 `useSitePrimaryNavState`
- **State :** `mobileOpen`, `setMobileOpen`, `closeMobile` (`() => setMobileOpen(false)`).
- **Escape global :** `useEffect` écoute `keydown` sur `window` — `Escape` ferme le drawer.

### 4.2 Overlay mobile
- **`fixed inset-0 z-[55]`** — fond `bg-text/40`, léger `backdrop-blur`; `pointer-events-none opacity-0` quand fermé ; `onClick` → `onMobileClose`.

### 4.3 `<aside id="site-primary-nav">`
- **Mobile fermé :** `-translate-x-full` ; ouvert : `translate-x-0`.
- **Largeur tiroir :** `w-[min(19rem,88vw)]`.
- **Desktop :** `lg:sticky lg:top-16 lg:z-0 lg:h-[calc(100dvh-4rem)] lg:w-56` — **aligné hauteur header** `min-h-16` (4rem) ; pas d’ombre latérale en desktop (`lg:shadow-none`).
- **Barre mobile haut aside :** libellé “Menu” + bouton fermer (`aria-label="Fermer le menu"`), **`lg:hidden`**.

### 4.4 Corps `<nav aria-label="Navigation principale">`
- **`usePathname`** + **`isActivePath`** : cas particuliers **Explorer** et **Comparer** (match pathname **sans** querystring vs href qui peut inclure query objectif).
- **Liens :** ordre exact dans le code — **Explorer**, **Schengen**, **Comparer**, puis **Moteur visa**, **Labo reco**, **Assist**, **Éducation**, **Communauté**, **Business**, **Permis**, **Investissement**.

### 4.5 Scroll lock mobile
- Quand `mobileOpen`, `document.documentElement.style.overflow = 'hidden'` ; restauré au cleanup.

---

## 5. Full Section Breakdown

### 5.1 `SiteHeaderMenuButton`
- **Visibilité :** `lg:hidden` — visible seulement mobile / tablette étroite.
- **A11y :** `aria-label="Ouvrir le menu de navigation"`.

### 5.2 Dock & rail
- Le dock objectif (**PAGE 41**) utilise **`lg:left-56`** pour ne pas recouvrir le rail — les deux specs doivent rester synchronisées si largeur rail change.

### 5.3 Z-index (rappel)
- Overlay **`z-[55]`**, aside **`z-[56]`** — au-dessus du **`main`** et, en tiroir ouvert, **au-dessus du header** (`z-50`, **PAGE 43**) : le menu recouvre toute la hauteur viewport.

---

## 6. UI Design Direction
Même fond **papier chaud** `#fdf8ef/95` que header/footer (**PAGE 43**) ; liens **font-black** `text-sm` ; espacement vertical serré `gap-0.5`.

---

## 7. Interaction Design
- Transition drawer : `transition-transform duration-200 ease-out`.
- Hover inactifs : `hover:bg-primary-soft/70 hover:text-primary`.

---

## 8. Responsive UX
- `nav` scroll interne : `min-h-0 flex-1 overflow-y-auto overscroll-y-contain` pour listes longues sur petits écrans.

---

## 9. Accessibility
- `aria-current="page"` sur le lien actif.
- Backdrop : `aria-hidden={!mobileOpen}` quand fermé pour éviter focus fantôme — vérifier ordre focus réel si amélioration future (trap focus non implémenté explicitement dans le snippet actuel).

---

## 10. Edge Cases & States
- **`primarySlug` null :** `ctaExploreHref` / `ctaCompareHref` gèrent le défaut côté `lib/cta-hrefs` — ne pas dupliquer la logique dans Stitch.
- **Path avec query :** matching ignore query pour actif — cohérent sous-pages `/explorer/...` si href de base match.

---

## 11. User Journey Connections
Hub de découverte vers toutes les grandes verticales publiques ; **Assist** mène vers services délégués (**PAGE 20**).

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Trois états **mobile** : fermé (aperçu burger) ; ouvert (tiroir + backdrop) ; **desktop** rail sticky avec un lien actif surligné.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 44]
