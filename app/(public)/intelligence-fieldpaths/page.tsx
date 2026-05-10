import Link from 'next/link'
import { INTELLIGENCE_FIELDPATH_GLOSSARY } from '@/lib/intelligence-fieldpath-glossary'
import type { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'Glossaire intelligence (fieldPath) — VisaFlow',
  description:
    'Signification des chemins logiques (fieldPath) utilisés par le pipeline intelligence et la provenance des données pays.',
}

/** C.49 — Page publique : explique chaque fieldPath affiché dans la provenance fiche pays. */
export default function IntelligenceFieldPathsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted">Documentation produit</p>
      <h1 className="mt-2 text-2xl font-black tracking-tight text-text sm:text-3xl">Glossaire des champs intelligence</h1>
      <p className="mt-3 text-sm font-medium leading-relaxed text-muted">
        Les <code className="rounded bg-inset px-1 py-0.5 font-mono text-xs">fieldPath</code> identifient un fait stocké
        dans <code className="font-mono text-xs">CountryObservation</code>. Après matérialisation, la valeur peut aussi
        apparaître sous un chemin dans <code className="font-mono text-xs">full_data</code> (cache lecture API).
      </p>
      <p className="mt-2 text-sm font-medium text-muted">
        <Link href="/explorer" className="font-bold text-primary underline-offset-2 hover:underline">
          Retour à l&apos;explorateur
        </Link>
      </p>

      <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[10px] font-black uppercase tracking-wider text-muted">
              <th className="px-4 py-3">fieldPath</th>
              <th className="px-4 py-3">Libellé</th>
              <th className="px-4 py-3">Matérialisé dans full_data</th>
            </tr>
          </thead>
          <tbody>
            {INTELLIGENCE_FIELDPATH_GLOSSARY.map((row) => (
              <tr key={row.fieldPath} className="border-b border-line/80 align-top">
                <td className="px-4 py-3 font-mono text-xs text-text">{row.fieldPath}</td>
                <td className="px-4 py-3 font-bold text-text">{row.labelFr}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted">{row.materializedPathFr ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 space-y-4 text-sm font-medium leading-relaxed text-muted">
        {INTELLIGENCE_FIELDPATH_GLOSSARY.map((row) => (
          <section key={`d-${row.fieldPath}`}>
            <h2 className="text-xs font-black uppercase tracking-widest text-text">{row.labelFr}</h2>
            <p className="mt-1">{row.descriptionFr}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
