# Country Intelligence Contract v2

Ce contrat cible est dérivé du produit actuel uniquement.  
Source canonique implémentée: `lib/country-intelligence-contract.ts`.

## Résumé

- Version: `country-intelligence-v2`
- Nombre de types d'informations: 50+
- Domaines:
  - identity
  - visa
  - friction
  - education
  - business
  - driving
  - community
  - signals
  - provenance

## Principes

1. Comparabilité inter-pays obligatoire.
2. Traçabilité de fraîcheur et coverage au niveau champ.
3. Distinction explicite:
   - données normalisées
   - signaux calculés
   - provenance/qualité.

## Champs critiques (extrait)

- identity:
  - `name`, `region`, `schengen_flag`
- visa:
  - `tourist_visa_score`, `study_visa_score`, `work_visa_score`, `business_visa_score`
  - `appointment_difficulty`
- friction:
  - `full_data.friction_score`
  - `full_data.appointment_audit.platform`
  - `full_data.appointment_audit.official_difficulty`
  - `full_data.appointment_audit.real_difficulty`
  - `full_data.appointment_audit.avg_wait_time`
  - `full_data.appointment_audit.issues[]`
- education:
  - `full_data.education_mobility.language_study`
  - `full_data.education_mobility.technical_training`
  - `full_data.education_mobility.short_courses`
  - `full_data.phd_studies` (facultatif ; section fiche pays Doctorat + compare / recommandation STUDY)
- business:
  - `full_data.visa_system.business.setup`
  - `full_data.street_food.opportunity`
- driving:
  - `full_data.driving_license.status`
  - `full_data.driving_license.conversion_possible`
- community:
  - `full_data.travel_reasons[]`
  - `full_data.traveler_quotes[]`
  - `full_data.traveler_quotes_meta.status`
- provenance:
  - `full_data._agent.updatedAt`
  - `full_data._agent.coverageManifest`
  - `full_data._agent.completeness.score`

## Acquisition potentielle par type

- API: wikipedia summary, world bank gdp, providers publics structurés.
- Scraping: appointment audits, friction details, visa business setup, education granularité.
- Generated contrôlé: normalisation, synthèse, scoring, coverage manifest, hints adaptifs.
- Hybrid: champs déjà présents + enrichissement incrémental.
