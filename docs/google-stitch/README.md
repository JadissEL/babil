# Google Stitch — UI/UX architecture (VisaFlow / Babil)

This folder holds the **modular UX architecture** used to brief [Google Stitch](https://stitch.withgoogle.com/) (or any design agent): foundation strategy plus **one Markdown file per product surface**.

## Why `docs/google-stitch/` and not repo-root `pages/`?

Next.js reserves a root **`pages/`** directory for the **Pages Router**. Keeping dozens of `.md` files there risks build or routing ambiguity. All Stitch specs therefore live under **`docs/google-stitch/pages/`**.

## Structure

```text
docs/google-stitch/
  README.md                 ← you are here
  page-registry.md          ← route → PAGE XX → filename
  project-foundation/
    00-project-foundation.md   ← master reference, checklists, design system
  pages/
    01-….md … 45-….md       ← … + nav primaire rail (44) + recherche pays globale (45)
```

## Workflow

1. Read `project-foundation/00-project-foundation.md` for global rules.
2. Open `page-registry.md` to jump to the correct **PAGE XX** file.
3. In Stitch, attach **PAGE XX** screenshot to the placeholder at the bottom of that page file.

## Maintenance

- **Do not renumber** existing pages once screenshots reference them.
- **PAGE 34–35** documentent le **chrome global** et le **shell dashboard** (pas des URLs publiques) — utiles pour maquettes Stitch cohérentes.
- **PAGE 36** anticipe **mentions / confidentialité / cookies** (non routé encore) — lier depuis `SiteFooter` quand les pages existent.
- **PAGE 37** : pattern **`BlockFeedback`** (pouces) — cohérence sur fiches pays et DS.
- **PAGE 38** : layout segment **`/countries/[id]`** — `generateMetadata`, canonical, Open Graph, **JSON-LD** (complète **PAGE 16** côté SEO).
- **PAGE 39** : **`proxy.ts`** — `clerkMiddleware`, liste routes protégées, request id, logs API JSON (complète **PAGE 33** côté politique d’accès).
- **PAGE 40** : **`AppToaster`** + **`appToast`** — pile fixe bas-droite, variants, durée auto, intégration dock (**PAGE 34**).
- **PAGE 41** : **`AppObjectiveRoot`** — provider objectif, **`FirstVisitObjectiveWizard`**, **`SiteObjectiveDock`** / **`DockObjectivePicker`**, variable **`--vf-objective-dock-height`**.
- **PAGE 42** : **`SentryClerkSync`** — contexte Sentry pseudonyme (`sentryAnonymizedUserKey`), tags `auth`, noop si pas de DSN.
- **PAGE 43** : **`SiteHeader`** + **`SiteFooter`** — marque, menu, `GlobalCountrySearch`, auth Clerk, PayPal don, padding dock footer.
- **PAGE 44** : **`SitePrimaryNavColumn`** — rail `lg` + drawer mobile, liens objectif-aware, `useSitePrimaryNavState`.
- **PAGE 45** : **`GlobalCountrySearch`** — palette pays, `⌘K` / `Ctrl+K`, `/api/countries?light=1`, navigation **PAGE 16**.
- Add further surfaces only as **46+** (prefer append).
