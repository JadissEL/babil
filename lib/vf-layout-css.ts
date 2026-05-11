/**
 * Variable CSS définie sur `document.documentElement` par `SiteObjectiveDock`
 * (hauteur mesurée) ; fallback dans `app/globals.css` sur `:root`.
 *
 * Le `main` de `SiteChrome` applique déjà un `padding-bottom` basé sur cette variable.
 * Les pages à l’intérieur doivent éviter les anciens `pb-20` « pour le dock » : préférer
 * `pb-10`–`pb-12` pour l’espace visuel sous le dernier bloc.
 */
export const VF_OBJECTIVE_DOCK_HEIGHT_VAR = '--vf-objective-dock-height' as const;
