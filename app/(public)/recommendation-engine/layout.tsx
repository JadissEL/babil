import type { ReactNode } from 'react';

/** Pulse (PAGE 07) manages its own max-width and padding inside `RecommendationEnginePage`. */
export default function RecommendationEngineLayout({ children }: { children: ReactNode }) {
  return <div className="min-w-0">{children}</div>;
}
