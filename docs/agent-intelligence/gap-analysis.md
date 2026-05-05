# Gap Analysis: agent actuel vs modèle cible

## CRITIQUE

1. **Profondeur de collecte insuffisante**
   - Observé: collecte runtime centrée sur Wikipedia + GDP.
   - Impact: impossible de couvrir correctement les champs critiques friction/education/business/driving.

2. **Domaines de tâches non exploités en collecte spécialisée**
   - Observé: domaines query historiques/culture/politics/current_events ne déclenchent pas de collecteurs distincts.
   - Impact: faux sentiment de couverture.

3. **Absence de système de complétude par pays**
   - Observé: pas de score de coverage champ par champ, pas de manques explicites.
   - Impact: l'agent ne sait pas quand un pays est réellement prêt.

4. **Incohérence potentielle full_data objet/string**
   - Observé: selon route, parsing non homogène.
   - Impact: risques de régressions en API recommandation/probability.

## IMPORTANT

1. **Hétérogénéité scoring inter-routes**
   - Explorer/detail/recommendation/probability utilisent des logiques non alignées.
2. **Fallback très uniforme**
   - Différenciation inter-pays faible; limite la valeur comparative.
3. **Provenance incomplète**
   - Peu d'indices source/qualité par champ.
4. **Quote pipeline strict mais couverture faible**
   - Validation stricte positive, mais peu de pays alimentés.

## SECONDAIRE

1. **Taxonomie pays/ISO/Schengen parfois divergente**
2. **Mix terminologique FR/EN dans les labels**
3. **Manque de tableaux de bord de coverage exploitables côté admin**

## Statut après refonte implémentée

- Ajout d'un contrat champé 40+ (`lib/country-intelligence-contract.ts`).
- Ajout moteur de complétude et manifest (`lib/country-completeness.ts`).
- Runner passé en boucle **country-first** récursive avec tracking de manques critiques (`agents/runner.ts`).
- Santé admin enrichie avec métriques de complétude (`app/api/admin/agents/health/route.ts`).
