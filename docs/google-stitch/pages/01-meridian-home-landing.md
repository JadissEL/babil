# PAGE 01 — “MERIDIAN”
## Accueil VisaFlow — landing intelligence mobilité

### File Name
`01-meridian-home-landing.md`

### Page Type
Public

### Related User Journeys
- Découverte organique / SEO
- Première impression marque
- Entrée vers Explorer ou Compare selon objectif

### Connected Pages
- **Précédent :** sources externes, campagnes
- **Suivant :** `/explorer`, `/compare`, `/countries/[id]`, `/overview` (Espace perso)

---

## 1. Page Purpose
L’accueil **ancre la promesse VisaFlow** : mobilité internationale pour profils marocains avec scores, friction, études, business. Elle résout *“Par où commencer ?”* en combinant **hero émotionnel**, **filtres rapides**, **pays vitrines** et **preuve de profondeur** (données + parcours). Objectif business : augmenter l’exploration qualifiée et pousser vers moteurs (probabilité, reco) sans submerger.

---

## 2. Primary User Actions
- **Primaires :** lancer exploration objectif-aware ; ouvrir un pays vitrine ; utiliser filtres rapides du hero.
- **Secondaires :** lire slides hero ; défiler carrousel monde.
- **Engagement :** cliquer comparer / Schengen depuis modules secondaires (si présents dans `HomeExperience`).
- **Conversion :** CTA navbar **Espace perso** → auth Clerk implicite au besoin.

---

## 3. UX Goals
- **Émotion :** inspiration contrôlée (aspiration voyagée, pas “influence” creuse).
- **Confiance :** montrer densité informationnelle sans jargon initial.
- **Clarté :** hiérarchie lecture F — kicker → titre → sous-texte → action.
- **Friction réduite :** un seul niveau de décision avant la grille pays.

---

## 4. Layout Architecture
- **Z0** Sticky `AppNavbar` (identité, liens long-cours, CTA espace perso).
- **Z1** Hero plein largeur : carrousel ou séquence slides (`HeroWorldCarousel` mental model) + CTA primaire.
- **Z2** Bande filtres rapides / moteur léger (`HomeQuickFilterEngine` pattern).
- **Z3** Grille pays vitrines (`CountryGrid` / cards) avec respiration verticale large.
- **Z4** Footer marketing (si global layout l’inclut) ou rappel discret vers documentation intelligence.
- **Responsive :** hero stack vertical sur mobile ; filtres en scroll horizontal chip rail.

---

## 5. Full Section Breakdown

### 5.1 Navbar
- **Purpose :** orientation constante + sortie vers espace connecté.
- **Hierarchy :** logo > liens secondaires > CTA primaire droite.
- **Interactions :** hover link color ; CTA hover `primary-hover`.
- **Empty states :** N/A.
- **Responsive :** menu compact / drawer Stitch (icône hamburger) sous `md` si non présent en code — **à concevoir** pour parité mobile.

### 5.2 Hero
- **Purpose :** émotion + promesse en une phrase.
- **Animations :** transition slide douce ; cross-fade texte ; respect reduced-motion = cut instantané.
- **Visual importance :** dominant LCP — optimiser médias.

### 5.3 Quick filters / mini-engine
- **Purpose :** activation immédiate sans aller à l’explorer complet.
- **Interactions :** changement objectif met à jour liens compare/explore (pattern `ObjectivePreferenceProvider`).
- **Empty states :** si aucun pays résolu : message + CTA explorer sans filtre.

### 5.4 Showcase grid
- **Purpose :** preuve sociale de données (cartes pays).
- **Skeletons :** shimmer cards alignées grille finale.
- **Pagination :** scroll infini déconseillé pour SEO — préférer “Voir plus” vers explorer.

---

## 6. UI Design Direction
Palette chaude **papier ivoire** (`#fdf8ef` feel), **primary** saturé mais noble sur CTA, ombres `shadow-soft` / `shadow-card`. Typographie **noir chaud** (`text-text`) et **muted** pour méta. Coins `rounded-2xl` sur modules.

---

## 7. Interaction Design
Scroll : parallax léger hero optionnel. Clic carte pays : ripple subtil + navigation Next. Keyboard : `Tab` traverse filtres puis grille ordonnée DOM.

---

## 8. Responsive UX
- **Desktop :** hero split possible texte / visuel.
- **Tablet :** hero full width, filtres 2 lignes.
- **Mobile :** filtres chips scroll horizontal ; cartes 1 colonne.

---

## 9. Accessibility
Contraste titres ; `aria-live="polite"` sur changement de slide si auto-play ; pause auto-play visible ; images hero `alt` descriptifs contextualisés.

---

## 10. Edge Cases & States
- **Loading :** skeleton hero + skeleton grid.
- **Empty :** pays vitrines indisponibles → message + lien explorer.
- **Error :** boundary parent — message générique + reload.

---

## 11. User Journey Connections
**Entrées :** SEO, partage lien. **Sorties :** explorer, compare, fiche pays, espace perso. **Conversion :** premier clic objectif. **Rétention :** favoriser sign-in après 2e interaction (pattern futur).

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Concevoir un **hero cinématographique minimal** (pas de stock photo générique) : cartes abstraites géo, grain léger, lumière latérale. Filtres comme **instrument de précision** (glass chips). Grille pays : **cartes premium** avec drapeau net, score en barre horizontale douce, micro-label catégorie. Ambiance **“research terminal luxe”** — jamais start-up criarde.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 01]
