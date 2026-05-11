# 00 — PROJECT FOUNDATION
## VisaFlow (Babil) — Master UX / UI Architecture Reference

### File Name
`00-project-foundation.md`

### Repository Ground Truth
This blueprint is derived from **discovery-first analysis** of the Next.js App Router in this monorepo: public marketing and intelligence surfaces under `(public)`, authenticated experiences under `(dashboard)`, Clerk-based identity (hosted flows + in-app modals), Prisma-backed country intelligence, recommendation/probability engines, delegated visa-style services, moderation, and admin tooling. Branding in UI strings reads **VisaFlow**; package name is **babil**.

### Canonical documentation root
All Stitch specs live under **`docs/google-stitch/`** (see `docs/google-stitch/README.md` and `page-registry.md`). This avoids placing a root **`pages/`** folder in the repo, which would conflict with the Next.js **Pages Router** convention.

---

## 1. Product Vision
VisaFlow is a **premium international mobility intelligence platform** oriented toward Moroccan and Francophone users evaluating destinations across **tourism, study, work, business, Schengen, investment (CBI), education tracks, and driving rights**. It fuses **quantified signals** (scores, comparisons, probability framing) with **human texture** (traveler quotes, visit reasons, PhD/teaser content) and **operational pathways** (delegated applications, personal workspace, history).

**North-star experience:** a user should feel *guided*, *literate about risk*, and *empowered to act*—whether they only browse countries or they commission help.

---

## 2. Business Goals
- **Acquisition:** SEO-friendly country depth, explorer/compare funnels, hero-led home.
- **Activation:** saved filters, recommendations, probability runs, profile completion.
- **Retention:** history, favorites (API-backed), recurring exploration loops, intelligence freshness cues.
- **Monetization / services:** delegated application catalog + apply flow; future deep reports (teasers exist in codebase patterns).
- **Trust & authority:** provenance, official sources, moderation transparency, admin-only integrity surfaces.
- **Operational scale:** agent/intelligence pipeline (Render workers) feeding data quality—UX must surface *confidence* not just numbers.

---

## 3. User Personas
| Persona | Motivation | Risk tolerance | Primary surfaces |
|--------|-------------|----------------|-------------------|
| **Curious explorer** | Dreaming / shortlisting | High curiosity, low commitment | Home, Explorer, Country hub |
| **Comparator** | Rational trade-offs | Wants side-by-side clarity | Compare, Schengen |
| **Probability seeker** | Wants “how hard for *me*” | Seeks personalization | Probability, Profile |
| **Student / trainee** | Programs, language, short courses | Information dense | Education tree |
| **Business / investor** | Mobility + CBI | Compliance-sensitive | Business, Investment |
| **Road mobility** | Permis / driving rights | Practical | Permis |
| **Delegator** | Wants human help | Willing to pay / submit data | Delegated services + Apply |
| **Community voice** | Comments, peer narrative | Social proof | Community, Country quotes |
| **Moderator / Admin** | Safety + data integrity | Low error tolerance | Moderation, Admin |

---

## 4. UX Philosophy
- **Clarity over cleverness:** scores and charts must always answer “so what?” in plain French.
- **Progressive disclosure:** teaser → detail → provenance; never bury uncertainty.
- **Cohesive premium calm:** warm paper-like surfaces, disciplined uppercase micro-labels, restrained motion.
- **Respect cognitive load:** filters sticky where needed; skeletons mirror final layout.
- **Ethical framing:** probability and scores are *signals*, not guarantees—copy and UI must reinforce disclaimers.

---

## 5. Platform Philosophy
VisaFlow behaves as a **single ecosystem**: the same visual language, navigation logic, and component DNA from marketing home through dashboard and admin. Public intelligence and private workspace are **two halves of one loop** (explore → save → revisit → act).

---

