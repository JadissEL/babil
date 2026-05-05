import { CountryCard } from '@/components/country/CountryCard'
import type { CountryCardProps } from '@/components/country/CountryCard'

/** Pays prêt pour CountryCard + clé liste */
export type CountryGridItem = { id: string } & Omit<CountryCardProps, 'onClick' | 'countryId'>

export default function CountryGrid({ countries }: { countries: CountryGridItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {countries.map((country) => {
        const { id, ...rest } = country
        const numeric = /^\d+$/.test(String(id))
        return (
          <CountryCard
            key={id}
            {...rest}
            {...(numeric ? { countryId: id } : {})}
          />
        )
      })}
    </div>
  )
}
