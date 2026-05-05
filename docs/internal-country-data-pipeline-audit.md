# Internal report — Country data pipeline (runner ↔ DB ↔ UI)

**Date:** 2026-05-05  
**Scope:** `Country`, `full_data`, public APIs, explorer / education / country pages.

---

## 1. Database population status

### Tables tied to country / generated content

| Table | Role |
|--------|------|
| `Country` | Primary entity: scalar scores, `full_data` JSON (seed + runner). |
| `Comment` | User comments (moderation); surfaced on country detail when `APPROVED`. |
| `CountryInsight` | **Not used by the Next.js app** (only referenced in offline Render sync script). |
| `FavoriteCountry`, `UserHistoryEvent` | User metadata, not country generation. |

### Runner behaviour (`agents/runner.ts`)

- Upserts **`Country`** by **name**.
- Builds `full_data` from **prior JSON** merged with Wikipedia summary, World Bank GDP, traveller quotes (`data/traveler-quotes/*.json`), plus `_agent` completeness metadata.
- Previously **always wrote scalar scores `5.5` and `appointment_difficulty: 'Medium'`**, overwriting seeded values.  
  **Fix:** Runner now **preserves existing Prisma scalar columns** across refinement passes (`mergeCountryData(..., preserveScalar)` + initial snapshot from DB).

### Static fallback (`data/countries.json`)

- Rich baseline (~hundreds of fields per country templates): friction, visas, education, etc.
- **Was the primary API source** until this audit (see fixes below).

---

## 2. Data quality assessment

**Observed structural risks (pre-fix):**

- **Public API ignored Postgres** whenever `countries.json` loaded — runner updates invisible on list/detail unless IDs accidentally matched stale JSON-only paths.
- **Education hub bug:** Tabs read `education_mobility[languages|technical|short]` but real keys are `language_study`, `technical_training`, `short_courses` → **always fell back** to placeholder copy.
- **Runner vs seed:** Repeated runs could flatten visa scores to `5.5` / `Medium` (`mergeCountryData`).
- **`CountryInsight`:** Stored in schema/sync tooling but **no UI/API binding**.

**Meaningfulness:** Seed JSON mixes real-looking structure with explicit baselines (“Baseline auto-générée”, placeholder appointment rows). Runner adds **live** Wikipedia + GDP + `_agent`; quotes are **real only** when verified JSON satisfies 5+/3neutral/2- distribution.

**How to audit locally:**

```bash
npx tsx scripts/audit-country-data-pipeline.ts
```

(Relies on `DATABASE_URL`; prints row counts and `full_data._agent` share.)

---

## 3. Frontend rendering status

| Surface | Source | Notes |
|---------|--------|--------|
| `/api/countries` | **Merged: Prisma ∪ static JSON by name** | DB wins per country; unmatched JSON rows preserved; DB-only extras appended. |
| `/api/countries/[id]` | **Prisma first**, then JSON by `id` | Detail pages reflect runner output when row exists. |
| Explorer / Compare / Recommend APIs | Consume `/api/countries` + Prisma in some routes | Benefit from merged list / `full_data`. |
| Home Top Countries grid | **`resolveHomeShowcaseCountries()`** | Same merged list + **`enrichCountryApiRecord`** as Explorer. |
| Home hero carousel | **`buildHomeHeroSlides()`** + **`HeroWorldCarousel` `slides` prop** | Curated `hero-slides.json` plus **extra slides** from **`full_data.travel_reasons`** for the same five showcase countries (deduped by image URL). |
| Testimonials section | Static copy | Explicit marketing content. |
| Education hub | **`/api/countries`** → `full_data.education_mobility` | **Tab keys fixed** to match JSON. |
| Country detail `/countries/[id]` | **`/api/countries/[id]`** | Uses scalar columns + `full_data` for sections. |
| Country detail `<head>` metadata | **`countries/[id]/layout.tsx`** | Same ID resolution order as detail API (Prisma then static JSON). |

---

## 4. Issues fixed (this pass)

1. **`GET /api/countries`** — Replaced “static JSON only” with **`buildMergedCountriesList()`** (`lib/countries-prisma-merge.ts`): Prisma row wins on scalars and live `full_data`; static row fills coverage; DB-only countries appended.
2. **`mergeDisplayedFullData()`** — When the DB `full_data` omits large blocks (typical after runner-only snapshots), **rich JSON subtrees** are retained for: `education_mobility`, `visa_system`, `friction_analysis`, `appointment_audit`, `street_food`, `driving_license`, `morocco_insights`.
3. **`GET /api/countries/[id]`** — **Prisma first**; then merge static JSON by `id` into `full_data` for the same weak-block fill; JSON-only fallback if no row.
4. **`POST /api/recommendation`** and **`POST /api/probability`** — Use **`buildMergedCountriesList()`** (then `loadFallbackCountries()` if empty) so engines see the same merged payload as the explorer.
5. **`agents/runner.ts`** — Preserve existing Prisma scalar columns across `mergeCountryData` passes (no more systematic overwrite with `5.5` / `Medium`).
6. **`app/(public)/education/page.tsx`** — Tab keys aligned with JSON: **`language_study` / `technical_training` / `short_courses`** (was incorrectly `languages` / `technical` / `short`).
7. **`scripts/audit-country-data-pipeline.ts`** — Runnable DB + file stats.
8. **Homepage Top Countries grid** — **`lib/home-showcase-countries.ts`** + **`resolveHomeShowcaseCountries()`** replaces hardcoded `TOP_COUNTRIES_BASE` with merged DB/JSON + **`enrichCountryApiRecord`** (same signals as Explorer).
9. **Hero carousel** — **`lib/home-hero-slides.ts`** / **`buildHomeHeroSlides()`**: keeps validated `data/hero-slides.json`, appends one merged **`travel_reasons[0]`** slide per homepage showcase when it has an `https` `imageUrl`, with Unsplash attribution when applicable.
10. **Country layout `generateMetadata`** — Aligns with `/api/countries/[id]`: resolves **fallback JSON by `id`** when no Prisma row, so OG/title matches pages that exist only on the static dataset.
11. **`GET /api/countries` fallback chain** — If merge returns empty, tries **`loadFallbackCountries()`** before raw Prisma for a stable `LegacyCountryRecord` shape.

### Sample audit run (this workspace, 2026-05-05)

- `data/countries.json`: **255** countries  
- Prisma `Country`: **64** rows (partial deploy vs full seed)  
- `full_data._agent` on all 64 → runner has touched each row  
- **In raw DB JSON:** `education_mobility` **0%** — confirms runner snapshots were thin; **API merge** restores static blocks for API consumers and UI.

---

## 5. Remaining gaps (not changed — by design or out of scope)

| Gap | Detail |
|-----|--------|
| `CountryInsight` | **No product surface**; safe to ignore or wire later. |
| Runner vs contract | Runner still does **not** scrape all `COUNTRY_INTELLIGENCE_CONTRACT_V2` fields; completeness is tracked in `_agent` but many fields stay seed-only until other pipelines exist. |
| Traveller quotes | **Unsplash** placeholders in generated `travel_reasons`; verified quotes only with valid JSON files. |
| Admin patch API | Already supports `phd_studies` patch; broader admin editing not part of this fix. |

---

## 6. Conclusion

- The runner **does** persist rich `full_data` (plus `_agent`) into **`Country`**, but **before this fix the public API preferred static JSON**, so the site often did **not** reflect DB updates.
- The education page **did not** read the correct `education_mobility` keys; it now does.
- After these changes, **DB-backed country rows take precedence** in the API merge and on detail fetch, aligning generation with user-visible content wherever a database row exists.