## 6. Design System Philosophy
- **Token-first:** semantic colors (`primary`, `surface`, `muted`, `line`, `text`) over raw hex in Stitch outputs.
- **Typography as hierarchy:** `font-black` display for titles, `font-semibold` for body emphasis, restrained size scale.
- **Card grammar:** `rounded-2xl`, `border-line`, `shadow-card` for elevated content; inset panels for dense data.
- **Icon discipline:** Lucide metaphors; consistent stroke; no decorative clutter.
- **Motion:** purposeful transitions on hover/focus; respect `prefers-reduced-motion`.

---

## 7. Navigation Architecture
**Public shell:** **`SiteChrome`** (**PAGE 34**) — **`SiteHeader`** (**PAGE 43**), rail **`SitePrimaryNavColumn`** (**PAGE 44**), dock objectif (**PAGE 41**) : Explorer / Comparer **objective-aware**, Schengen, moteurs, lien **Tableau de bord** si connecté.

**Authenticated shell:** `DashboardLayoutClient` + `DashboardSidebar` / `AppSidebar` — dual rail:
- **Workspace rail:** Overview, History, Probability, Pro recommendation engine, Saved recommendations, Profile, Admin (role-gated), Design system (internal).
- **Explorer rail:** Explorer, Schengen, Compare, Community, Business, Investment, Education (prefix match), Permis, Moderation.

**Country depth:** nested under `/countries/[id]` with tab-like sibling routes (quotes, doctorat, reasons).

**Services:** `/services/delegated-applications` + `/apply`.

**Cross-cutting shells (non-routes, à aligner dans Stitch sur toutes les captures) :** **PAGE 34** (`SiteChrome` / layout racine), **PAGE 35** (shell espace connecté), **PAGE 36** (suite légale & cookies — spéc anticipée), **PAGE 37** (micro-feedback `BlockFeedback` sur blocs de contenu), **PAGE 38** (layout segment pays : SEO + JSON-LD autour de **PAGE 16–19**), **PAGE 39** (Clerk Edge **`proxy.ts`** : routes protégées + request id + logs API), **PAGE 40** (toasts globaux **`AppToaster`** / **`appToast`**), **PAGE 41** (objectif mobilité global — **`AppObjectiveRoot`**, wizard, dock **`SiteObjectiveDock`**), **PAGE 42** (Sentry navigateur **`SentryClerkSync`** — G.90), **PAGE 43** (header & footer globaux **`SiteHeader`** / **`SiteFooter`**), **PAGE 44** (navigation primaire **`SitePrimaryNavColumn`** / drawer mobile), **PAGE 45** (recherche pays **`GlobalCountrySearch`**).

---

## 8. Ecosystem Architecture (Information + Action)
```text
           ┌───────────────┐
           │  Home / Hero  │
           └───────┬───────┘
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
 Explorer      Compare        Schengen
    │              │              │
    └──────┬───────┴──────┬───────┘
           ▼            ▼
    Country hub    Probability
    │   subpages     Recommendations
    │                Recommendation engine
    ▼
 Delegated services → Apply intake
           │
           ▼
   Dashboard (overview, history, profile)
           │
           ▼
 Moderation / Admin (governance)
```

---

## 9. Global User Journeys
1. **Land → explore → deep-link country** (SEO / share).
2. **Set objective preference → explorer/compare deep links update** (persistent goal).
3. **Run probability / reco → hit auth modal → persist in history** (conversion loop).
4. **Save recommendations map → return from overview** (retention).
5. **Browse education pillar → sub-track** (content tree).
6. **Discover delegated service → apply form** (service revenue path).
7. **Comment / engage → moderation visibility** (trust loop).
8. **Admin audits agents / country data** (operational).

---

## 10. Conversion Logic
- **Soft gates:** Clerk modal on gated actions (e.g. save/run) — friction only at commitment moments.
- **Primary CTAs:** `primary` filled buttons, uppercase tracking for high intent (apply, sign-in, explore).
- **Secondary CTAs:** outline / ghost on cards.
- **Trust before ask:** show intelligence provenance before asking for PII in delegated apply.

---

