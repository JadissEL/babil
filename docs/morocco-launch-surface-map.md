# Morocco-first launch — surface × data map

Inventory of **Morocco-corridor** user-facing routes and the primary `full_data` / Prisma paths that feed them.  
Classification: **fact** (legal/operational, needs primary source), **context** (encyclopedic/statistical), **model** (internal score).

## Country hub

| Surface | Path | Classification | Morocco reader question |
|--------|------|----------------|-------------------------|
| Fiche pays (client) | [`app/(public)/countries/[id]/page.tsx`](../../app/(public)/countries/[id]/page.tsx) | mixed | « Qu’est-ce qui change pour moi au Maroc ? » |
| Morocco disclaimer + pack | same + [`MoroccoResearchPackSection`](../../components/country/MoroccoResearchPackSection.tsx) | orientation + sourced excerpts | « Quels piliers vér avant de postuler ? » |
| Intelligence Hub header | same | **model** | « Score global indicatif » |
| Réalité terrain / barres | `morocco_insights.*`, `brutal_reality_score`, `acceptance_rate_morocco`, `friction_score`, `confidence_score` | mixed (acceptance = **fact** or honest unknown) | « Quel niveau de risque opérationnel ? » |
| Appointment audit | `full_data.appointment_audit.*` | **fact** / unknown | « Quel guichet, quels blocages ? » |
| Driving | `full_data.driving_rights`, `driving_license` | **fact** | « Mon permis marocain est-il reconnu ? » |
| PhD teaser | `full_data.phd_studies` | **context** / structured | « Doctorat possible ? » |
| Visit reasons / quotes | `travel_reasons`, `traveler_quotes`, `traveler_quotes_meta` | **context** / UGC | « Ambiance et retours (non légaux) » |
| Official sources card | `lib/official-sources` + manifest | **fact** links | « Où cliquer en premier ? » |
| OECD-style stats | `economy.*`, `health.*`, `work.*`, `demographics.*` | **context** (API) | « Contexte macro » |
| PIB absent (WB) | `economy.gdp_wb_series_unavailable`, `economy.gdp_coverage_note_fr` | **honest gap** | « Pourquoi pas de PIB affiché ? » |

## Explorer & compare

| Surface | Data |
|---------|------|
| [`app/(public)/explorer/page.tsx`](../../app/(public)/explorer/page.tsx) | Prisma scalars + `enrich-country-api` / merged `full_data` for filters |
| Compare flows | Country rows + `full_data` friction / visa blocks |

## Education & business hubs

| Surface | Data |
|---------|------|
| Education pages | `full_data.education_mobility.*` + relational [`CountryEducationProgram`](../../prisma/schema.prisma) (synced after agent upsert) |
| Business / street food | `full_data.street_food`, `visa_system.business` |

## Agents & gate

- Merge & scaffold: [`lib/agent-country-enrichment-merge.ts`](../../lib/agent-country-enrichment-merge.ts), [`lib/morocco-research-pack-scaffold.ts`](../../lib/morocco-research-pack-scaffold.ts)
- Runner persist + education sync: [`agents/runner.ts`](../../agents/runner.ts)
- **Strict (raw Prisma `full_data` + `_agent` provenance)** — use after enrichment has written the contract:
  - `npx tsx scripts/launch-gate-country.ts --min=72`  
  - With CI exit code: append `--fail`.
- **Public Morocco bar (same merge as HTTP: static `countries.json` overlay, no `_agent` required)** — what visitors effectively see for “information launch”:
  - `npm run launch:gate:public` → `--as-public --min=72`
  - CI-style: `npm run launch:gate:public:ci` (adds `--fail`) — **GitHub Actions** runs this after `prisma migrate deploy` + `npm run seed` on each push/PR to `main` (see [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)).
- **GDP (World Bank WDI)** bulk fill + honest territory waiver:
  - `npm run db:backfill:economy-gdp-wb:apply` fills `full_data.economy.gdp_usd` where WB has a series; remaining jurisdictions get `gdp_wb_series_unavailable` (see [`lib/country-completeness.ts`](../../lib/country-completeness.ts) — still satisfies `economy_gdp_usd` for launch).
- Country page shows `gdp_coverage_note_fr` when the waiver applies (Réalité terrain block).
- After overlay, gaps in **strict** mode usually mean agents have not yet materialized `full_data`; for API-fed stats, see `npm run intelligence:world-bank:materialize` or the scheduled pipeline.

## Optional DB audit trail

`CountryObservation` + `IntelligenceSource` ([`prisma/schema.prisma`](../../prisma/schema.prisma)) can store append-only facts; the **public** launch gate does **not** require them when merged `full_data` satisfies the contract. The **strict** gate still expects `_agent` + coverage manifest on raw DB rows.
