# PAGE 23 — “CHRONICLE”
## Historique d’activité — `/history`

### File Name
`23-chronicle-activity-history.md`

### Page Type
Logged-In

### Related User Journeys
- Rétention / reprise de contexte
- Audit personnel des actions

### Connected Pages
- **Précédent :** `/overview`
- **Suivant :** pages liées (pays, engines) via items

---

## 1. Page Purpose
Matérialiser la **mémoire produit** (vues pays, runs moteur, commentaires — selon API `history`). Résout *“Qu’est-ce que j’ai déjà fait ?”*

---

## 2. Primary User Actions
- **Primaires :** filtrer / paginer ; rouvrir item.
- **Secondaires :** supprimer entrée (si produit l’autorise).

---

## 3. UX Goals
- **Lisibilité narrative** (libellés humains via `history-event-labels` patterns).

---

## 4. Layout Architecture
**Implémentation (`app/(dashboard)/history/page.tsx`) :** titre + description (limite **200** entrées) → **`Card`** avec barre **recherche** + **filtre type** (`Select`) → **table** responsive (scroll horizontal) — pas de timeline verticale dans le code actuel.

---

## 5. Full Section Breakdown

### 5.1 Chargement parallèle
- **`GET /api/user/history?limit=200`** + **`GET /api/countries?light=1`** pour résoudre les noms pays sur `VIEW_COUNTRY`.

### 5.2 Filtre par type d’événement
- **Purpose :** `Select` alimenté par l’ensemble des `type` observés ; libellés FR via `historyEventTypeLabelFr` (voir `lib/history-event-labels.ts`).

### 5.3 Recherche full-text locale
- **Champs matchés :** libellé FR, type brut, `JSON.stringify(payload)`, date locale FR, nom pays résolu, `countryId`.
- **Placeholder :** “Pays, type, date, contenu du payload…”.

### 5.4 Tableau colonnes
- **Date :** `toLocaleString('fr-FR')` (affichage tabulaire, pas `<time datetime>` aujourd’hui — opportunité a11y).
- **Type :** titre FR + `title` attribut type machine.
- **Pays :** nom depuis map `countryId` ou `—`.
- **Détails :** `payloadPreview` monospace tronqué + `title` complet.
- **Action :** lien “Fiche pays” si `type === 'VIEW_COUNTRY'` et `countryId` résolu.

### 5.5 Empty state filtré
- **Copy :** explique que les visites pays apparaissent après navigation connectée.
- **CTA :** `ObjectiveAwareExplorerLink` + lien `/profile`.

### 5.6 Skeleton
- **`DashboardPageSkeleton variant="table"`** pendant fetch.

---

## 6. UI Design Direction
Tableau sobre sur `surface` / `inset` ; en-tête uppercase tracking ; **compteur** d’événements filtrés à droite des filtres.

---

## 7. Interaction Design
Hover ligne : fond léger ; lien “Fiche pays” souligné au survol ; recherche debounce implicite (filtre client `useMemo`).

---

## 8. Responsive UX
`overflow-x-auto` sur wrapper table ; `min-w-[720px]` pour garder colonnes lisibles sur petit écran (scroll horizontal).

---

## 9. Accessibility
Prévoir évolution `<time datetime>` ; annoncer le nombre de résultats après filtre (live region option) ; `label` associé au champ recherche (`htmlFor`).

---

## 10. Edge Cases & States
Historique vide : illustration + CTA explorer ; erreur API : retry.

---

## 11. User Journey Connections
Réactivation vers pays / engines.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Items comme **fiches archives** avec micro texture papier. Icônes événement monoline 20px dans cercle `surface` inset.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
Fichier repo : `docs/google-stitch/assets/page-23-chronicle-stitch-reference.png`

**Architecture livrée (Stitch v1 — Chronicle cream log table)** : shell **cream `#FAF7EE`** sur le main du dashboard. 
- **Hero** : pill `LOG SYSTEM` (mono `tracking-[0.28em]`) + serif `Chronicle` + sous-titre `Mémoire de vos explorations et analyses (limite 200 entrées). Un historique immuable des activités au sein du terminal.`
- **Filter row** : `Input` cream (`Search` icon préfixe), select navy `Tous les types`, et **compteur** `Affichage 1-N sur TOTAL` mono à droite.
- **Tableau** carte blanche `border-[#0D1B3E]/10` :
  - thead mono uppercase (`Date & heure / Type d'activité / Cible / Pays / Détails (payload) / Action`)
  - tbody : 
    - colonne **Date** `toLocaleString('fr-FR')` ;
    - colonne **Type d'activité** : icône glyph (`MapPin` pour `VIEW_COUNTRY`, `Activity` pour `RUN_*`, `MessageSquare` pour `COMMENT*`, `FileText` fallback) + libellé FR ;
    - colonne **Cible / Pays** : nom de pays résolu (ou `Global` en italique gris si aucun `countryId`) ;
    - colonne **Détails (payload)** : pill cream `bg-[#FAF7EE]` mono `truncate` avec `title` complet ;
    - colonne **Action** : lien navy `Fiche pays` si `VIEW_COUNTRY` + `countryId` résolu, sinon micro chip mono `LOG SYSTEM` neutre quand aucune action utilisateur n'est disponible.
  - **Hover** ligne : fond `#FAF7EE`.
- **Pagination locale** : `visibleCount` (50 initial), bouton outline navy `Charger plus d'entrées` qui ajoute +50 jusqu'à atteindre `filtered.length` ; disparaît quand tout est visible.
- **Empty state filtré** restylé cream avec CTA `ObjectiveAwareExplorerLink` + lien `/profile`.

Logique préservée : `GET /api/user/history?limit=200`, `GET /api/countries?light=1`, `historyEventTypeLabelFr`, filtres search + type, `payloadPreview`, `countryIdFromPayload`, `countryLinkFromPayload`. Seul le rendu est restylé.