## 11. Retention Logic
- **History** as narrative timeline of meaningful actions.
- **Overview** as personalized “state of exploration.”
- **Email / push:** out of scope for Stitch file set—surface placeholders for future notification prefs in Profile.

---

## 12. Emotional UX Strategy
- **Reassurance:** warm surfaces, calm copy, never alarmist reds without recovery path.
- **Aspiration:** hero carousel of destinations; subtle elevation shadows.
- **Agency:** filters and engines feel *tunable*, not prescriptive.
- **Integrity:** transparency panels (provenance, field glossary) build *informed trust*.

---

## 13. Interaction Philosophy
- Hover: color shift `text-muted` → `text-primary` on links; soft shadow lift on cards.
- Focus: visible ring consistent with design tokens (Stitch: 2px ring, offset 2px).
- Loading: skeletons match grid density; never spinners on full page without context.
- Errors: human French copy + single recovery CTA.

---

## 14. Accessibility Philosophy
WCAG-minded defaults: semantic headings, keyboardable modals, skip patterns for dense tables, sufficient contrast on `text` / `muted`, chart alternatives (textual summary blocks).

---

## 15. Responsive Philosophy
Mobile-first for explorer filters and country cards; **sticky decision bars** on compare flows (reference `CompareStickyBar` pattern); tables become horizontal scroll with clear affordance.

---

## 16. Motion Philosophy
Sub-200ms micro-interactions; page-level transitions subtle; parallax only on hero if performance allows; always test reduced-motion variant.

---

## 17. Platform Consistency Rules
- One **VisaFlow** wordmark treatment in nav.
- One **card** language for country, education, and service tiles.
- One **filter bar DNA** across Explorer and related engines.
- **Never** ship a page without: title hierarchy, muted supporting line, primary action or clear “read-only” intent.

---

## 18. Scalability Philosophy
- New country dimensions = new **sibling route** or collapsible section inside hub—preserve URL stability.
- New services = duplicate **catalog → apply** template.
- New engines = mirror **Probability / Recommendation engine** layout skeleton.

---

## 19. Platform-Wide UX Strategy (Stitch Brief)
Treat VisaFlow as a **single premium travel-intelligence SaaS**: disciplined grids, generous whitespace, tactile paper warmth, lucid French microcopy, evidence-linked data. Every new screen must inherit the **same corner radii, shadow depth, and label casing** as Home and Overview.

---

# MASTER UX AUDIT CHECKLIST

## Usability
- [ ] Every primary task reachable in ≤3 clicks from home or overview.
- [ ] Filters expose current state; reset is obvious.
- [ ] Long forms show progress / section anchors (delegated apply).
- [ ] Compare mode shows “who wins” without hiding nuance.

## Accessibility
- [ ] Heading order strict per page (single `h1`).
- [ ] All interactive icons have `aria-label` or visible text.
- [ ] Tables have captions or surrounding explanatory text.
- [ ] Color is never the only differentiator for status.

## Responsiveness
- [ ] No horizontal overflow on 320px except intentional table scroll regions.
- [ ] Sticky elements have safe-area padding on iOS.
- [ ] Touch targets ≥44px on mobile CTAs.

## Conversion
- [ ] Auth modal appears only after intent, with value recap.
- [ ] Delegated apply repeats trust markers (SLA, privacy, next steps).

## Emotional UX
- [ ] Tone stays supportive, not judgmental, on low scores.
- [ ] Empty states educate, not blame.

## Consistency
- [ ] Sidebar labels match page titles within 1 word drift max.
- [ ] Same button hierarchy across public and dashboard.

## Onboarding
- [ ] First visit to overview explains value of history + profile.
- [ ] Explorer objective preference discoverable within 10s.

## Retention
- [ ] History entries readable without opening detail.
- [ ] “Return to last country” shortcut considered on overview.

## Trust
- [ ] Provenance / sources visible on any numeric claim page.
- [ ] Moderation status understandable to commenters.

## Motion
- [ ] `prefers-reduced-motion` removes non-essential transitions.

