# Baseline factuelle produit (dérivée du code actuel)

## Architecture des pages orientées pays

- `app/page.tsx` : hero + top countries + points d'entrée modules.
- `app/(public)/explorer/page.tsx` : grille pays, filtres, tri, moteur d'exploration.
- `app/(public)/countries/[id]/page.tsx` : page pays détaillée (scores, friction, audit rendez-vous, **doctorat PhD** (`full_data.phd_studies` via `buildPhdStudies`), raisons/quotes, commentaires).
- `app/(public)/schengen/page.tsx` : vue Schengen + comparaison.
- `app/(public)/education/page.tsx` et sous-routes : mobilité formation.
- `app/(public)/business/page.tsx` : business et micro-business.
- `app/(public)/investment/page.tsx` : programmes CBI.
- `app/(public)/permis/page.tsx` : validité/conversion permis.

## Source réelle des données pays

1. API publiques:
   - `app/api/countries/route.ts`
   - `app/api/countries/[id]/route.ts`
2. Priorité fallback:
   - `lib/countries-fallback.ts` et `data/countries.json`
3. Enrichissements runtime UI:
   - `lib/enrich-country-api.ts`
4. Persistance:
   - `prisma/schema.prisma` (`Country` + `full_data`)

## Matrice section UI -> champ -> source

- Country card:
  - score final: dérivé `_finalScore` (`lib/enrich-country-api.ts`)
  - visa probability: moyenne `_visa.*`
  - friction/study/business tiers: dérivés
  - highlight image/place: `full_data.travel_reasons[0]` puis fallback curated/dynamique
- Country detail:
  - scores visa/final: top-level + dérivés
  - friction/acceptance/risk: `full_data.friction_*`, `acceptance_rate_morocco`, `appointment_audit.*`
  - sections immersion: `travel_reasons`, `traveler_quotes`
- Schengen:
  - `schengen_flag`, `full_data.friction_*`, `embassy_behavior`
- Education:
  - `full_data.education_mobility.*`
  - Doctorat décisionnel : `full_data.phd_studies` (`lib/country-phd-studies.ts`, composant `PhDStudiesSection`)
- Business:
  - `full_data.visa_system.business.*`, `full_data.street_food.*`, `full_data.cbi_program`
- Permis:
  - `full_data.driving_license.*`

## Cohérence observée

- Atouts:
  - un noyau unique `Country` réutilisé sur tous les modules.
  - un enrichissement visuel/score cohérent côté explorer.
- Incohérences:
  - formules de score divergentes entre explorer/detail/recommendation/probability.
  - fallback JSON très uniforme (faible différenciation inter-pays).
  - dualité `full_data` objet/string pas traitée de manière homogène dans toutes les routes.
