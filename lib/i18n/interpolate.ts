/**
 * Remplace `{name}` dans un modèle par les valeurs fournies. Clés manquantes = chaîne vide.
 */
export function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = params[key]
    return v === undefined || v === null ? '' : String(v)
  })
}
