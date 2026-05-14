# PAGE 25 — “SCALE”
## Modération commentaires — `/moderation`

### File Name
`25-scale-comment-moderation.md`

### Page Type
Logged-In (rôle modérateur / policy interne)

### Related User Journeys
- Revue file commentaires signalés
- Actions approve / reject / hide

### Connected Pages
- **Précédent :** sidebar explorer
- **Suivant :** pays source du commentaire (deep link)

---

## 1. Page Purpose
Fournir une **console de gouvernance sociale** (implémentée inline dans `app/(dashboard)/moderation/page.tsx` : `fetch('/api/comments')`, actions `PATCH` / `DELETE`) pour protéger la confiance communauté. Résout *“Comment je traite les contenus risqués rapidement ?”*

---

## 2. Primary User Actions
- **Primaires :** lire commentaire + contexte ; approuver / rejeter / masquer.
- **Secondaires :** bannir utilisateur (si policy) ; ajouter note interne.

---

## 3. UX Goals
- **Neutralité** procédurale (éviter biais visuel accusateur).
- **Rapidité** décision (split view).

---

## 4. Layout Architecture
**Implémentation :** en-tête “Modération” + bouton **Actualiser** → section **En attente** (`status === 'PENDING'`) en **grille de cartes** pleine largeur → section **Historique récent** (`status !== 'PENDING'`) : **liste mobile** + **table desktop** (`md:block`).

---

## 5. Full Section Breakdown

### 5.1 Garde accès
- **403 / erreur :** écran centré `ShieldAlert` + message “Accès réservé aux administrateurs” ou erreur générique.
- **Loading :** `DashboardPageSkeleton variant="table"`.

### 5.2 Carte commentaire (file d’attente)
- **Métadonnées :** avatar icône utilisateur, nom ou “Utilisateur anonyme”, email, pays (`Globe`).
- **Corps :** citation entre guillemets dans encadré beige `#f8f2e8`.
- **Actions :** **Approuver** (`APPROVED`, vert) / **Refuser** (`REJECTED`, rouge léger) — boutons pleine largeur mobile, flex row desktop.

### 5.3 File vide
- **Purpose :** zone dashed “Aucun commentaire en attente.”

### 5.4 Historique récent (10 derniers non-pending)
- **Mobile :** `ul` cartes avec extrait `line-clamp-4` + **Supprimer** (`DELETE`).
- **Desktop :** table colonnes Utilisateur / Pays / Contenu / Statut / action icône poubelle.

### 5.5 Optimistic & erreurs action
- **Implémentation :** mise à jour liste locale sur `res.ok` ; `alert()` sur erreur réseau (opportunité produit : remplacer par toast).

### 5.6 Journey
- **Vers pays source :** futur deep link ; aujourd’hui pays affiché texte seul.

---

## 6. UI Design Direction
**Console** sobre : fond `inset`, texte dense autorisé ici seulement.

---

## 7. Interaction Design
Shortcuts clavier (j/k navigation) option premium modérateur.

---

## 8. Responsive UX
Mobile : un item plein écran ; swipe actions (prudent) ou menu overflow.

---

## 9. Accessibility
Actions avec confirmation modale focus trap.

---

## 10. Edge Cases & States
File vide : “Rien en attente” ; erreur API : retry ; double modération : optimistic lock message.

---

## 11. User Journey Connections
Retour community ; audit admin.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Split view **tribunal minimaliste** : gauche liste stricte monospace IDs légers ; droite carte commentaire sur fond neutre avec **bordure signal couleur** selon gravité (amber/red).

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
Fichier repo : `docs/google-stitch/assets/page-25-scale-stitch-reference.png`

**Architecture livrée (Stitch v1 — Scale tribunal split view)** : shell **cream `#FAF7EE`**. Refactor en **3 zones logiques** : 
- **Queue list (colonne `lg:w-[300px]`)** : pill mono `File d'attente`, badge dot rouge `{N} En attente` + bouton `RefreshCw` icon-only ; chaque entrée pending est une carte cream cliquable (ID mono `ID-{id}`, `time-ago` court FR `Il y a 2m / 15m / 1h / 3j / 12 mars`, nom + pays). Item sélectionné : **left border rouge 3px**, fond blanc, badge actif.
- **Détail (colonne flex-1)** : titre serif `Modération` + sous-titre `Examen des signalements du registre de risques.` ; carte blanche avec **border-top rouge 4px** : entête avatar `User` + nom + email + chip pays (`Globe`) à droite ; eyebrow rouge `Contenu signalé — en attente` ; bloc cream `quote` avec glyph `Quote` et texte du commentaire ; deux boutons grid 2-col : outline rouge `Refuser` (`XCircle`) + navy filled `Approuver` (`CheckCircle2`). Sans pending : empty state cream centré avec `ShieldCheck`.
- **Registre / Historique récent** sous le panneau détail : eyebrow + serif `Historique récent` ; table cream blanche avec colonnes `Utilisateur / Pays / Extrait / Statut / Action`. Statut affiché en chip dot (`emerald` = `APPROUVÉ`, `rose` = `REFUSÉ`). Action `Trash2` rouge supprime via `DELETE /api/comments/:id`.

Logique préservée : `GET /api/comments`, `PATCH /api/comments/:id { status }`, `DELETE /api/comments/:id`, mise à jour optimiste de la liste locale ; garde accès 403 (`ShieldAlert`) ; `DashboardPageSkeleton variant="table"` pendant fetch. Aucun changement d'API ni de modèle de données.

**A11y / UX upgrades** : `aria-current` sur ligne sélectionnée, `<time dateTime>` pour les horodatages, bouton Refresh `aria-label`, et déduction automatique du sélectionné = premier `PENDING` après chaque `fetchComments`.
