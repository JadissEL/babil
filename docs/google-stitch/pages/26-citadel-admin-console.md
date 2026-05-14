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
Fichier repo : `docs/google-stitch/assets/page-26-citadel-stitch-reference.png`

**Architecture livrée (Stitch v1 — Citadel Admin Console, refactor chirurgical)** : tout le contenu fonctionnel (commentaires PENDING, `CountryEditor` édition pays, file Assist + payload masqué + `DELEGATED_REQUEST_STATUSES`, `IntelligenceSummary` + `runAlerts` + breakdowns sources/pays/fieldPath, `agentHealth` + `taskSummary` + visual coverage + auto-refresh) **est intégralement préservé**. Seuls le shell, le header, la barre d'onglets et le bandeau "Pipeline Health" du tab Intelligence sont restylés.

- **Shell** cream `#FAF7EE`.
- **Bandeau top mobile-only** (`md:hidden`) gris pâle `bg-[#0D1B3E]/05` : `Utilisez un écran large pour une édition optimale` mono uppercase tracking-`0.26em`.
- **Header Citadel** : serif `VisaFlow` + pill rose `PROD` (env badge `process.env.NODE_ENV === 'production'`, sinon `DEV`) + séparateur + serif `Citadel Admin Console` + sous-titre `Modération rapide et édition des scores pays (MVP).` Liens secondaires conservés (`/moderation`).
- **Tab bar underline** : 4 onglets `Modération`, `Pays (Editor)`, `Assist ({n})`, `Intelligence` ; actif = underline navy 2px + texte navy ; inactif = `#0D1B3E/55`. Compteur Assist préservé (`assistRows.length`).
- **Pipeline Health strip** au sommet de l'onglet `intelligence` : eyebrow mono + 4 tuiles blanches `Sources / Observations / Runs (% succ) / Jobs queued` calculées sur `intelligence.sourceCount`, `intelligence.observationCount`, taux de réussite sur `intelligence.recentRuns`, `intelligence.pipelineJobQueue.pending`.
- **System Agents Status compact card** (sous Pipeline Health) : eyebrow + lien `View logs` discret + table mini (Agent ID / Target / Status / Last sync) dérivée de `agentHealth` (les 3-5 premières tâches `failedTasks` / `queuedPreview` reformulées en lignes agent avec statut `HEALTHY / DELAYED / FAILED`).
- Onglets `comments`, `countries`, `assist` et le **reste** du tab `intelligence` (alerts critique, breakdowns par source / pays / fieldPath, runs récents, dernier run) **restent inchangés** — uniquement leur container externe est cream.

Logique préservée intacte : `GET /api/comments?status=PENDING`, `PATCH /api/comments/:id`, `GET/PATCH /api/admin/delegated-application-requests`, `GET /api/admin/intelligence/summary`, `GET /api/admin/agents/health` (auto-refresh 10s), `loadAssistDetail(id, full)` payload masqué B.36, `formatPriceMad`, `DashboardPageSkeleton`. Garde accès 403 `ShieldAlert` restylé cream.
