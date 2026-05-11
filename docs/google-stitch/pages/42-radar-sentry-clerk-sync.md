# PAGE 42 — “RADAR”
## Observabilité client — `SentryClerkSync` (contexte utilisateur pseudonyme + tag auth)

### File Name
`42-radar-sentry-clerk-sync.md`

### Page Type
System / Transversal (client, **aucune UI** — `return null`)

### Related User Journeys
- Diagnostiquer erreurs front en production sans exposer PII dans Sentry
- Comparer volume incidents `auth=anonymous` vs `signed_in`

### Connected Pages
- **Montage :** `app/layout.tsx` — **`SentryClerkSync`** rendu dans `<body>` **avant** **`AppObjectiveRoot`** (**PAGE 34**).
- **Identité :** **PAGE 33** (Clerk `useAuth`) ; **PAGE 39** (Edge `proxy.ts` — autre couche, pas ce composant).
- **Erreurs UI :** **PAGE 29–31** (`captureException` dans error boundaries) — **RADAR** enrichit le **contexte** avant/après navigation, pas le flux d’erreur lui-même.

---

## 1. Page Purpose
Documenter **G.90** côté navigateur : après chargement Clerk, attacher à `@sentry/nextjs` un **`user.id` dérivé** (jamais l’identifiant Clerk brut) et un **tag `auth`** pour segmenter les issues — sans aucun rendu visuel.

---

## 2. Primary User Actions
- **Aucune** pour l’utilisateur final.

---

## 3. UX Goals
- **Zéro layout shift** : composant `null`.
- **Confidentialité** : pas d’email, nom, ou `userId` Clerk en clair dans Sentry — seulement préfixe SHA-256 stable (`lib/sentry-anon-user-id.ts`).

---

## 4. Layout Architecture
**Fichier :** `components/SentryClerkSync.tsx`.

**Prérequis runtime :** `process.env.NEXT_PUBLIC_SENTRY_DSN` défini — sinon **early return** : aucun appel Sentry depuis cet effet.

**Séquence :** `useAuth()` → `useEffect` dépend de `[isLoaded, isSignedIn, userId]` → selon état :

| Condition | `Sentry.setUser` | `Sentry.setTag('auth', …)` |
|-----------|------------------|----------------------------|
| DSN absent | *(skip)* | — |
| `!isLoaded` | *(return)* | — |
| `isSignedIn && userId` (async OK) | `{ id: key }` avec `key = await sentryAnonymizedUserKey(userId)` | `signed_in` |
| Idem mais `sentryAnonymizedUserKey` throw / annulé | `null` | `signed_in_unlabeled` |
| Non connecté ou pas d’id | `null` | `anonymous` |

**Cleanup :** flag `cancelled` sur démontage pour éviter setState/SDK après unmount.

---

## 5. Full Section Breakdown

### 5.1 `sentryAnonymizedUserKey(rawUserId)`
- **Algorithme :** `SHA-256` sur l’id brut encodé en UTF-8 → chaîne hexadécimale 64 caractères → **`u_` + `hex.slice(0, 16)`** (16 premiers caractères hex, stable pour groupement d’issues).

### 5.2 Init SDK
- **`sentry.client.config.ts`** : `Sentry.init` si `NEXT_PUBLIC_SENTRY_DSN` — `environment`, `tracesSampleRate` (défaut **0.1** depuis env). Stitch n’a pas à dupliquer ces knobs ; les mentionner pour **ops / design QA** “Sentry actif en preview ?”.

### 5.3 Côté serveur / Edge
- **`sentry.server.config.ts`**, **`sentry.edge.config.ts`** : hors scope visuel Stitch — noter que **RADAR** ne couvre que le **browser SDK** + lien Clerk.

---

## 6. UI Design Direction
Aucun — ne pas placer de mock “badge Sentry” dans les maquettes utilisateur.

---

## 7. Interaction Design
N/A.

---

## 8. Responsive UX
N/A.

---

## 9. Accessibility
N/A (pas de DOM).

---

## 10. Edge Cases & States
- **Clerk lent à hydrater :** tant que `!isLoaded`, pas de tag forcé depuis cet effet (évite flash `anonymous` prématuré ? Actually effect returns early on !isLoaded - so no Sentry update until loaded - good doc).
- **DSN manquant en local :** composant noop — erreurs **PAGE 29** peuvent quand même tenter `captureException` si autre chemin initialise Sentry ; comportement suivre config Sentry officielle.

---

## 11. User Journey Connections
Améliore triage Sentry quand une erreur survient sur **PAGE 16** (client lourd) vs parcours anonyme **PAGE 02**.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
**Exclure** de toute planche utilisateur. Option : **planche technique interne** “Observabilité” listant **RADAR** + **PAGE 39** request id + **PAGE 29–31** capture.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 42] *(vide — document technique ; capturer plutôt dashboard Sentry filtré par tag `auth` si besoin marketing interne)*
