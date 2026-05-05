import CountryFlag from '@/components/country/CountryFlag'

export default function EducationCard({
  country,
  iso2,
  title,
  bacRequired,
  cost,
}: {
  country: string
  iso2?: string
  title: string
  bacRequired: boolean
  cost: 'low' | 'medium' | 'high'
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#111827] p-5">
      <div className="mb-3 flex items-center gap-2">
        <CountryFlag iso2={iso2} />
        <h3 className="text-base font-black text-white">{country}</h3>
      </div>
      <p className="text-sm font-bold text-slate-200">{title}</p>
      <div className="mt-3 space-y-1 text-xs font-bold uppercase tracking-widest text-slate-400">
        <p>Bac required: {bacRequired ? 'yes' : 'no'}</p>
        <p>Cost: {cost}</p>
      </div>
    </article>
  )
}

