# PAGE 22 — “HORIZON”
## Aperçu espace connecté — `/overview`

### File Name
`22-horizon-dashboard-overview.md`

### Page Type
Logged-In (Clerk)

### Related User Journeys
- Post-auth landing
- Retour utilisateur récurrent

### Connected Pages
- **Précédent :** sign-in Clerk, home CTA
- **Suivant :** `/history`, `/profile`, engines

---

## 1. Page Purpose
Donner **vision d’ensemble personnalisée** : file **Assist** (`MyDelegatedRequests`), préférences objectif (`ObjectivePreferencePanel`), onboarding post-signup (**PAGE 46** `PostSignupOnboarding`), pays récents (`RecentlyViewedCountries`), grille **stats** (placeholders produit), puis **grille modules** liés aux moteurs + colonne **“Flash OSINT”** (copy statique illustrative). Résout *“Où j’en suis dans mon projet mobilité ?”* — **`ProfileContextBanner` n’est pas monté sur cette vue** au moment de la spec (vérifier le code si réintroduit).

---

## 2. Primary User Actions
- **Primaires :** compléter onboarding checklist ; ouvrir historique ; relancer moteur.
- **Secondaires :** corriger profil ; accéder admin si rôle.

---

## 3. UX Goals
- **Orientation** immédiate (pas de dashboard vide froid).
- **Motivation** douce (progress visuelle).

---

## 4. Layout Architecture
**Implémentation (`OverviewPageClient.tsx`) :** `h1` “Bonjour, {firstName}” → **`MyDelegatedRequests`** (pleine largeur) → **`ObjectivePreferencePanel`** → **`PostSignupOnboarding`** (**PAGE 46**) → **`RecentlyViewedCountries`** → grille **4 stats** (valeurs aujourd’hui **statiques** dans le code — placeholder) → layout **2/3 + 1/3** : **Outils mobilité** (cartes `modules` avec badge statut Prêt/Bientôt/Nouveau) + **Flash OSINT** (encadré narratif + lien explorer).

---

## 5. Full Section Breakdown

### 5.1 Skeleton premier paint
- **Note :** pas de `DashboardPageSkeleton` explicite dans `OverviewPageClient` ; chargement Clerk peut laisser prénom vide (“Voyageur”) — prévoir skeleton global **PAGE 35** si besoin.

### 5.2 `MyDelegatedRequests`
- **Purpose :** premier bloc sous le titre — priorité conversion **PAGE 20–21** ; liste / empty state géré dans le composant.

### 5.3 `ObjectivePreferencePanel`
- **Purpose :** choix objectif primaire ; alimente `ctaExploreHref` / `ctaCompareHref` pour les liens modules dynamiques.

### 5.4 `PostSignupOnboarding`
- **Spec détaillée :** **PAGE 46** — étapes profil / reco / explorateur, `vf_onboarding_v1`, masquage, compte récent 21 j.

### 5.5 `RecentlyViewedCountries`
- **Purpose :** reprise rapide des fiches **PAGE 16** ; scroll horizontal si nombreux.

### 5.6 Grille stats (placeholder)
- **Purpose :** 4 cartes (score moyen, pays analysés, alertes, avis) — **chiffres figés** dans l’implémentation actuelle ; Stitch peut proposer état “live” futur sans casser la grille.

### 5.7 Modules “Outils mobilité”
- **Purpose :** `useMemo` liste : probabilités, reco pro, compare (href `compareHref`), recommendations, explorer (`explorerHref`), permis, Assist, éducation, business…
- **Badge état :** couleur selon `Prêt` / `Bientôt` / `Nouveau`.

### 5.8 Flash OSINT
- **Purpose :** colonne droite — **contenu démo** (Espagne / France / Italie) + CTA “Ouvrir l’Explorer” ; préciser en maquette si placeholder editorial.

### 5.9 Admin / modération
- **Purpose :** non exposés ici ; accès via nav dashboard (**PAGE 35**) vers `/admin` ou `/moderation`.

---

## 6. UI Design Direction
Différencier **workspace** du marketing : sidebar sombre ou clair inversé (selon code) mais mêmes tokens boutons.

---

## 7. Interaction Design
Widgets : drag reorder (futur) ; hover quick actions.

---

## 8. Responsive UX
Widgets stack ; sidebar → drawer.

---

## 9. Accessibility
Landmarks `nav`, `main`, `aside` ; headings par widget.

---

## 10. Edge Cases & States
Nouveau compte : onboarding full ; erreur fetch : retry widget isolé.

---

## 11. User Journey Connections
Hub vers toutes routes dashboard & explorer.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Créer **bento dashboard** asymétrique premium : widget “Prochaine étape” large 2×1, pays récents en strip horizontal scroll. Onboarding comme **checklist passport stamps** animés subtilement.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
Fichier repo : `docs/google-stitch/assets/page-22-horizon-stitch-reference.png`

**Architecture livrée (Stitch v1 — Horizon Dashboard cream)** : refactor **chirurgical** de `OverviewPageClient.tsx`. Tous les composants riches restent **intacts** (`MyDelegatedRequests`, `PostSignupOnboarding`, `ObjectivePreferencePanel`, `RecentlyViewedCountries`) — seul le shell + headers + tuiles statiques sont restylés en banking cream.
- **Hero** : eyebrow mono `Horizon Dashboard` + serif `Bonjour, {firstName}.` à gauche ; bloc `Dernière synchronisation` (`Aujourd'hui, HH:MM`) à droite.
- **`MyDelegatedRequests`** intact (gère sa propre liste / empty state).
- **Stats strip** (`Score moyen` / `Pays analysés` / `Alertes actives` / `Note utilisateur`) : 4 tuiles cream **sans** pastilles colorées géantes — eyebrow mono + chiffre serif + chevron `↗` succès / dot rouge alertes / `/5` rating.
- **`ObjectivePreferencePanel`** + **`PostSignupOnboarding`** rendus dans des cards cream avec eyebrows `Parcours initial` + `Préférence objectif` au-dessus.
- **`RecentlyViewedCountries`** intact sous eyebrow `Récemment consulté`.
- **Grid 2/3 + 1/3** : 
  - Gauche : `Outils mobilité` — eyebrow + serif title, grille 2-col responsive de `ModuleTile` banking (icône carrée minimale, status pill `Prêt / Nouveau / Bientôt / Mise à jour`, titre serif, description, `ChevronRight Accéder` link), tous les 9 modules réels préservés (probabilités, reco pro, compare, recommandations, friction map, permis, assist, éducation, business).
  - Droite : `Flash OSINT` — carte cream élevée, intro italique, 3 entrées (Espagne BLS / France TLS / Italie) avec eyebrow tracking-uppercase coloré ton signal + titre serif + texte, CTA bouton outline `Ouvrir l'Explorer ↗` vers `explorerHref` (toujours dérivé de `useObjectivePreference`).

Logique inchangée : `useUser()` (Clerk), `useObjectivePreference()`, `ctaExploreHref` / `ctaCompareHref` (lien Compare / Friction Map dynamiques), pas de fetch ajouté. Stats restent statiques (placeholder produit signalé en spec §5.6) — Stitch ne change pas la stratégie données.
