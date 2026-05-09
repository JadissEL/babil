import type { ReactNode } from 'react'

export default function RecommendationEngineLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-10 lg:px-8">{children}</div>
}
