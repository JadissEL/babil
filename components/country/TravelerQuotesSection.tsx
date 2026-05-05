'use client'

import { TravelerQuote } from '@/lib/country-experience-content'

type TravelerQuotesSectionProps = {
  countryName: string
  quotes: TravelerQuote[]
}

function quoteTone(sentiment: TravelerQuote['sentiment']) {
  if (sentiment === 'positive') return 'border-[#94dfbd] bg-[#e9f9f1] text-success'
  if (sentiment === 'neutral') return 'border-[#f2c27a] bg-[#fff5e7] text-warning'
  return 'border-[#f3afaf] bg-[#fff0f0] text-danger'
}

export function TravelerQuotesSection({ countryName, quotes }: TravelerQuotesSectionProps) {
  if (quotes.length !== 10) {
    return (
      <section className="rounded-2xl border border-line bg-surface p-6 shadow-soft">
        <h2 className="text-2xl font-black text-text">What Travelers Say About {countryName}</h2>
        <p className="mt-2 text-sm text-muted">Traveler feedback is currently being collected.</p>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-text">What Travelers Say About {countryName}</h2>
        <p className="mt-1 text-sm text-muted">
          Real, source-linked travel feedback grouped by sentiment to support better decisions.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quotes.map((quote) => (
          <article key={quote.id} className={`rounded-2xl border p-4 shadow-soft ${quoteTone(quote.sentiment)}`}>
            <p className="mb-3 text-2xl font-black opacity-70">"</p>
            <p className="text-sm font-medium leading-relaxed">{quote.text}</p>
            <div className="mt-4 border-t border-current/20 pt-3 text-xs font-bold uppercase tracking-wider">
              <a href={quote.sourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                {quote.sourceName}
              </a>
              {quote.author ? <span className="ml-2 normal-case tracking-normal">— {quote.author}</span> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
