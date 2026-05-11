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
Sidebar admin nested → content area tables / forms.

---

## 5. Full Section Breakdown

### 5.1 Gate & état 403
- **Purpose :** si non admin : page **403** dédiée ou redirect `/overview` avec toast “Accès refusé” — éviter flash contenu sensible.
- **Copy :** neutre, sans détail technique fuite.

### 5.2 Shell admin (layout)
- **Purpose :** sidebar sections : **Pays**, **Agents / santé**, **Requêtes déléguées**, **Intelligence** (résumé), **Outils** (futur).
- **Header :** environnement `PROD`/`Preview` badge couleur ; user menu Clerk minimal.

### 5.3 `CountryEditor` — édition pays
- **Purpose :** formulaires guidés par sections du contrat pays (scores affichés, champs texte, JSON avancé repliable).
- **Interactions :** sauvegarde avec **diff** local (unsaved banner) ; raccourci clavier sauvegarde `Ctrl+S`.
- **Destructive :** “Réinitialiser section” avec modale confirm + saisie du nom du pays.

### 5.4 Santé agents & pipelines
- **Purpose :** vue **agents/health** : statut dernier run, latence, erreurs récentes, lien logs (futur).
- **Visual :** pastilles vert / ambre / rouge ; graph sparkline optionnel.

### 5.5 File requêtes délégation (admin API)
- **Purpose :** table triable : id, utilisateur, service, statut, date ; actions “Voir détail”, “Changer statut”.
- **Row expand :** payload JSON pretty-print dans drawer (attention PII — masquage champs sensibles).

### 5.6 Intelligence summary (aperçu)
- **Purpose :** lien ou embed vers `/api/admin/intelligence/summary` UI future — carte “couverture contrat”, “observations récentes”.
- **Empty :** placeholder “Pipeline non configuré”.

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
