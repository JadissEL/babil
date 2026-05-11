import { CountryCard } from '@/components/country/CountryCard'
import type { CountryCardProps } from '@/components/country/CountryCard'

/** Pays prêt pour CountryCard + clé liste */
export type CountryGridItem = {
  id: string
  /** Route cible explicite ; évite d’exiger que `id` soit uniquement numérique (clés type `fr-showcase`). */
  countryRouteId?: string | number
} & Omit<CountryCardProps, 'onClick' | 'countryId'>

/**
 * Lien vers `/countries/[id]` si `countryRouteId` est défini, sinon si `id` est numérique.
 */
export default function CountryGrid({
  countries,
  onCountryNavigate,
  cardVariant = 'default',
}: {
  countries: CountryGridItem[]
  onCountryNavigate?: () => void
  /** Propagé vers chaque `CountryCard` (ex. maquette Stitch Atlas sur `/explorer`). */
  cardVariant?: 'default' | 'atlas'
}) {
  return (
    <div className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {countries.map((country) => {
        const { id, countryRouteId, ...rest } = country
        const routeTarget =
          countryRouteId != null
            ? String(countryRouteId)
            : /^\d+$/.test(String(id))
              ? String(id)
              : undefined
        return (
          <CountryCard
            key={id}
            {...rest}
            variant={cardVariant}
            {...(routeTarget != null ? { countryId: routeTarget } : {})}
            {...(onCountryNavigate ? { onNavigate: onCountryNavigate } : {})}
          />
        )
      })}
    </div>
  )
}
