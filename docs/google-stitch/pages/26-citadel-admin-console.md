# PAGE 26 — “CITADEL”
## Administration — `/admin`

### File Name
`26-citadel-admin-console.md`

### Page Type
Admin (Clerk / custom admin gate)

### Related User Journeys
- Édition pays (`CountryEditor`)
- Santé agents (`agents/health` patterns UI)
- Requêtes délégation review

### Connected Pages
- **Précédent :** `/overview`
- **Suivant :** routes admin API-driven (édition pays), dashboards intelligence

---

## 1. Page Purpose
Concentrer les **outils de super-utilisateur** : données pays, pipelines, monitoring. Résout *“Comment je maintiens la qualité & la sécurité ?”*

---

## 2. Primary User Actions
- **Primaires :** éditer entité pays ; lancer actions maintenance (futur UI).
- **Secondaires :** consulter logs / health agents.

---

## 3. UX Goals
- **Efficacité** > beauté (tout en restant cohérent DS).
- **Traçabilité** actions destructives.

---

## 4. Layout Architecture
**Implémentation (`app/(dashboard)/admin/page.tsx`) :** page client unique — **`layout.tsx`** admin ne fait qu’envelopper `children` (pas de sidebar dédiée). **Navigation par onglets horizontaux** : `comments` | `countries` | `assist` | `intelligence` (`useState<Tab>`).

---

## 5. Full Section Breakdown

### 5.1 Gate & état 403
- **Purpose :** si non admin : page **403** dédiée ou redirect `/overview` avec toast “Accès refusé” — éviter flash contenu sensible.
- **Copy :** neutre, sans détail technique fuite.

### 5.2 Onglets principaux (code actuel)
- **Commentaires (`comments`) :** file modération / pending (types `PendingComment`, actions API comments).
- **Pays (`countries`) :** **`CountryEditor`** + modèle `CountryEditorModel` — édition scores / métadonnées.
- **Assist (`assist`) :** file demandes déléguées (`AssistQueueRow`, statuts `DELEGATED_REQUEST_STATUSES`, prix `formatPriceMad`).
- **Intelligence (`intelligence`) :** résumé pipeline (`IntelligenceSummary` : sources, observations, runs, alertes `runAlerts`, queue jobs).

### 5.3 `CountryEditor` — édition pays
- **Purpose :** formulaires guidés par sections du contrat pays (scores affichés, champs texte, JSON avancé repliable).
- **Interactions :** sauvegarde avec **diff** local (unsaved banner) ; raccourci clavier sauvegarde `Ctrl+S`.
- **Destructive :** “Réinitialiser section” avec modale confirm + saisie du nom du pays.

### 5.4 Santé agents & pipelines (hors onglet dédié)
- **Purpose :** l’UI **health** agents peut vivre sous l’onglet intelligence ou route API séparée — vérifier évolutions ; pastilles vert / ambre / rouge si exposées.

### 5.5 File requêtes délégation (onglet assist)
- **Purpose :** lignes queue + statuts ; cohérence avec **PAGE 20–21** côté utilisateur.

### 5.6 Intelligence summary (onglet intelligence)
- **Purpose :** données `IntelligenceSummary` (sources, observations, runs, alertes stale/failed, stats queue).
- **Empty :** états chargement / erreur fetch dans le composant.

### 5.7 Journal d’audit (futur)
- **Purpose :** liste des actions admin avec actor, timestamp, entity — conformité interne.

### 5.8 Responsive & mobile
- **Purpose :** **lecture seule** sur mobile avec bandeau “Utilisez un écran large pour éditer” — évite erreurs de saisie.

---

## 6. UI Design Direction
**Dense SaaS admin** avec tokens existants ; pas d’effets décoratifs.

---

## 7. Interaction Design
Confirmations modales pour publish ; diff preview (futur).

---

## 8. Responsive UX
Admin prioritairement desktop ; mobile : lecture seule + warning.

---

## 9. Accessibility
Tables navigables ; formulaires labels explicites.

---

## 10. Edge Cases & States
403 utilisateur non admin ; conflit édition ; sauvegarde partielle.

---

## 11. User Journey Connections
Vers pages publiques preview changement (futur).

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Créer **top bar admin** avec badge environnement (PROD). Utiliser **tabs secondaires** pour sous-domaines (Pays, Agents, Requêtes). Couleur `danger` réservée actions irréversibles.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 26]