## Performance Perception
- [ ] Skeletons mirror final layout on all slow routes.
- [ ] Above-the-fold hero does not block LCP with heavy carousels.

---

# DESIGN SYSTEM GUIDELINES

## Typography
- Display: uppercase micro-labels (`text-[10px]`–`text-xs`, `tracking-widest`, `font-black`) for section kicker.
- Titles: `text-2xl`–`text-3xl`, `font-black`, tight tracking on product screens.
- Body: `text-sm`–`text-base`, `font-medium` / `font-semibold` hierarchy.
- Data: tabular numerals where available; mono for codes / fieldPaths.

## Spacing
- Page padding: `px-4 sm:px-6 lg:px-8`.
- Vertical rhythm: multiples of 4; large sections `py-12`–`py-16`.

## Breakpoints
- Tailwind defaults (`sm`, `md`, `lg`, `xl`); collapse sidebars at `md`.

## Grid
- Explorer / country grids: responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` baseline.

## Buttons
- Primary: `rounded-xl bg-primary text-white font-black uppercase tracking-widest`.
- Secondary: `rounded-xl border border-line bg-surface`.
- Destructive (rare): only in moderation/admin with confirmation pattern.

## Cards
- `rounded-2xl border border-line bg-surface shadow-card`.

## Forms
- Labels always visible; errors inline with `role="alert"`; help text `text-muted`.

## Navigation
- Public top nav sticky with blur (`backdrop-blur`).
- Dashboard: persistent sidebar + mobile drawer pattern (Stitch: design drawer affordance).

## Modals
- Clerk + custom dialogs: focus trap, ESC close, scroll lock.

## Motion
- Hover: `transition-colors`; cards optional `hover:shadow` lift ≤4px equivalent.

## Interaction Rules
- Loading buttons disabled with spinner replacing label only for short actions.
- Infinite scroll (if any): preserve footer access—prefer pagination for SEO pages.

## Accessibility Standards
- AA contrast for body text; AAA aspirational for large headings where possible.
- Keyboard order follows visual order on compare tables.

## Component Consistency
- Country tiles share aspect, flag treatment, score chip placement.
- Education pillar cards share icon + title + 2-line description pattern.

## Design Tokens Philosophy
Semantic naming only in Stitch outputs (`primary`, `primary-soft`, `primary-hover`, `surface`, `inset`, `line`, `text`, `muted`, `danger`).

## Visual Rhythm Philosophy
Alternate **dense data blocks** with **breathing narrative strips** to avoid wall-of-metrics fatigue.

---

# FUTURE ITERATION NOTES

## A/B Testing
- Hero CTA: “Explorer” vs “Comparer en 30s”.
- Probability results: narrative-first vs chart-first layout.

## UX Experimentation
- Embeddable “mini compare” widget for partners.
- Country hub tab component vs single long page.

## Onboarding Optimization
- Post-sign-up checklist on overview (profile completeness, first compare).

## Retention Optimization
- Weekly digest email of score changes for favorited countries (placeholder in Profile settings future section).

## Conversion Optimization
- Delegated apply: inline estimator for response time / price bracket.

## Trust Optimization
- “Last verified” timestamps on official sources cards.

## Personalization
- Auto-suggest countries from probability inputs (explicit consent).

## AI Integration
- Optional generative “trip intent → filter preset” with clear data minimization copy.

## Gamification (lightweight)
- Badges for “compared 5 countries” — use tastefully; never childish.

## Mobile Optimization
- Bottom sheet filters on explorer; thumb-zone primary FAB for “compare selection”.

## Performance Optimization
- Image policy for flags / hero; LQIP placeholders; reduce carousel slide count on mobile.

---

### Stitch Global Atmosphere Brief
Imagine a **private bank travel research lounge** digitized: warm paper, ink-like type, glassy sticky nav, maps that feel *crafted* not stock. VisaFlow should feel **serious enough for visa outcomes** yet **approachable for first-time mobility planners**. Every pixel supports **clarity, dignity, and informed choice**.
