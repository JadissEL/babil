# Phasage d'implémentation

## Incrément 1 — Baseline + Contrat + Gap

- baseline factuelle:
  - `docs/agent-intelligence/baseline-map.md`
- contrat cible:
  - `lib/country-intelligence-contract.ts`
  - `docs/agent-intelligence/country-intelligence-contract-v2.md`
- gap:
  - `docs/agent-intelligence/gap-analysis.md`

Critère: modèle explicite et audit prêt.

## Incrément 2 — Runner country-first + complétude

- refactor orchestration:
  - `agents/runner.ts`
- moteur coverage:
  - `lib/country-completeness.ts`
- metadata persistées:
  - `full_data._agent.completeness`
  - `full_data._agent.coverageManifest`

Critère: chaque cycle traite prioritairement le pays le moins complet avec récursion.

## Incrément 3 — Exposition API/admin + compatibilité

- enrichir health API:
  - `app/api/admin/agents/health/route.ts`
- maintenir compat UI existante tout en ajoutant signaux de complétude.

Critère: visibilité admin de la progression de complétude.

## Incrément 4 — Hardening qualité

- calibration seuils:
  - `AGENT_COMPLETENESS_TARGET`
  - `AGENT_MAX_RECURSION_PASSES`
- amélioration continue sources/collecteurs par domaine.

Critère: réduction continue des champs critiques manquants et stabilité opérationnelle.
