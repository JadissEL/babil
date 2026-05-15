/**
 * Variable CSS définie sur `document.documentElement` par `ObjectiveDockInline`
 * (`components/layout/SiteObjectiveDock.tsx`).
 * (hauteur mesurée du widget objectif compact en haut d’écran) ; fallback dans
 * `app/globals.css` sur `:root`.
 *
 * Utilisée pour métriques / spécimens QA ; le `main` de `SiteChrome` ne dépend plus
 * de cette variable pour le padding bas (dock retiré du bas d’écran).
 */
export const VF_OBJECTIVE_DOCK_HEIGHT_VAR = '--vf-objective-dock-height' as const;
