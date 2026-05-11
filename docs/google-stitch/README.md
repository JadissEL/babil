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
    01-….md … 33-….md       ← one screen / template per file, stable numbering
```

## Workflow

1. Read `project-foundation/00-project-foundation.md` for global rules.
2. Open `page-registry.md` to jump to the correct **PAGE XX** file.
3. In Stitch, attach **PAGE XX** screenshot to the placeholder at the bottom of that page file.

## Maintenance

- **Do not renumber** existing pages once screenshots reference them.
- Add new surfaces only as **34+** (or use a sub-series `34a-…` if you must insert — prefer append).
