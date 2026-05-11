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
`CountryEditor` : sections JSON/schema guided ; toggles sources.

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
